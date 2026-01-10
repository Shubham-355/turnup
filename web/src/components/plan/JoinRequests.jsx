import { useState, useEffect } from 'react';
import { UserPlus, Check, X, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { invitationService } from '../../services/invitationService';
import { colors } from '../../theme';

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

const JoinRequests = ({ planId, isOwner, isAdmin }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const fetchRequests = async () => {
    try {
      const response = await invitationService.getJoinRequests(planId);
      // Filter to only show pending requests
      const pendingRequests = (response.data?.items || []).filter(r => r.status === 'PENDING');
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Failed to load join requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setProcessingIds(prev => new Set([...prev, requestId]));
    try {
      await invitationService.respondToJoinRequest(requestId, true);
      toast.success('Request approved! User has been added to the trip.');
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleReject = async (requestId) => {
    setProcessingIds(prev => new Set([...prev, requestId]));
    try {
      await invitationService.respondToJoinRequest(requestId, false);
      toast.success('Request rejected');
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Only show for owners and admins
  if (!isOwner && !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Card className="p-6" style={{ backgroundColor: colors.surface }}>
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="p-6" style={{ backgroundColor: colors.surface }}>
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${colors.secondary}20` }}
          >
            <UserPlus className="w-5 h-5" style={{ color: colors.secondary }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: colors.text }}>Join Requests</h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              No pending requests
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6" style={{ backgroundColor: colors.surface }}>
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${colors.secondary}20` }}
        >
          <UserPlus className="w-5 h-5" style={{ color: colors.secondary }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: colors.text }}>Join Requests</h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {requests.length} pending request{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((request) => {
          const isProcessing = processingIds.has(request.id);
          
          return (
            <div 
              key={request.id} 
              className="p-4 rounded-xl border"
              style={{ backgroundColor: colors.background, borderColor: colors.border }}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ 
                    backgroundColor: request.user?.avatar ? 'transparent' : `${colors.primary}20`
                  }}
                >
                  {request.user?.avatar ? (
                    <img 
                      src={request.user.avatar} 
                      alt={request.user.displayName || request.user.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6" style={{ color: colors.primary }} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold" style={{ color: colors.text }}>
                    {request.user?.displayName || request.user?.username || 'Unknown User'}
                  </h4>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    @{request.user?.username}
                  </p>
                  {request.message && (
                    <p 
                      className="text-sm mt-2 p-3 rounded-lg"
                      style={{ backgroundColor: colors.surface, color: colors.text }}
                    >
                      "{request.message}"
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-3 h-3" style={{ color: colors.textTertiary }} />
                    <span className="text-xs" style={{ color: colors.textTertiary }}>
                      {formatTimeAgo(request.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
                <Button
                  size="sm"
                  onClick={() => handleApprove(request.id)}
                  disabled={isProcessing}
                  style={{ backgroundColor: colors.success }}
                  className="flex-1"
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
                  onClick={() => handleReject(request.id)}
                  disabled={isProcessing}
                  className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default JoinRequests;
