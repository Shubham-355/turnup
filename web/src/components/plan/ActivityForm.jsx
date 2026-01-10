import { useState } from 'react';
import { MapPin, Clock } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ActivityForm = ({ activity, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: activity?.name || '',
    description: activity?.description || '',
    location: activity?.location || '',
    dateTime: activity?.dateTime ? new Date(activity.dateTime).toISOString().slice(0, 16) : '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Activity Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Dinner at Italian Restaurant"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add more details about this activity..."
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>

      <Input
        label="Location (Optional)"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Search or enter location"
        icon={MapPin}
      />

      <Input
        label="Date & Time (Optional)"
        type="datetime-local"
        name="dateTime"
        value={formData.dateTime}
        onChange={handleChange}
        icon={Clock}
      />

      <div className="flex space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {activity ? 'Update' : 'Add'} Activity
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;
