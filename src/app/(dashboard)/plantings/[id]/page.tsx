"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiChevronDown, FiChevronUp, FiLoader, FiCheckCircle } from 'react-icons/fi';
import StageProgress from '@/components/plantings/StageProgress';
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

interface Planting {
  id: string;
  plotIdentifier: string;
  plantingDate: string;
  expectedHarvestDate: string;
  currentStage: string;
  daysFromPlanting: number;
  numberOfPlants: number;
  bananaVariety: string;
  upcomingTasks: Task[];
  completedTasksCount: number;
  totalTasksCount: number;
  progressPercentage: number;
}

export default function PlantingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [planting, setPlanting] = useState<Planting | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState<string | null>(null);
  const stages = [
    'LAND_PREPARATION',
    'PLANTING',
    'VEGETATIVE_GROWTH',
    'FLOWERING',
    'FRUIT_DEVELOPMENT',
    'HARVEST',
    'POST_HARVEST',
  ];

  const fetchPlantingData = async (authToken: string) => {
    try {
      const plantingResponse = await fetch(`/api/plantings/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!plantingResponse.ok) throw new Error(`Failed to fetch planting: ${plantingResponse.status}`);
      const plantingData: Planting = await plantingResponse.json();
      setPlanting(plantingData);

      const tasksResponse = await fetch(`/api/plantings/${id}/tasks`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!tasksResponse.ok) throw new Error(`Failed to fetch tasks: ${tasksResponse.status}`);
      const tasksData: Task[] = await tasksResponse.json();
      console.log('Fetched tasks:', tasksData);
      setTasks(tasksData);

      if (plantingData.totalTasksCount !== tasksData.length) {
        toast.error(
          `Task count mismatch: Expected ${plantingData.totalTasksCount} tasks, but fetched ${tasksData.length}. Some tasks may be missing.`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error fetching data: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      router.push('/auth/signin');
      return;
    }

    fetchPlantingData(authToken);
  }, [id, router]);  // Group all tasks under the current stage regardless of their category
  const tasksByStage = tasks.reduce((acc, task) => {
    // All tasks belong to the current stage since backend returns only tasks for current stage
    const stage = planting?.currentStage || 'UNASSIGNED';
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

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
      if (!response.ok) {
        throw new Error(
          `Failed to complete task: ${response.status} - ${response.statusText}`
        );
      }
      toast.success('Task completed');
      await fetchPlantingData(authToken);

      if (planting) {
        const currentStageIndex = stages.indexOf(planting.currentStage);
        const currentStageTasks = tasksByStage[planting.currentStage] || [];
        const allCurrentStageTasksCompleted = currentStageTasks.every(
          (task) => task.status === 'COMPLETED' || task.id === taskId
        );

        if (
          allCurrentStageTasksCompleted &&
          currentStageIndex < stages.length - 1
        ) {
          const nextStage = stages[currentStageIndex + 1];
          setPlanting((prev) =>
            prev ? { ...prev, currentStage: nextStage } : prev
          );
          setExpandedStage(nextStage);
          toast.success(`Progressed to ${nextStage.replace('_', ' ')} stage`);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setTasks(originalTasks);
        toast.error(`Error completing task: ${error.message}`);
      }
    } finally {
      setIsCompleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <FiLoader className="animate-spin text-green-600 text-4xl" />
          <p className="text-lg font-medium text-gray-700">Loading Planting Details...</p>
        </div>
      </div>
    );
  }

  if (!planting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Planting Not Found</h2>
          <p className="text-gray-600 mt-2">
            The planting you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
          >
            <FiArrowLeft className="mr-2" /> Go Back
          </button>
        </div>
      </div>
    );
  }
  const isTaskActionable = (taskStage: string) => {
    // Tasks are always actionable in the current stage since backend only returns tasks for current stage
    return true;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 lg:p-10 bg-gradient-to-br from-green-50 to-gray-50 min-h-screen">
      <header className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2.5 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
        >
          <FiArrowLeft className="mr-2 text-lg" /> Back to Plantings
        </button>
        <div className="mt-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              {planting.plotIdentifier}
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              {planting.bananaVariety} • Planted: {new Date(planting.plantingDate).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg inline-flex items-center self-start md:self-auto">
            <span className="font-semibold">
              {planting.currentStage.replace('_', ' ')}
            </span>
          </div>
        </div>
      </header>

      <section className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-green-600 mb-6 pb-2 border-b border-gray-100">
          Planting Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Planting Date</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(planting.plantingDate).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Expected Harvest</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(planting.expectedHarvestDate).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Days from Planting</p>
            <p className="text-lg font-semibold text-gray-800">
              {planting.daysFromPlanting} days
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Number of Plants</p>
            <p className="text-lg font-semibold text-gray-800">
              {planting.numberOfPlants.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Banana Variety</p>
            <p className="text-lg font-semibold text-gray-800">
              {planting.bananaVariety}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Progress</p>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${planting.progressPercentage}%` }}
                ></div>
              </div>
              <span className="text-lg font-semibold text-gray-800">
                {(planting.progressPercentage).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Tasks Completed</p>
            <p className="text-lg font-semibold text-gray-800">
              {planting.completedTasksCount}/{planting.totalTasksCount}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <StageProgress
          currentStage={planting.currentStage}
          progress={planting.progressPercentage}
          tasks={tasks.map((task) => ({ stage: task.category || '', status: task.status }))}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-green-600 mb-6 pb-2 border-b border-gray-200">
          Tasks by Growth Stage
        </h2>
        <div className="space-y-4">
          {stages.map((stage) => {
            const stageTasks = tasksByStage[stage] || [];
            const isExpanded = expandedStage === stage;
            const isCurrentStage = planting.currentStage === stage;
            const allTasksCompleted = stageTasks.every(task => task.status === 'COMPLETED');
            
            return (
              <div key={stage} className="mb-4">
                <button
                  onClick={() => setExpandedStage(isExpanded ? null : stage)}
                  className={`w-full text-left p-4 rounded-xl flex justify-between items-center transition-all duration-200 shadow-sm hover:shadow-md ${
                    isCurrentStage
                      ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                      : allTasksCompleted
                      ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    {isCurrentStage && (
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                    )}
                    <span className="text-lg font-semibold text-gray-800">
                      {stage.replace('_', ' ')} ({stageTasks.length} tasks)
                    </span>
                    {allTasksCompleted && stageTasks.length > 0 && (
                      <span className="ml-3 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <FiChevronUp className="text-gray-600 text-xl" />
                  ) : (
                    <FiChevronDown className="text-gray-600 text-xl" />
                  )}
                </button>
                {isExpanded && (
                  <div className="mt-3 space-y-3 pl-2 border-l-2 border-gray-200 ml-3">
                    {stageTasks.length === 0 ? (
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-gray-600">No tasks for this stage</p>
                      </div>
                    ) : (
                      stageTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-4 rounded-lg shadow-sm border transition-all ${
                            task.status === 'COMPLETED'
                              ? 'bg-gray-50 border-gray-200'
                              : 'bg-white border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-start">
                                {task.status === 'COMPLETED' ? (
                                  <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-1 mr-3 flex-shrink-0"></div>
                                )}
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {task.description}
                                  </p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                      Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                                      {task.priority} priority
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        task.status === 'COMPLETED'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}
                                    >
                                      {task.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {task.status === 'PENDING' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  completeTask(task.id);
                                }}                                disabled={
                                  isCompleting === task.id || !isTaskActionable(task.stage || task.category || '')
                                }
                                className={`ml-4 px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
                                  isCompleting === task.id || !isTaskActionable(task.category)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                                }`}
                              >
                                {isCompleting === task.id ? (
                                  <FiLoader className="animate-spin mr-2" />
                                ) : (
                                  <FiCheckCircle className="mr-2" />
                                )}
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {tasksByStage['UNASSIGNED'] && tasksByStage['UNASSIGNED'].length > 0 && (
            <div className="mb-4">
              <button
                onClick={() =>
                  setExpandedStage(expandedStage === 'UNASSIGNED' ? null : 'UNASSIGNED')
                }
                className="w-full text-left p-4 bg-white rounded-xl flex justify-between items-center hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
              >
                <span className="text-lg font-semibold text-gray-800">
                  Unassigned Tasks ({tasksByStage['UNASSIGNED'].length} tasks)
                </span>
                {expandedStage === 'UNASSIGNED' ? (
                  <FiChevronUp className="text-gray-600 text-xl" />
                ) : (
                  <FiChevronDown className="text-gray-600 text-xl" />
                )}
              </button>
              {expandedStage === 'UNASSIGNED' && (
                <div className="mt-3 space-y-3 pl-2 border-l-2 border-gray-200 ml-3">
                  {tasksByStage['UNASSIGNED'].map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg shadow-sm border transition-all ${
                        task.status === 'COMPLETED'
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start">
                            {task.status === 'COMPLETED' ? (
                              <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-1 mr-3 flex-shrink-0"></div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">
                                {task.description}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                                  {task.priority} priority
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    task.status === 'COMPLETED'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {task.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {task.status === 'PENDING' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              completeTask(task.id);
                            }}
                            disabled={isCompleting === task.id || !isTaskActionable(task.stage || task.category || '')}
                            className={`ml-4 px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
                              isCompleting === task.id || !isTaskActionable(task.category)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                            }`}
                          >
                            {isCompleting === task.id ? (
                              <FiLoader className="animate-spin mr-2" />
                            ) : (
                              <FiCheckCircle className="mr-2" />
                            )}
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}