import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Share2, Plus, Users, 
  MessageCircle, Image as ImageIcon, DollarSign, Map,
  Calendar, Clock, MapPin, Settings as SettingsIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import ActivityList from '../components/plan/ActivityList';
import ActivityForm from '../components/plan/ActivityForm';
import ChatPanel from '../components/plan/ChatPanel';
import MediaGallery from '../components/plan/MediaGallery';
import ExpenseTracker from '../components/plan/ExpenseTracker';
import MembersList from '../components/plan/MembersList';
import PlanSettings from '../components/plan/PlanSettings';
import MapView from '../components/plan/MapView';
import { planService } from '../services/planService';
import { activityService } from '../services/activityService';
import { invitationService } from '../services/invitationService';
import usePlanStore from '../stores/planStore';
import { formatDate } from '../utils/dateUtils';
import { colors } from '../theme';

const PlanDetails = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { currentPlan, setCurrentPlan } = usePlanStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activities');
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchPlanDetails();
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      const [planResponse, activitiesResponse] = await Promise.all([
        planService.getPlan(planId),
        activityService.getActivities(planId),
      ]);
      setCurrentPlan(planResponse.data);
      setActivities(activitiesResponse.data || []);
    } catch (error) {
      toast.error('Failed to load plan details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSharePlan = async () => {
    try {
      const response = await invitationService.createInvitation(planId);
      const inviteUrl = `${window.location.origin}/join/${response.data.code}`;
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Invite link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to create invite link');
    }
  };

  const handleDeletePlan = async () => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await planService.deletePlan(planId);
      toast.success('Plan deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  const handleActivitySubmit = async (activityData) => {
    try {
      if (editingActivity) {
        await activityService.updateActivity(editingActivity.id, activityData);
        toast.success('Activity updated successfully');
      } else {
        await activityService.createActivity(planId, activityData);
        toast.success('Activity added successfully');
      }
      setShowActivityForm(false);
      setEditingActivity(null);
      fetchPlanDetails();
    } catch (error) {
      toast.error('Failed to save activity');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    
    try {
      await activityService.deleteActivity(activityId);
      toast.success('Activity deleted');
      fetchPlanDetails();
    } catch (error) {
      toast.error('Failed to delete activity');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentPlan) return null;

  const tabs = [
    { id: 'activities', label: 'Activities', icon: Calendar, count: activities.length },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'members', label: 'Members', icon: Users, count: currentPlan._count?.members },
    { id: 'map', label: 'Map', icon: Map },
  ];

  return (
    <div className="p-6" style={{ backgroundColor: colors.background }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center hover:opacity-80 mb-6"
        style={{ color: colors.textSecondary }}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Dashboard
      </button>

      {/* Plan Header */}
      <Card className="p-6 mb-6" style={{ backgroundColor: colors.surface }}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>{currentPlan.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span 
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: currentPlan.category === 'NIGHTOUT' ? `${colors.nightout}20` : `${colors.trip}20`,
                  color: currentPlan.category === 'NIGHTOUT' ? colors.nightout : colors.trip
                }}
              >
                {currentPlan.category}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {currentPlan.type === 'private' ? '🔒 Private' : '🌐 Public'}
              </span>
            </div>
            {currentPlan.description && (
              <p className="text-gray-600 mb-4">{currentPlan.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {currentPlan.startDate && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDate(currentPlan.startDate)}
                </div>
              )}
              {currentPlan.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {currentPlan.location}
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" onClick={handleSharePlan}>
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <SettingsIcon className="w-4 h-4" />
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeletePlan}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 pb-4 px-1 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'activities' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Activities</h2>
              <Button onClick={() => setShowActivityForm(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Add Activity
              </Button>
            </div>
            <ActivityList
              activities={activities}
              onEdit={(activity) => {
                setEditingActivity(activity);
                setShowActivityForm(true);
              }}
              onDelete={handleDeleteActivity}
            />
          </div>
        )}

        {activeTab === 'chat' && <ChatPanel planId={planId} />}
        {activeTab === 'media' && <MediaGallery planId={planId} />}
        {activeTab === 'expenses' && <ExpenseTracker planId={planId} />}
        {activeTab === 'members' && <MembersList planId={planId} plan={currentPlan} />}
        {activeTab === 'map' && <MapView activities={activities} />}
      </div>

      {/* Activity Form Modal */}
      {showActivityForm && (
        <Modal
          isOpen={showActivityForm}
          onClose={() => {
            setShowActivityForm(false);
            setEditingActivity(null);
          }}
          title={editingActivity ? 'Edit Activity' : 'Add New Activity'}
        >
          <ActivityForm
            activity={editingActivity}
            onSubmit={handleActivitySubmit}
            onCancel={() => {
              setShowActivityForm(false);
              setEditingActivity(null);
            }}
          />
        </Modal>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Modal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          title="Plan Settings"
        >
          <PlanSettings
            plan={currentPlan}
            onUpdate={fetchPlanDetails}
            onClose={() => setShowSettings(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default PlanDetails;
