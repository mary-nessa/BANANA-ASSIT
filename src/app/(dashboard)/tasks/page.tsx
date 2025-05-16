"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

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

const isValidTaskStatus = (status: string): status is 'PENDING' | 'COMPLETED' => {
  return status === 'PENDING' || status === 'COMPLETED';
};

const convertToTask = (apiTask: ApiTask): Task => {
  let status: 'PENDING' | 'COMPLETED';
  if (isValidTaskStatus(apiTask.status)) {
    status = apiTask.status;
  } else {
    console.warn(`Invalid task status received: ${apiTask.status}, defaulting to PENDING`);
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

const STAGES = [
  'LAND_PREPARATION',
  'PLANTING',
  'VEGETATIVE_GROWTH',
  'FLOWERING',
  'FRUIT_DEVELOPMENT',
  'HARVESTING',
  'UNASSIGNED',
];

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'today' | 'overdue'>('upcoming');
  const router = useRouter();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      router.push('/auth/signin');
      return;
    }

    const fetchTasks = async () => {
      try {
        const [upcomingResponse, todayResponse, overdueResponse] = await Promise.all([
          fetch('/api/tasks/upcoming', { headers: { Authorization: `Bearer ${authToken}` } }),
          fetch('/api/tasks/today', { headers: { Authorization: `Bearer ${authToken}` } }),
          fetch('/api/tasks/overdue', { headers: { Authorization: `Bearer ${authToken}` } }),
        ]);

        const checkResponse = async (response: Response, type: string) => {
          if (!response.ok) throw new Error(`Failed to fetch ${type} tasks: ${response.status}`);
          return response.json();
        };

        const [upcomingData, todayData, overdueData] = await Promise.all([
          checkResponse(upcomingResponse, 'upcoming'),
          checkResponse(todayResponse, 'today'),
          checkResponse(overdueResponse, 'overdue'),
        ]);

        // Explicitly type the map parameter as ApiTask
        const allTasks = [
  ...upcomingData.map((t: ApiTask) => convertToTask(t)),
  ...todayData.map((t: ApiTask) => convertToTask(t)),
  ...overdueData.map((t: ApiTask) => convertToTask(t)),
].reduce((unique: Task[], task: Task) => {
  if (!unique.find((t: Task) => t.id === task.id)) unique.push(task);
  return unique;
}, [] as Task[]);
        console.log('Fetched tasks:', allTasks); // Debug log
        setTasks(allTasks);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Error fetching tasks: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [router]);

  const completeTask = async (taskId: string) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      toast.error('You must be signed in to complete a task');
      router.push('/auth/signin');
      return;
    }

    setIsCompleting(taskId);
    const originalTasks = [...tasks];
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: 'COMPLETED' as const } : task
    );
    setTasks(updatedTasks);

    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error(`Failed to complete task: ${response.status}`);
      toast.success('Task completed');
    } catch (error) {
      if (error instanceof Error) {
        setTasks(originalTasks);
        toast.error(`Error completing task: ${error.message}`);
      }
    } finally {
      setIsCompleting(null);
    }
  };

  const tasksByStage = tasks.reduce((acc, task) => {
    const stage = task.stage || 'UNASSIGNED';
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const filteredTasks = tasks.filter((task) => {
    const today = new Date().toISOString().split('T')[0];
    switch (activeTab) {
      case 'today':
        return task.dueDate === today && task.status === 'PENDING';
      case 'overdue':
        return new Date(task.dueDate) < new Date(today) && task.status === 'PENDING';
      default:
        return task.status === 'PENDING';
    }
  });

  if (loading) return (
    <div className="p-4">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6">Task Management</h1>
      <div className="mb-4">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`mr-2 px-4 py-2 rounded ${activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-blue-200 hover:bg-blue-300'}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('today')}
          className={`mr-2 px-4 py-2 rounded ${activeTab === 'today' ? 'bg-green-600 text-white' : 'bg-green-200 hover:bg-green-300'}`}
        >
          Today
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2 rounded ${activeTab === 'overdue' ? 'bg-red-600 text-white' : 'bg-red-200 hover:bg-red-300'}`}
        >
          Overdue
        </button>
      </div>
      <div className="space-y-6">
        {STAGES.map((stage) => {
          const stageTasks = tasksByStage[stage]?.filter((t) => filteredTasks.some((ft) => ft.id === t.id)) || [];
          if (stageTasks.length === 0) return null;
          return (
            <div key={stage} className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">{stage.replace('_', ' ')} ({stageTasks.length})</h2>
              <div className="space-y-2">
                {stageTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">{task.description}</p>
                      <p className="text-sm text-gray-500">Due: {task.dueDate} | Priority: {task.priority}</p>
                    </div>
                    {task.status === 'PENDING' ? (
                      <button
                        onClick={() => completeTask(task.id)}
                        disabled={isCompleting === task.id}
                        className={`flex items-center px-3 py-1 rounded ${isCompleting === task.id ? 'bg-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}
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
        {tasksByStage['UNASSIGNED'] && tasksByStage['UNASSIGNED'].filter((t) => filteredTasks.some((ft) => ft.id === t.id)).length > 0 && (
          <div key="UNASSIGNED" className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Unassigned Tasks ({tasksByStage['UNASSIGNED'].filter((t) => filteredTasks.some((ft) => ft.id === t.id)).length})</h2>
            <div className="space-y-2">
              {tasksByStage['UNASSIGNED'].filter((t) => filteredTasks.some((ft) => ft.id === t.id)).map((task) => (
                <div key={task.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">{task.description}</p>
                    <p className="text-sm text-gray-500">Due: {task.dueDate} | Priority: {task.priority}</p>
                  </div>
                  {task.status === 'PENDING' ? (
                    <button
                      onClick={() => completeTask(task.id)}
                      disabled={isCompleting === task.id}
                      className={`flex items-center px-3 py-1 rounded ${isCompleting === task.id ? 'bg-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}
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
        )}
      </div>
    </div>
  );
};

export default TasksPage;