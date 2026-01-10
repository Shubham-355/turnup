import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Globe, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { planService } from '../services/planService';
import usePlanStore from '../stores/planStore';

const CreatePlan = () => {
  const navigate = useNavigate();
  const { addPlan } = usePlanStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'nightout',
    type: 'private',
    location: '',
    startDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Plan name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await planService.createPlan(formData);
      addPlan(response.data);
      toast.success('Plan created successfully!');
      navigate(`/plans/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Plan</h1>
        <p className="text-gray-600">Set up your event and start inviting friends</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plan Name */}
          <Input
            label="Plan Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Weekend Beach Party"
            required
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell people what this plan is about..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: 'nightout' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.category === 'nightout'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="font-semibold text-gray-900">Night Out</div>
                <div className="text-sm text-gray-600">Evening activities</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: 'trip' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.category === 'trip'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MapPin className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="font-semibold text-gray-900">Trip</div>
                <div className="text-sm text-gray-600">Multi-day adventure</div>
              </button>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Privacy <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'private' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'private'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Lock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="font-semibold text-gray-900">Private</div>
                <div className="text-sm text-gray-600">Invite only</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'public' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'public'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Globe className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="font-semibold text-gray-900">Public</div>
                <div className="text-sm text-gray-600">Anyone can join</div>
              </button>
            </div>
          </div>

          {/* Location */}
          <Input
            label="Location (Optional)"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Santa Monica Beach"
            icon={MapPin}
          />

          {/* Start Date */}
          <Input
            label="Start Date (Optional)"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreatePlan;
