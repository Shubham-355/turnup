import React, { useState } from 'react';
import AIAgentChat from './AIAgentChat';
import './FloatingAIButton.css';

/**
 * Floating AI Assistant Button for Web
 * 
 * Add this component to your main app layout to provide
 * quick access to the AI assistant from anywhere.
 * 
 * Usage:
 * <FloatingAIButton />
 */
const FloatingAIButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        className="floating-ai-button"
        onClick={() => setIsOpen(true)}
        title="AI Assistant"
      >
        ✨
      </button>

      {/* AI Chat Overlay */}
      {isOpen && (
        <div className="ai-chat-overlay">
          <div className="ai-chat-modal">
            <button
              className="close-button"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
            <AIAgentChat />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAIButton;
