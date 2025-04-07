// components/admin/dashboard/StatsCard.tsx
export default function StatsCard({
    title,
    value,
    trend,
    icon,
    description,
    className = ''
  }: {
    title: string;
    value: string;
    trend?: 'up' | 'down';
    icon?: string;
    description?: string;
    className?: string;
  }) {
    return (
      <div className={`bg-white p-6 rounded-xl shadow-sm ${className}`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
            {description && (
              <p className="text-xs text-gray-400 mt-1">{description}</p>
            )}
          </div>
          {icon && <span className="text-2xl">{icon}</span>}
        </div>
        {trend && (
          <div className={`mt-2 text-sm ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? '↑' : '↓'} Trend
          </div>
        )}
      </div>
    );
  }