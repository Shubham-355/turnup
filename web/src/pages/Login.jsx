import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authService } from '../services/authService';
import useAuthStore from '../stores/authStore';
import { initSocket } from '../config/socket';
import { validateEmail, validatePassword } from '../utils/validation';
import { colors } from '../theme';

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      const response = await authService.login(formData.email, formData.password);
      const { user, token } = response.data;
      setAuth(user, token);
      initSocket(token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: colors.background }}>
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-12 mt-12">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Flame size={48} style={{ color: colors.primary }} />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: colors.text }}>
            Welcome Back
          </h1>
          <p className="text-base" style={{ color: colors.textSecondary }}>
            Sign in to continue planning
          </p>
        </div>

        {/* Login Form */}
        <div className="space-y-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              icon={Mail}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon={Lock}
              error={errors.password}
              required
            />

            <div className="text-right">
              <button 
                type="button"
                className="text-sm font-medium hover:underline"
                style={{ color: colors.primary }}
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-auto pb-6">
          <p className="text-base" style={{ color: colors.textSecondary }}>
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="font-semibold hover:underline"
              style={{ color: colors.primary }}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
