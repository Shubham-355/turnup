import { useState } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { planService } from '../../services/planService';

const PlanSettings = ({ plan, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    name: plan.name || '',
    description: plan.description || '',
    category: plan.category || 'nightout',
    type: plan.type || 'private',
    location: plan.location || '',
    startDate: plan.startDate ? new Date(plan.startDate).toISOString().split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await planService.updatePlan(plan.id, formData);
      toast.success('Plan updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Plan Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="nightout">Night Out</option>
          <option value="trip">Trip</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Privacy
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
      </div>

      <Input
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleChange}
      />

      <Input
        label="Start Date"
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
      />

      <div className="flex space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default PlanSettings;
