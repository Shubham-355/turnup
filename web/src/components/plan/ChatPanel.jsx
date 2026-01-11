import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { chatService } from '../../services/chatService';
import { getSocket } from '../../config/socket';
import useAuthStore from '../../stores/authStore';
import { getRelativeTime } from '../../utils/dateUtils';
import { colors } from '../../theme';

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
        socket.off('new_message');
        socket.emit('leave_plan', planId);
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
      socket.emit('join_plan', planId);
      
      socket.on('new_message', (message) => {
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
      senderId: user.id,
      sender: user,
      createdAt: new Date().toISOString(),
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

  // Get sender info - handle both sender and user properties
  const getSender = (message) => {
    return message.sender || message.user || {};
  };

  const isOwnMessage = (message) => {
    const sender = getSender(message);
    return sender.id === user?.id || message.senderId === user?.id;
  };

  // Check if this message should show sender info (first in a group)
  const shouldShowSenderInfo = (message, index) => {
    if (isOwnMessage(message)) return false;
    if (index === 0) return true;
    
    const prevMessage = messages[index - 1];
    const currentSender = getSender(message);
    const prevSender = getSender(prevMessage);
    
    return currentSender.id !== prevSender.id;
  };

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-6 space-y-3"
        style={{ backgroundColor: colors.background }}
      >
        {loading ? (
          <div style={{ color: colors.textSecondary }} className="text-center">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ color: colors.textSecondary }} className="text-center mt-12">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message, index) => {
            const sender = getSender(message);
            const ownMessage = isOwnMessage(message);
            const showSenderInfo = shouldShowSenderInfo(message, index);
            
            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${ownMessage ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar for other users */}
                {!ownMessage && (
                  <div className="flex-shrink-0">
                    {showSenderInfo ? (
                      <Avatar user={sender} size="sm" />
                    ) : (
                      <div className="w-8 h-8" /> // Placeholder for alignment
                    )}
                  </div>
                )}
                
                <div className={`max-w-xs lg:max-w-md ${ownMessage ? 'text-right' : 'text-left'}`}>
                  {/* Sender name */}
                  {showSenderInfo && (
                    <div 
                      className="text-xs font-semibold mb-1 ml-1"
                      style={{ color: colors.textSecondary }}
                    >
                      {sender.displayName || sender.username || sender.name || 'Unknown'}
                    </div>
                  )}
                  
                  {/* Message bubble */}
                  <div
                    className="inline-block px-4 py-2 rounded-2xl"
                    style={{
                      backgroundColor: ownMessage ? colors.primary : colors.messageReceived,
                      color: ownMessage ? colors.textInverse : colors.text,
                      borderBottomRightRadius: ownMessage ? '4px' : undefined,
                      borderBottomLeftRadius: !ownMessage ? '4px' : undefined,
                    }}
                  >
                    <p className="break-words text-left">{message.content}</p>
                    <div 
                      className="text-xs mt-1"
                      style={{ 
                        color: ownMessage ? 'rgba(255,255,255,0.7)' : colors.textTertiary 
                      }}
                    >
                      {getRelativeTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div 
        className="p-4"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
            style={{
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              color: colors.text,
            }}
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
