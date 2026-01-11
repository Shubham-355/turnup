import { useState, useEffect } from 'react';
import { Users, UserMinus, Crown, Shield, MoreVertical, Mail, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { planService } from '../../services/planService';
import useAuthStore from '../../stores/authStore';
import { colors } from '../../theme';

const MembersList = ({ planId, plan }) => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [planId, plan]);

  const fetchMembers = async () => {
    try {
      // Assuming plan already contains members
      setMembers(plan?.members || []);
    } catch (error) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = plan?.ownerId === user?.id || plan?.createdBy?.id === user?.id;
  const isAdmin = members.some(
    m => m.userId === user?.id && (m.role === 'OWNER' || m.role === 'ADMIN')
  );

  const getRoleBadgeStyles = (role) => {
    switch (role) {
      case 'OWNER':
        return {
          backgroundColor: colors.warningLight,
          color: colors.warning,
        };
      case 'ADMIN':
        return {
          backgroundColor: colors.infoLight,
          color: colors.info,
        };
      default:
        return {
          backgroundColor: colors.surfaceLight,
          color: colors.textSecondary,
        };
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="w-3 h-3" />;
      case 'ADMIN':
        return <Shield className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await planService.removeMember(planId, memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success('Member removed successfully');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  return (
    <div>
      {/* Header */}
      <div 
        className="flex justify-between items-center mb-6 pb-4"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: colors.primaryLight + '20' }}
          >
            <Users className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
          <div>
            <h2 
              className="text-xl font-bold"
              style={{ color: colors.text }}
            >
              Members
            </h2>
            <p 
              className="text-sm"
              style={{ color: colors.textSecondary }}
            >
              {members.length} {members.length === 1 ? 'person' : 'people'} in this plan
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </Button>
        )}
      </div>

      {loading ? (
        <div 
          className="text-center py-12"
          style={{ color: colors.textSecondary }}
        >
          <div 
            className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3"
            style={{ 
              borderColor: colors.surfaceLight,
              borderTopColor: colors.primary 
            }}
          />
          Loading members...
        </div>
      ) : members.length === 0 ? (
        <Card className="p-12 text-center">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: colors.surfaceLight }}
          >
            <Users className="w-10 h-10" style={{ color: colors.textTertiary }} />
          </div>
          <h3 
            className="text-xl font-semibold mb-2"
            style={{ color: colors.text }}
          >
            No members yet
          </h3>
          <p 
            className="mb-6"
            style={{ color: colors.textSecondary }}
          >
            Share the invite code to add people to this plan
          </p>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Members
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const memberUser = member.user || {};
            const displayName = memberUser.displayName || memberUser.username || 'Unknown';
            const email = memberUser.email;
            const isSelf = memberUser.id === user?.id;
            
            return (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <Avatar user={memberUser} size="lg" />
                  
                  {/* Member Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-semibold"
                        style={{ color: colors.text }}
                      >
                        {displayName}
                      </span>
                      {isSelf && (
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: colors.successLight,
                            color: colors.success 
                          }}
                        >
                          You
                        </span>
                      )}
                    </div>
                    
                    {email && (
                      <div 
                        className="flex items-center gap-1 text-sm mt-0.5"
                        style={{ color: colors.textSecondary }}
                      >
                        <Mail className="w-3 h-3" />
                        {email}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right Side - Role & Actions */}
                <div className="flex items-center gap-3">
                  {/* Role Badge */}
                  <div 
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={getRoleBadgeStyles(member.role)}
                  >
                    {getRoleIcon(member.role)}
                    {member.role}
                  </div>
                  
                  {/* Actions (for admin/owner) */}
                  {isAdmin && !isSelf && member.role !== 'OWNER' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 rounded-lg transition-colors hover:bg-red-50"
                      title="Remove member"
                    >
                      <UserMinus 
                        className="w-4 h-4" 
                        style={{ color: colors.error }} 
                      />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Invite Code Section */}
      {plan?.inviteCode && (
        <div 
          className="mt-6 p-4 rounded-xl"
          style={{ 
            backgroundColor: colors.primaryLight + '10',
            border: `1px dashed ${colors.primary}40`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="text-sm font-medium mb-1"
                style={{ color: colors.text }}
              >
                Invite Code
              </p>
              <p 
                className="font-mono text-lg font-bold tracking-wider"
                style={{ color: colors.primary }}
              >
                {plan.inviteCode}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(plan.inviteCode);
                toast.success('Invite code copied!');
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersList;
