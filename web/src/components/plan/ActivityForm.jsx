import { useState } from 'react';
import { Clock } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import LocationSearch from '../ui/LocationSearch';

const ActivityForm = ({ activity, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: activity?.name || '',
    description: activity?.description || '',
    locationName: activity?.locationName || '',
    date: activity?.date ? new Date(activity.date).toISOString().split('T')[0] : '',
    time: activity?.time || '',
  });

  const [selectedLocation, setSelectedLocation] = useState(
    activity?.locationName ? {
      name: activity.locationName,
      address: activity.locationAddress,
      latitude: activity.latitude,
      longitude: activity.longitude,
      placeId: activity.placeId,
    } : null
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty optional fields
    const submitData = {
      name: formData.name,
    };
    
    if (formData.description) submitData.description = formData.description;
    if (formData.date) submitData.date = formData.date;
    if (formData.time) submitData.time = formData.time;
    
    // Add location data if selected
    if (selectedLocation) {
      submitData.locationName = selectedLocation.name;
      submitData.locationAddress = selectedLocation.address;
      submitData.latitude = selectedLocation.latitude;
      submitData.longitude = selectedLocation.longitude;
      submitData.placeId = selectedLocation.placeId;
    }
    
    onSubmit(submitData);
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <LocationSearch
          value={selectedLocation}
          onChange={handleLocationChange}
          placeholder="Search for a location..."
        />
      </div>

      <Input
        label="Date (Optional)"
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
      />

      <Input
        label="Time (Optional)"
        type="time"
        name="time"
        value={formData.time}
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
