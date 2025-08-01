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

        const allTasks = [
          ...upcomingData.map((t: ApiTask) => convertToTask(t)),
          ...todayData.map((t: ApiTask) => convertToTask(t)),
          ...overdueData.map((t: ApiTask) => convertToTask(t)),
        ].reduce((unique: Task[], task: Task) => {
          if (!unique.find((t: Task) => t.id === task.id)) unique.push(task);
          return unique;
        }, [] as Task[]);
        console.log('Fetched tasks:', allTasks);
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

  const tasksByPlanting = filteredTasks.reduce((acc, task) => {
    const plantingId = task.plantingId;
    if (!acc[plantingId]) {
      acc[plantingId] = { plotIdentifier: task.plotIdentifier, tasksByStage: {} as Record<string, Task[]> };
    }
    const stage = task.stage || 'UNASSIGNED';
    if (!acc[plantingId].tasksByStage[stage]) {
      acc[plantingId].tasksByStage[stage] = [];
    }
    acc[plantingId].tasksByStage[stage].push(task);
    return acc;
  }, {} as Record<string, { plotIdentifier: string; tasksByStage: Record<string, Task[]> }>);

  if (loading) return (
    <div className="p-4">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Task Management</h1>
      
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'upcoming' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'today' 
              ? 'bg-green-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'overdue' 
              ? 'bg-red-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Overdue
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(tasksByPlanting).map(([plantingId, { plotIdentifier, tasksByStage }]) => (
          <div key={plantingId} className="bg-white p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Planting {plotIdentifier} <span className="text-gray-500">({Object.values(tasksByStage).flat().length} tasks)</span>
            </h2>
            <div className="space-y-4">
              {STAGES.map((stage) => {
                const stageTasks = tasksByStage[stage] || [];
                if (stageTasks.length === 0) return null;
                return (
                  <div key={stage} className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-3 text-gray-700">
                      {stage.replace('_', ' ')} <span className="text-gray-500 text-sm">({stageTasks.length})</span>
                    </h3>
                    <div className="space-y-3">
                      {stageTasks.map((task) => (
                        <div key={task.id} className="p-3 bg-white rounded-md flex justify-between items-center shadow-xs">
                          <div>
                            <p className="font-medium text-gray-800">{task.description}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                              <span className={`text-xs ${
                                task.priority === 'HIGH' ? 'text-red-600' :
                                task.priority === 'MEDIUM' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          {task.status === 'PENDING' ? (
                            <button
                              onClick={() => completeTask(task.id)}
                              disabled={isCompleting === task.id}
                              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                                isCompleting === task.id 
                                  ? 'bg-gray-300 text-gray-600' 
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                            >
                              {isCompleting === task.id ? <FiLoader className="animate-spin mr-2" /> : <FiCheckCircle className="mr-2" />}
                              Complete
                            </button>
                          ) : (
                            <span className="text-green-600 text-sm font-medium">Completed</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(tasksByPlanting).length === 0 && (
          <div className="bg-white p-4 rounded-lg text-center">
            <p className="text-gray-500">No tasks found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;