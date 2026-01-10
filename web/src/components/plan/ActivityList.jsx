import { MapPin, Clock, Edit, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatDateTime } from '../../utils/dateUtils';

const ActivityList = ({ activities, onEdit, onDelete }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities yet</h3>
        <p className="text-gray-600">Add your first activity to start planning!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{activity.name}</h3>
              {activity.description && (
                <p className="text-gray-600 mb-3">{activity.description}</p>
              )}
              <div className="space-y-2 text-sm text-gray-600">
                {activity.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                    <span>{activity.location}</span>
                  </div>
                )}
                {activity.dateTime && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-purple-600" />
                    <span>{formatDateTime(activity.dateTime)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(activity)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(activity.id)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ActivityList;
