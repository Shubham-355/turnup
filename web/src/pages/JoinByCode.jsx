import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { colors } from '../theme';

const JoinByCode = () => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    setLoading(true);
    
    // Navigate to the join page with the code
    // The JoinPlan page will handle validation and joining
    navigate(`/join/${inviteCode.trim()}`);
  };

  return (
    <div className="max-w-md mx-auto p-6" style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
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
      <div className="text-center mb-8">
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${colors.primary}20` }}
        >
          <QrCode className="w-10 h-10" style={{ color: colors.primary }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
          Join a Plan
        </h1>
        <p style={{ color: colors.textSecondary }}>
          Enter the invite code shared by your friend
        </p>
      </div>

      <Card className="p-6" style={{ backgroundColor: colors.surface }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Invite Code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="e.g., abc123xyz"
            autoFocus
          />

          <Button
            type="submit"
            disabled={loading || !inviteCode.trim()}
            fullWidth
          >
            {loading ? 'Joining...' : (
              <>
                Join Plan
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: colors.border }}>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Don't have a code? Ask your friend to share their plan's invite link with you.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default JoinByCode;
