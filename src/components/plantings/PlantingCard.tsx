"use client";

import { useRouter } from 'next/navigation';

interface PlantingCardProps {
  id: string;
  plotIdentifier: string;
  plantingDate: string;
  bananaVariety: string;
  progressPercentage: number;
  currentStage: string;
  completedTasksCount?: number;
  totalTasksCount?: number;
}

export default function PlantingCard({
  id,
  plotIdentifier,
  plantingDate,
  bananaVariety,
  progressPercentage,
  currentStage,
  completedTasksCount,
  totalTasksCount,
}: PlantingCardProps) {
  const router = useRouter();

  return (
    <div
      className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/plantings/${id}`)}
    >
      <h3 className="text-xl font-semibold">{plotIdentifier}</h3>
      <p className="text-gray-600">Variety: {bananaVariety}</p>
      <p className="text-gray-600">Planted: {plantingDate}</p>
      <p className="text-gray-600">Stage: {currentStage.replace('_', ' ')}</p>
      {completedTasksCount !== undefined && totalTasksCount !== undefined && (
        <p className="text-gray-600">Tasks: {completedTasksCount}/{totalTasksCount}</p>
      )}
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-green-600 h-2.5 rounded-full"
            style={{ width: `${progressPercentage * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-1">{(progressPercentage * 100).toFixed(1)}% Complete</p>
      </div>
    </div>
  );
}