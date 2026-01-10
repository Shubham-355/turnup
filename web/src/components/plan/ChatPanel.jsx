import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { chatService } from '../../services/chatService';
import { getSocket } from '../../config/socket';
import useAuthStore from '../../stores/authStore';
import { getRelativeTime } from '../../utils/dateUtils';

const ChatPanel = ({ planId }) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    setupSocketListeners();
    
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('new-message');
      }
    };
  }, [planId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await chatService.getMessages(planId);
      setMessages(response.data?.items || []);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('join-plan', planId);
      
      socket.on('new-message', (message) => {
        if (message.planId === planId) {
          setMessages(prev => [...prev, message]);
        }
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMessage = {
      id: Date.now(),
      content: newMessage,
      user: { name: user.name },
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      await chatService.sendMessage(planId, newMessage);
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.user?.id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.user?.id === user?.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.user?.id !== user?.id && (
                  <div className="text-xs font-semibold mb-1">{message.user?.name}</div>
                )}
                <p className="break-words">{message.content}</p>
                <div className={`text-xs mt-1 ${
                  message.user?.id === user?.id ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {getRelativeTime(message.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ChatPanel;
