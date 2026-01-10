import { Bell } from 'lucide-react';
import Card from '../components/ui/Card';

const Notifications = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>

      <Card className="p-12 text-center">
        <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
        <p className="text-gray-600">You're all caught up!</p>
      </Card>
    </div>
  );
};

export default Notifications;
