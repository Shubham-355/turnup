import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Check, X, UserPlus, Calendar, DollarSign, MessageCircle,
  Users, RefreshCw, CheckCircle, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { notificationService } from '../services/notificationService';
import { invitationService } from '../services/invitationService';
import { colors } from '../theme';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'PLAN_INVITE':
      return { icon: UserPlus, color: colors.primary, bg: `${colors.primary}20` };
    case 'JOIN_REQUEST':
      return { icon: UserPlus, color: '#8B5CF6', bg: '#8B5CF620' };
    case 'JOIN_APPROVED':
      return { icon: CheckCircle, color: colors.success, bg: `${colors.success}20` };
    case 'JOIN_REJECTED':
      return { icon: X, color: colors.error, bg: `${colors.error}20` };
    case 'NEW_ACTIVITY':
      return { icon: Calendar, color: colors.secondary, bg: `${colors.secondary}20` };
    case 'NEW_EXPENSE':
      return { icon: DollarSign, color: colors.success, bg: `${colors.success}20` };
    case 'EXPENSE_SETTLED':
      return { icon: Check, color: colors.success, bg: `${colors.success}20` };
    case 'NEW_MESSAGE':
      return { icon: MessageCircle, color: colors.primary, bg: `${colors.primary}20` };
    case 'MEMBER_JOINED':
      return { icon: Users, color: colors.info, bg: `${colors.info}20` };
    case 'MEMBER_LEFT':
      return { icon: Users, color: colors.warning, bg: `${colors.warning}20` };
    default:
      return { icon: Bell, color: colors.textSecondary, bg: `${colors.textSecondary}20` };
  }
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.data?.items || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Mark all as read error:', err);
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on type
    if (notification.data?.planId) {
      navigate(`/plans/${notification.data.planId}`);
    }
  };

  const handleApproveRequest = async (notification, e) => {
    e.stopPropagation();
    const requestId = notification.data?.requestId;
    if (!requestId) {
      toast.error('Invalid request');
      return;
    }

    setProcessingIds(prev => new Set([...prev, notification.id]));
    try {
      await invitationService.respondToJoinRequest(requestId, true);
      toast.success('Request approved! User has been added to the trip.');
      // Remove this notification or mark as processed
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (notification, e) => {
    e.stopPropagation();
    const requestId = notification.data?.requestId;
    if (!requestId) {
      toast.error('Invalid request');
      return;
    }

    setProcessingIds(prev => new Set([...prev, notification.id]));
    try {
      await invitationService.respondToJoinRequest(requestId, false);
      toast.success('Request rejected');
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64" style={{ backgroundColor: colors.background }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6" style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold" style={{ color: colors.text }}>Notifications</h1>
          {unreadCount > 0 && (
            <span 
              className="px-3 py-1 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: colors.primary }}
            >
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card className="p-12 text-center" style={{ backgroundColor: colors.surface }}>
          <Bell className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textTertiary }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>No notifications</h3>
          <p style={{ color: colors.textSecondary }}>You're all caught up!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
            const isProcessing = processingIds.has(notification.id);
            const isJoinRequest = notification.type === 'JOIN_REQUEST';

            return (
              <Card
                key={notification.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-l-4' : ''
                }`}
                style={{ 
                  backgroundColor: notification.isRead ? colors.surface : '#fff',
                  borderLeftColor: !notification.isRead ? colors.primary : 'transparent'
                }}
                onClick={() => !isJoinRequest && handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 
                          className="font-semibold mb-1"
                          style={{ color: colors.text }}
                        >
                          {notification.title}
                        </h3>
                        <p 
                          className="text-sm mb-2"
                          style={{ color: colors.textSecondary }}
                        >
                          {notification.body}
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" style={{ color: colors.textTertiary }} />
                          <span 
                            className="text-xs"
                            style={{ color: colors.textTertiary }}
                          >
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      {!notification.isRead && (
                        <div 
                          className="w-3 h-3 rounded-full shrink-0 mt-2"
                          style={{ backgroundColor: colors.primary }}
                        />
                      )}
                    </div>

                    {/* Action buttons for join requests */}
                    {isJoinRequest && (
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t" style={{ borderColor: colors.border }}>
                        <Button
                          size="sm"
                          onClick={(e) => handleApproveRequest(notification, e)}
                          disabled={isProcessing}
                          style={{ backgroundColor: colors.success }}
                        >
                          {isProcessing ? (
                            <Spinner size="sm" className="mr-2" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleRejectRequest(notification, e)}
                          disabled={isProcessing}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        {notification.data?.planId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/plans/${notification.data.planId}`);
                            }}
                          >
                            View Trip
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
