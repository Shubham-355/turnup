import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import GoogleMapRoute from './GoogleMapRoute';
import './AIAgentChat.css';

const AIAgentChat = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const messagesEndRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      // const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/ai-agent/history`, {
        // headers: { Authorization: `Bearer ${token}` }
      });
      
      const history = response.data.data;
      const formattedMessages = history.map(item => ({
        role: item.role,
        text: item.parts[0].text
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/ai-agent/chat`,
        { message: userMessage },
        // { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiResponse = response.data.data.message;
      const toolResults = response.data.data.toolResults || [];
      
      // Check if there's a directions result
      const directionsResult = toolResults.find(r => r.name === 'getDirections');
      if (directionsResult && directionsResult.result.success) {
        setRouteData(directionsResult.result);
      }

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: aiResponse,
        hasRoute: !!directionsResult
      }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Check for rate limit error
      const isRateLimit = error.response?.status === 429 || 
                          error.response?.data?.message?.includes('busy') ||
                          error.response?.data?.message?.includes('429');
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: isRateLimit 
          ? '⏳ I\'m a bit busy right now. Please wait a few seconds and try again!'
          : 'Sorry, I encountered an error. Please try again.' 
      }]);
      setRouteData(null);
    } finally {
      setLoading(false);
    }
  };

  const resetConversation = async () => {
    try {
      // const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/ai-agent/reset`, {}, {
        // headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([]);
      setRouteData(null);
    } catch (error) {
      console.error('Failed to reset conversation:', error);
    }
  };

  const quickActions = [
    { text: 'Create trip to Starbucks and La Pinoz', icon: '✈️' },
    { text: 'Plan a nightout at Skybar', icon: '🌙' },
    { text: 'Show my plans', icon: '📋' },
    { text: 'Search for cafes nearby', icon: '☕' },
  ];

  return (
    <div className="ai-chat-container">
      {/* Header */}
      <div className="ai-chat-header">
        <div className="header-title">
          <span className="sparkle-icon">✨</span>
          <h2>AI Assistant</h2>
        </div>
        <div className="header-actions">
          <button className="reset-button" onClick={resetConversation}>
            🔄
          </button>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="sparkle-large">✨</div>
            <h3>AI Assistant Ready</h3>
            <p>I can help you create plans, add activities, manage expenses, and more!</p>
            
            {/* Quick Actions */}
            <div className="quick-actions">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="quick-action"
                  onClick={() => setInput(action.text)}
                >
                  <span>{action.icon}</span>
                  <span>{action.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-icon">
              {message.role === 'user' ? '👤' : '✨'}
            </div>
            <div className="message-bubble">
              <p>{message.text}</p>
            </div>
          </div>
        ))}

        {/* Show Google Map if route data available */}
        {routeData && (
          <div className="map-container">
            <div className="map-header">
              <h3>🗺️ Route Information</h3>
              <div className="route-info">
                <span>📍 {routeData.distance}</span>
                <span>⏱️ {routeData.duration}</span>
              </div>
            </div>
            <GoogleMapRoute route={routeData} />
          </div>
        )}
        
        {loading && (
          <div className="loading-message">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Thinking...</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="input-container" onSubmit={sendMessage}>
        <textarea
          className="message-input"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e);
            }
          }}
          rows="1"
          maxLength="500"
        />
        <button
          type="submit"
          className="send-button"
          disabled={!input.trim() || loading}
        >
          📤
        </button>
      </form>
    </div>
  );
};

export default AIAgentChat;
