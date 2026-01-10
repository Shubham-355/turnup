import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Globe, Lock, ArrowLeft, Moon, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { planService } from '../services/planService';
import usePlanStore from '../stores/planStore';
import { colors } from '../theme';

const CreatePlan = () => {
  const navigate = useNavigate();
  const { addPlan } = usePlanStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'NIGHTOUT',
    type: 'PRIVATE',
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
      // Clean up the data - remove empty strings and location (not in schema)
      const cleanedData = {
        name: formData.name.trim(),
        category: formData.category,
        type: formData.type,
      };
      
      if (formData.description?.trim()) {
        cleanedData.description = formData.description.trim();
      }
      
      if (formData.startDate) {
        cleanedData.startDate = formData.startDate;
      }
      
      const response = await planService.createPlan(cleanedData);
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
    <div className="max-w-3xl mx-auto p-6" style={{ backgroundColor: colors.background }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center hover:opacity-80 mb-6"
        style={{ color: colors.textSecondary }}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>Create New Plan</h1>
        <p style={{ color: colors.textSecondary }}>Set up your event and start inviting friends</p>
      </div>

      <Card className="p-8" style={{ backgroundColor: colors.surface }}>
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 transition-all"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.text
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: colors.text }}>
              Category <span style={{ color: colors.error }}>*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: 'NIGHTOUT' }))}
                className="p-4 rounded-xl border-2 transition-all"
                style={{
                  borderColor: formData.category === 'NIGHTOUT' ? colors.nightout : colors.border,
                  backgroundColor: formData.category === 'NIGHTOUT' ? `${colors.nightout}10` : 'transparent'
                }}
              >
                <Moon className="w-8 h-8 mx-auto mb-2" style={{ color: colors.nightout }} />
                <div className="font-semibold" style={{ color: colors.text }}>Night Out</div>
                <div className="text-sm" style={{ color: colors.textSecondary }}>Evening activities</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: 'TRIP' }))}
                className="p-4 rounded-xl border-2 transition-all"
                style={{
                  borderColor: formData.category === 'TRIP' ? colors.trip : colors.border,
                  backgroundColor: formData.category === 'TRIP' ? `${colors.trip}10` : 'transparent'
                }}
              >
                <Plane className="w-8 h-8 mx-auto mb-2" style={{ color: colors.trip }} />
                <div className="font-semibold" style={{ color: colors.text }}>Trip</div>
                <div className="text-sm" style={{ color: colors.textSecondary }}>Multi-day adventure</div>
              </button>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: colors.text }}>
              Privacy <span style={{ color: colors.error }}>*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'PRIVATE' }))}
                className="p-4 rounded-xl border-2 transition-all"
                style={{
                  borderColor: formData.type === 'PRIVATE' ? colors.primary : colors.border,
                  backgroundColor: formData.type === 'PRIVATE' ? `${colors.primary}10` : 'transparent'
                }}
              >
                <Lock className="w-8 h-8 mx-auto mb-2" style={{ color: colors.primary }} />
                <div className="font-semibold" style={{ color: colors.text }}>Private</div>
                <div className="text-sm" style={{ color: colors.textSecondary }}>Invite only</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'PUBLIC' }))}
                className="p-4 rounded-xl border-2 transition-all"
                style={{
                  borderColor: formData.type === 'PUBLIC' ? colors.accent : colors.border,
                  backgroundColor: formData.type === 'PUBLIC' ? `${colors.accent}10` : 'transparent'
                }}
              >
                <Globe className="w-8 h-8 mx-auto mb-2" style={{ color: colors.accent }} />
                <div className="font-semibold" style={{ color: colors.text }}>Public</div>
                <div className="text-sm" style={{ color: colors.textSecondary }}>Anyone can join</div>
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
