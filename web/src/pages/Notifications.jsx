import { Bell } from 'lucide-react';
import Card from '../components/ui/Card';
import { colors } from '../theme';

const Notifications = () => {
  return (
    <div className="p-6" style={{ backgroundColor: colors.background }}>
      <h1 className="text-3xl font-bold mb-8" style={{ color: colors.text }}>Notifications</h1>

      <Card className="p-12 text-center" style={{ backgroundColor: colors.surface }}>
        <Bell className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textTertiary }} />
        <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>No notifications</h3>
        <p style={{ color: colors.textSecondary }}>You're all caught up!</p>
      </Card>
    </div>
  );
};

export default Notifications;
