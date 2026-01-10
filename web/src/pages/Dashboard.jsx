import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, Clock, Globe, Lock, Bell, Moon, Plane, Compass, QrCode, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { planService } from '../services/planService';
import usePlanStore from '../stores/planStore';
import useAuthStore from '../stores/authStore';
import { formatDate } from '../utils/dateUtils';
import { colors } from '../theme';

const Dashboard = () => {
  const navigate = useNavigate();
  const { plans, setPlans } = usePlanStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [publicPlans, setPublicPlans] = useState([]);
  const [activeTab, setActiveTab] = useState('my-plans');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const [myPlans, pubPlans] = await Promise.all([
        planService.getPlans(),
        planService.getPublicPlans(),
      ]);
      setPlans(myPlans.data?.items || []);
      setPublicPlans(pubPlans.data?.items || []);
    } catch (error) {
      toast.error('Failed to load plans');
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPlan = async (planId) => {
    try {
      await planService.requestToJoin(planId);
      toast.success('Join request sent!');
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send join request');
    }
  };

  const PlanCard = ({ plan, isPublic = false }) => (
    <Card 
      hover 
      onClick={() => navigate(`/plans/${plan.id}`)}
      className="p-5 cursor-pointer"
      style={{ backgroundColor: colors.surface }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2" style={{ color: colors.text }}>
            {plan.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span 
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ 
                backgroundColor: plan.category === 'NIGHTOUT' ? `${colors.nightout}20` : `${colors.trip}20`,
                color: plan.category === 'NIGHTOUT' ? colors.nightout : colors.trip
              }}
            >
              {plan.category === 'NIGHTOUT' ? '🌙 Night Out' : '✈️ Trip'}
            </span>
            <span 
              className="flex items-center gap-1 text-xs"
              style={{ color: colors.textSecondary }}
            >
              {plan.type === 'PRIVATE' ? (
                <><Lock className="w-3 h-3" /> Private</>
              ) : (
                <><Globe className="w-3 h-3" /> Public</>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm" style={{ color: colors.textSecondary }}>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>{plan._count?.members || 0} members</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{plan._count?.activities || 0} activities</span>
        </div>
        {plan.startDate && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatDate(plan.startDate)}</span>
          </div>
        )}
        {plan.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{plan.location}</span>
          </div>
        )}
      </div>

      {isPublic && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleJoinPlan(plan.id);
          }}
          variant="secondary"
          size="sm"
          className="mt-4 w-full"
        >
          Request to Join
        </Button>
      )}
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: colors.border }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: colors.primary }}
              onClick={() => navigate('/settings')}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <User className="w-6 h-6" style={{ color: colors.white }} />
              )}
            </div>
            <div>
              <p className="text-lg font-semibold" style={{ color: colors.text }}>
                Hey, {user?.displayName || user?.username}!
              </p>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                What's the plan?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/plans/create')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-md hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.primary, color: colors.white }}
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold hidden sm:inline">Create Plan</span>
            </button>
            <button
              className="relative p-2 rounded-lg hover:opacity-80"
              style={{ backgroundColor: colors.surface }}
              onClick={() => navigate('/notifications')}
            >
              <Bell className="w-6 h-6" style={{ color: colors.text }} />
              {unreadCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: colors.error, color: colors.white }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/plans/create?category=NIGHTOUT')}
            className="flex flex-col items-center p-4 rounded-xl hover:opacity-80 transition-opacity"
            style={{ backgroundColor: colors.surface }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
              style={{ backgroundColor: `${colors.nightout}20` }}
            >
              <Moon className="w-6 h-6" style={{ color: colors.nightout }} />
            </div>
            <span className="text-sm font-medium" style={{ color: colors.text }}>
              Night Out
            </span>
          </button>
          <button
            onClick={() => navigate('/plans/create?category=TRIP')}
            className="flex flex-col items-center p-4 rounded-xl hover:opacity-80 transition-opacity"
            style={{ backgroundColor: colors.surface }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
              style={{ backgroundColor: `${colors.trip}20` }}
            >
              <Plane className="w-6 h-6" style={{ color: colors.trip }} />
            </div>
            <span className="text-sm font-medium" style={{ color: colors.text }}>
              Trip
            </span>
          </button>
          <button
            onClick={() => setActiveTab('public-plans')}
            className="flex flex-col items-center p-4 rounded-xl hover:opacity-80 transition-opacity"
            style={{ backgroundColor: colors.surface }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
              style={{ backgroundColor: colors.surfaceLight }}
            >
              <Compass className="w-6 h-6" style={{ color: colors.text }} />
            </div>
            <span className="text-sm font-medium" style={{ color: colors.text }}>
              Explore
            </span>
          </button>
          <button
            onClick={() => navigate('/join')}
            className="flex flex-col items-center p-4 rounded-xl hover:opacity-80 transition-opacity"
            style={{ backgroundColor: colors.surface }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
              style={{ backgroundColor: colors.surfaceLight }}
            >
              <QrCode className="w-6 h-6" style={{ color: colors.text }} />
            </div>
            <span className="text-sm font-medium" style={{ color: colors.text }}>
              Join
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="flex gap-8 border-b" style={{ borderColor: colors.border }}>
          <button
            onClick={() => setActiveTab('my-plans')}
            className="pb-3 px-1 font-semibold transition-colors relative"
            style={{ 
              color: activeTab === 'my-plans' ? colors.primary : colors.textSecondary
            }}
          >
            My Plans ({plans.length})
            {activeTab === 'my-plans' && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: colors.primary }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('public-plans')}
            className="pb-3 px-1 font-semibold transition-colors relative"
            style={{ 
              color: activeTab === 'public-plans' ? colors.primary : colors.textSecondary
            }}
          >
            Discover ({publicPlans.length})
            {activeTab === 'public-plans' && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: colors.primary }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="px-6 pb-6">
        {activeTab === 'my-plans' ? (
          plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: colors.surface }}
              >
                <Calendar className="w-10 h-10" style={{ color: colors.textTertiary }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                No Plans Yet
              </h3>
              <p className="mb-6" style={{ color: colors.textSecondary }}>
                Create your first plan and invite friends to join the fun!
              </p>
              <Button onClick={() => navigate('/plans/create')}>
                <Plus className="w-5 h-5 mr-2" />
                Create Plan
              </Button>
            </div>
          )
        ) : (
          publicPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicPlans.map((plan) => <PlanCard key={plan.id} plan={plan} isPublic />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: colors.surface }}
              >
                <Globe className="w-10 h-10" style={{ color: colors.textTertiary }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                No Public Plans
              </h3>
              <p style={{ color: colors.textSecondary }}>
                Check back later for public events to join!
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
