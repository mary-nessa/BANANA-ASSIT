"use client";

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

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

interface TaskListProps {
  plantingId: string;
  currentStage: string;
  tasks: Task[]; // Tasks passed as prop
  onStageComplete?: (stage: string) => void;
}

export default function TaskList({ plantingId, currentStage, tasks, onStageComplete }: TaskListProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  const stageOrder = [
    'LAND_PREPARATION',
    'PLANTING',
    'VEGETATIVE_GROWTH',
    'FLOWERING',
    'FRUIT_DEVELOPMENT',
    'HARVESTING',
    'UNASSIGNED',
  ];

  // Sync localTasks with prop changes
  useEffect(() => {
    setLocalTasks(tasks);
    console.log('TaskList tasks updated:', tasks);
  }, [tasks]);

  // Group tasks by stage
  const tasksByStage = localTasks.reduce((acc, task) => {
    let stage = task.category ? task.category.trim().toUpperCase() : 'UNASSIGNED';
    if (!stageOrder.includes(stage) && stage !== 'UNASSIGNED') {
      console.warn(`Unexpected category for task ID ${task.id}: ${task.category}, moving to UNASSIGNED`);
      stage = 'UNASSIGNED';
    }
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Log tasks by stage for debugging
  console.log('TaskList tasks by stage:', Object.keys(tasksByStage).map(stage => ({
    stage,
    taskCount: tasksByStage[stage].length,
    tasks: tasksByStage[stage].map(task => ({ id: task.id, description: task.description, category: task.category })),
  })));

  const completeTask = async (taskId: string) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      toast.error('You must be signed in to complete a task');
      return;
    }

    setLocalTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: 'COMPLETED' } : task
    ));

    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error(`Failed to complete task: ${response.status}`);
      toast.success('Task completed');

      const task = localTasks.find(t => t.id === taskId);
      if (task && onStageComplete) {
        const stage = task.category || 'UNASSIGNED';
        const stageTasks = tasksByStage[stage] || [];
        const allStageTasksCompleted = stageTasks.every(t => t.status === 'COMPLETED' || t.id === taskId);
        if (allStageTasksCompleted) {
          onStageComplete(stage);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setLocalTasks(tasks); // Revert on error
        toast.error(`Error completing task: ${error.message}`);
      }
    }
  };

  const isTaskActionable = (taskStage: string) => {
    const currentStageIndex = stageOrder.indexOf(currentStage);
    const taskStageIndex = stageOrder.indexOf(taskStage);
    return taskStageIndex <= currentStageIndex || taskStageIndex === -1 || taskStage === 'UNASSIGNED';
  };

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold mb-4">Tasks by Stage</h4>
      {Object.keys(tasksByStage).length === 0 ? (
        <p>No tasks available</p>
      ) : (
        <div className="space-y-6">
          {stageOrder.map(stage => (
            <div key={stage}>
              <h5 className="text-md font-medium text-gray-700 mb-2">
                {stage === 'UNASSIGNED' ? 'Unassigned Tasks' : stage.replace('_', ' ')}
                {` (${(tasksByStage[stage] || []).length} tasks)`}
              </h5>
              <div className="space-y-4">
                {tasksByStage[stage]?.length > 0 ? (
                  tasksByStage[stage].map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{task.description}</p>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()} | Priority: {task.priority} | Plot: {task.plotIdentifier}
                        </p>
                      </div>
                      {task.status === 'PENDING' ? (
                        <button
                          onClick={() => completeTask(task.id)}
                          disabled={isTaskActionable(task.category || 'UNASSIGNED') === false}
                          className={`flex items-center px-3 py-1 rounded ${
                            isTaskActionable(task.category || 'UNASSIGNED') === false
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          <FiCheckCircle className="mr-2" />
                          Complete
                        </button>
                      ) : (
                        <span className="text-green-600 font-medium">Completed</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No tasks for this stage</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}