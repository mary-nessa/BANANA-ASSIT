import React from 'react';

interface StageProgressProps {
  currentStage: string;
  progress: number;
  tasks: { stage: string; status: 'PENDING' | 'COMPLETED' }[];
}

const StageProgress: React.FC<StageProgressProps> = ({ currentStage, progress, tasks }) => {
  const stages = [
    'LAND_PREPARATION',
    'PLANTING',
    'VEGETATIVE_GROWTH',
    'FLOWERING',
    'FRUIT_DEVELOPMENT',
    'HARVESTING',
  ];

  const currentStageIndex = stages.indexOf(currentStage);
  const tasksByStage = tasks.reduce((acc, task) => {
    const stage = task.stage || 'UNASSIGNED';
    if (!acc[stage]) acc[stage] = { total: 0, completed: 0 };
    acc[stage].total += 1;
    if (task.status === 'COMPLETED') acc[stage].completed += 1;
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const calculatedProgress = stages.reduce((acc, stage, index) => {
    if (index > currentStageIndex) return acc;
    const stageTasks = tasksByStage[stage] || { total: 0, completed: 0 };
    const stageCompletion = stageTasks.total > 0 ? stageTasks.completed / stageTasks.total : 0;
    return acc + (stageCompletion / stages.length);
  }, 0);

  const effectiveProgress = Math.max(progress, calculatedProgress);

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">Progress Overview</h3>
      <div className="flex space-x-2 mb-3">
        {stages.map((stage, index) => (
          <div
            key={stage}
            className={`flex-1 text-center p-3 rounded-lg text-sm font-medium ${
              index <= currentStageIndex
                ? 'bg-green-200 text-green-900'
                : 'bg-gray-200 text-gray-700'
            } transition-all duration-300`}
          >
            {stage.replace('_', ' ')}
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-green-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${effectiveProgress}%` }}
        ></div>
      </div>
      <p className="text-sm font-medium text-gray-800 mt-2">
        {(effectiveProgress).toFixed(1)}% Complete
      </p>
    </div>
  );
};

export default StageProgress;