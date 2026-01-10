import { useState } from 'react';
import { User, Mail, Phone, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import useAuthStore from '../stores/authStore';
import { authService } from '../services/authService';
import { colors } from '../theme';

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
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
      const response = await authService.updateProfile(formData);
      updateUser(response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6" style={{ backgroundColor: colors.background }}>
      <h1 className="text-3xl font-bold mb-8" style={{ color: colors.text }}>Settings</h1>

      <Card className="p-8" style={{ backgroundColor: colors.surface }}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Profile Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-3xl" style={{ backgroundColor: colors.primary, color: colors.white }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            icon={User}
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            required
          />

          <Input
            label="Phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            icon={Phone}
          />

          <Button type="submit" disabled={loading} fullWidth>
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>

        <div className="mt-8 pt-8 border-t" style={{ borderColor: colors.border }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>Preferences</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span style={{ color: colors.textSecondary }}>Email notifications</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span style={{ color: colors.textSecondary }}>Push notifications</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
