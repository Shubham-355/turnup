import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Bell, Settings, LogOut, Menu, X, Flame } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../stores/authStore';
import { disconnectSocket } from '../config/socket';
import { colors, borderRadius, shadows } from '../theme';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Plans', path: '/plans', icon: Calendar },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: colors.background, boxShadow: shadows.sm }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Flame size={24} style={{ color: colors.primary }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: colors.primary }}>
              TurnUp
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
                  style={{
                    color: active ? colors.primary : colors.textSecondary,
                    backgroundColor: active ? `${colors.primary}10` : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = colors.surfaceLight;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                style={{ backgroundColor: colors.primary, color: colors.white }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: colors.text }}>{user?.name}</div>
                <div className="text-xs" style={{ color: colors.textSecondary }}>{user?.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl transition-all hover:opacity-80"
              style={{ color: colors.error, backgroundColor: `${colors.error}10` }}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: colors.textSecondary, backgroundColor: colors.surface }}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t" style={{ borderColor: colors.border }}>
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    color: active ? colors.primary : colors.textSecondary,
                    backgroundColor: active ? `${colors.primary}10` : 'transparent',
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{link.name}</span>
                </Link>
              );
            })}
            <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
              <div className="flex items-center gap-3 px-4 py-2">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                  style={{ backgroundColor: colors.primary, color: colors.white }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: colors.text }}>{user?.name}</div>
                  <div className="text-xs" style={{ color: colors.textSecondary }}>{user?.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ color: colors.error, backgroundColor: `${colors.error}10` }}
              >
                <LogOut className="w-5 h-5" />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
