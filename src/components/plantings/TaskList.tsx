"use client";

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Define the Task interface
interface Task {
  id: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  plantingId: string;
  plotIdentifier: string;
  stage?: string;
}

// Define the raw API response interface
interface ApiTask {
  id: string;
  description: string;
  dueDate: string;
  status: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  plantingId: string;
  plotIdentifier: string;
  stage?: string;
}

// Type guard to narrow ApiTask status to 'PENDING' | 'COMPLETED'
const isValidTaskStatus = (status: string): status is 'PENDING' | 'COMPLETED' => {
  return status === 'PENDING' || status === 'COMPLETED';
};

// Helper function to convert ApiTask to Task with type safety
const convertToTask = (apiTask: ApiTask): Task => {
  let status: 'PENDING' | 'COMPLETED';
  if (isValidTaskStatus(apiTask.status)) {
    status = apiTask.status;
  } else {
    console.warn(`Invalid task status for task ID ${apiTask.id}: ${apiTask.status}, defaulting to PENDING`);
    status = 'PENDING';
  }
  return {
    id: apiTask.id,
    description: apiTask.description,
    dueDate: apiTask.dueDate,
    status,
    priority: apiTask.priority,
    category: apiTask.category,
    plantingId: apiTask.plantingId,
    plotIdentifier: apiTask.plotIdentifier,
    stage: apiTask.stage,
  };
};

interface TaskListProps {
  plantingId: string;
  currentStage: string;
  onStageComplete?: (stage: string) => void;
}

export default function TaskList({ plantingId, currentStage, onStageComplete }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState<string | null>(null);

  const stageOrder = [
    'LAND_PREPARATION',
    'PLANTING',
    'VEGETATIVE_GROWTH',
    'FLOWERING',
    'FRUIT_DEVELOPMENT',
    'HARVESTING',
    'UNASSIGNED',
  ];

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;

    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/plantings/${plantingId}/tasks`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to fetch tasks: ${response.status} - ${errorData.error || response.statusText}`);
        }

        // Verify the response before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('API response is not JSON');
        }

        const data = await response.json();

        // Verify that the response is an array
        if (!Array.isArray(data)) {
          console.error('API response is not an array:', data);
          throw new Error('API response is not an array');
        }

        console.log('Raw API response:', data);

        // Check for tasks with missing or malformed categories
        const tasksWithMissingCategory = data.filter((task: ApiTask) => !task.category);
        const tasksWithWhitespaceCategory = data.filter((task: ApiTask) => task.category && task.category.trim() !== task.category);
        const tasksWithDifferentCase = data.filter((task: ApiTask) => task.category && task.category.toUpperCase() !== task.category);

        if (tasksWithMissingCategory.length > 0) {
          console.warn('Tasks with missing category:', tasksWithMissingCategory);
        }
        if (tasksWithWhitespaceCategory.length > 0) {
          console.warn('Tasks with whitespace in category:', tasksWithWhitespaceCategory);
        }
        if (tasksWithDifferentCase.length > 0) {
          console.warn('Tasks with case sensitivity issues in category:', tasksWithDifferentCase);
        }

        const validatedTasks: Task[] = data.map(convertToTask) as Task[];
        setTasks(validatedTasks);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error fetching tasks:', error);
          toast.error(`Error fetching tasks: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [plantingId]);

  const completeTask = async (taskId: string) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      toast.error('You must be signed in to complete a task');
      return;
    }

    setIsCompleting(taskId);
    const originalTasks = [...tasks];
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, status: 'COMPLETED' as const } : task
    );
    setTasks(updatedTasks);

    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to complete task: ${response.status} - ${errorData.error || response.statusText}`);
      }

      toast.success('Task completed');

      const task = updatedTasks.find(t => t.id === taskId);
      if (task) {
        const stage = task.category || 'UNASSIGNED';
        const stageTasks = tasksByStage[stage] || [];
        const allStageTasksCompleted = stageTasks.every(
          t => t.status === 'COMPLETED' || t.id === taskId
        );

        if (allStageTasksCompleted && onStageComplete) {
          onStageComplete(stage);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error completing task:', error);
        setTasks(originalTasks);
        toast.error(`Error completing task: ${error.message}`);
      }
    } finally {
      setIsCompleting(null);
    }
  };

  // Defensive tasksByStage reducer
  const tasksByStage = tasks.reduce((acc, task) => {
    // Handle missing, whitespace, and case sensitivity in category
    let stage = task.category ? task.category.trim().toUpperCase() : 'UNASSIGNED';

    // Additional validation for unexpected category values
    if (!stageOrder.includes(stage) && stage !== 'UNASSIGNED') {
      console.warn(`Unexpected category for task ID ${task.id}: ${stage}, moving to UNASSIGNED`);
      stage = 'UNASSIGNED';
    }

    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  console.log('Final tasks by stage:', tasksByStage);

  // Temporary: Warn if LAND_PREPARATION doesn't have 5 tasks
  const expectedLandPrepTasks = 5;
  const landPrepTasks = tasksByStage['LAND_PREPARATION'] || [];
  if (landPrepTasks.length !== expectedLandPrepTasks && !loading) {
    toast.error(
      `Expected ${expectedLandPrepTasks} tasks for Land Preparation, but found ${landPrepTasks.length}. Check API response or task categories.`
    );
  }

  const isTaskActionable = (taskStage: string) => {
    const currentStageIndex = stageOrder.indexOf(currentStage);
    const taskStageIndex = stageOrder.indexOf(taskStage);
    return taskStageIndex <= currentStageIndex || taskStageIndex === -1;
  };

  if (loading) return <p>Loading tasks...</p>;

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold mb-4">Tasks by Stage</h4>
      {Object.keys(tasksByStage).length === 0 ? (
        <p>No tasks available</p>
      ) : (
        <div className="space-y-6">
          {stageOrder.map(stage => {
            if (!tasksByStage[stage]) return null;
            return (
              <div key={stage}>
                <h5 className="text-md font-medium text-gray-700 mb-2">
                  {stage === 'UNASSIGNED' ? 'Unassigned Tasks' : stage.replace('_', ' ')}
                  {` (${tasksByStage[stage].length} tasks)`}
                </h5>
                <div className="space-y-4">
                  {tasksByStage[stage].map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{task.description}</p>
                        <p className="text-sm text-gray-500">
                          Due: {task.dueDate} | Priority: {task.priority} | Plot: {task.plotIdentifier}
                        </p>
                      </div>
                      {task.status === 'PENDING' ? (
                        <button
                          onClick={() => completeTask(task.id)}
                          disabled={isCompleting === task.id || !isTaskActionable(task.category || 'UNASSIGNED')}
                          className={`flex items-center px-3 py-1 rounded ${
                            isCompleting === task.id || !isTaskActionable(task.category || 'UNASSIGNED')
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {isCompleting === task.id ? <FiLoader className="animate-spin mr-2" /> : <FiCheckCircle className="mr-2" />}
                          Complete
                        </button>
                      ) : (
                        <span className="text-green-600 font-medium">Completed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}