import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { invitationService } from '../services/invitationService';

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
      setPlan(response.data.plan);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
        <Spinner size="lg" className="text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">You're Invited!</h1>
          <p className="text-white/90">Join your friends and start planning</p>
        </div>

        {plan && (
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
              {plan.description && (
                <p className="text-gray-600 mb-4">{plan.description}</p>
              )}
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <span className={`px-3 py-1 rounded-full ${
                  plan.category === 'nightout' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {plan.category}
                </span>
                <span>
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
