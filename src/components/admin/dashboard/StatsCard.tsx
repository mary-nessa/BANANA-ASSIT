import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: LucideIcon;
  iconColor: string;
  trend?: 'up' | 'down';
}

export default function StatsCard({ title, value, change, icon: Icon, iconColor, trend }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconColor}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <div className="flex items-baseline mt-2">
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
        {change && (
          <span className={`ml-2 text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}
