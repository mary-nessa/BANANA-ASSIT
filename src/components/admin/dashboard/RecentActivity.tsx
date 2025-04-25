interface Activity {
  id: string;
  type: 'diagnosis' | 'identification' | 'user_login' | 'user_register' | 'feedback';
  user: string;
  details: string;
  timestamp: string;
  rating?: number;
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'diagnosis':
        return '🔍';
      case 'identification':
        return '🌱';
      case 'user_login':
        return '👤';
      case 'user_register':
        return '✨';
      case 'feedback':
        return '💭';
      default:
        return '📝';
    }
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return null;
    return '⭐'.repeat(rating);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (          <div key={activity.id} className="flex items-start space-x-3">
            <span className="text-2xl">{getActivityIcon(activity.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-900">
                  {activity.user}
                </p>
                {activity.type === 'feedback' && activity.rating && (
                  <p className="text-sm text-amber-500">
                    {getRatingStars(activity.rating)}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {activity.details}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
