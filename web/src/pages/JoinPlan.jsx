import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, Calendar, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { invitationService } from '../services/invitationService';
import { colors } from '../theme';

const JoinPlan = () => {
  const { invitationCode } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchInvitation();
  }, [invitationCode]);

  const fetchInvitation = async () => {
    try {
      const response = await invitationService.getInvitation(invitationCode);
      // The API returns the plan directly in response.data
      setPlan(response.data);
    } catch (error) {
      toast.error('Invalid or expired invitation');
      setTimeout(() => navigate('/dashboard'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPlan = async () => {
    setJoining(true);
    try {
      await invitationService.acceptInvitation(invitationCode);
      toast.success('Successfully joined the plan!');
      navigate(`/plans/${plan.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join plan');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: colors.background }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Flame size={48} style={{ color: colors.primary }} />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: colors.text }}>You're Invited!</h1>
          <p style={{ color: colors.textSecondary }}>Join your friends and start planning</p>
        </div>

        {plan && (
          <Card className="p-8" style={{ backgroundColor: colors.surface }}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.primary }}>
                <Calendar className="w-8 h-8" style={{ color: colors.white }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>{plan.name}</h2>
              {plan.description && (
                <p className="mb-4" style={{ color: colors.textSecondary }}>{plan.description}</p>
              )}
              <div className="flex items-center justify-center gap-4 text-sm">
                <span 
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: plan.category === 'NIGHTOUT' ? `${colors.nightout}20` : `${colors.trip}20`,
                    color: plan.category === 'NIGHTOUT' ? colors.nightout : colors.trip
                  }}
                >
                  {plan.category === 'NIGHTOUT' ? 'Night Out' : 'Trip'}
                </span>
                <span style={{ color: colors.textSecondary }}>
                  {plan._count?.members || 0} members
                </span>
              </div>
            </div>

            <Button
              onClick={handleJoinPlan}
              disabled={joining}
              fullWidth
            >
              {joining ? (
                'Joining...'
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Join This Plan
                </>
              )}
            </Button>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Go to Dashboard
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JoinPlan;
