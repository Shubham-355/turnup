import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, Clock, Globe, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { planService } from '../services/planService';
import usePlanStore from '../stores/planStore';
import { formatDate } from '../utils/dateUtils';

const Dashboard = () => {
  const navigate = useNavigate();
  const { plans, setPlans } = usePlanStore();
  const [loading, setLoading] = useState(true);
  const [publicPlans, setPublicPlans] = useState([]);
  const [activeTab, setActiveTab] = useState('my-plans');

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
      await planService.joinPlan(planId);
      toast.success('Join request sent!');
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join plan');
    }
  };

  const PlanCard = ({ plan, isPublic = false }) => (
    <Card 
      hover 
      onClick={() => navigate(`/plans/${plan.id}`)}
      className="p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              plan.category === 'nightout' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {plan.category}
            </span>
            <span className="flex items-center">
              {plan.type === 'private' ? (
                <><Lock className="w-4 h-4 mr-1" /> Private</>
              ) : (
                <><Globe className="w-4 h-4 mr-1" /> Public</>
              )}
            </span>
          </div>
        </div>
        {plan.type === 'private' && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Private
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2" />
          <span>{plan._count?.members || 0} members</span>
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{plan._count?.activities || 0} activities</span>
        </div>
        {plan.startDate && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>{formatDate(plan.startDate)}</span>
          </div>
        )}
        {plan.location && (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
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
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your plans and discover new events</p>
        </div>
        <Button onClick={() => navigate('/plans/create')}>
          <Plus className="w-5 h-5 mr-2" />
          Create Plan
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('my-plans')}
            className={`pb-4 px-1 font-medium transition-colors ${
              activeTab === 'my-plans'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Plans ({plans.length})
          </button>
          <button
            onClick={() => setActiveTab('public-plans')}
            className={`pb-4 px-1 font-medium transition-colors ${
              activeTab === 'public-plans'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Discover ({publicPlans.length})
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'my-plans' ? (
          plans.length > 0 ? (
            plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No plans yet</h3>
              <p className="text-gray-600 mb-6">Create your first plan to get started!</p>
              <Button onClick={() => navigate('/plans/create')}>
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Plan
              </Button>
            </div>
          )
        ) : (
          publicPlans.length > 0 ? (
            publicPlans.map((plan) => <PlanCard key={plan.id} plan={plan} isPublic />)
          ) : (
            <div className="col-span-full text-center py-12">
              <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No public plans</h3>
              <p className="text-gray-600">Check back later for public events to join!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
