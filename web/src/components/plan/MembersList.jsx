import { useState, useEffect } from 'react';
import { Users, UserMinus, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { planService } from '../../services/planService';
import useAuthStore from '../../stores/authStore';

const MembersList = ({ planId, plan }) => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [planId]);

  const fetchMembers = async () => {
    try {
      // Assuming plan already contains members
      setMembers(plan.members || []);
    } catch (error) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = plan.createdBy?.id === user?.id;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Members ({members.length})
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading members...</div>
      ) : members.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No members yet</h3>
          <p className="text-gray-600">Invite people to join this plan</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <Card key={member.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {(member.user?.displayName || member.user?.username)?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        {member.user?.displayName || member.user?.username}
                      </h3>
                      {member.role === 'OWNER' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    {member.user?.email && (
                      <div className="text-sm text-gray-600">{member.user?.email}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">{member.role}</div>
                  </div>
                </div>
                {isOwner && member.user?.id !== user?.id && (
                  <Button variant="ghost" size="sm">
                    <UserMinus className="w-4 h-4 text-red-600" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersList;
