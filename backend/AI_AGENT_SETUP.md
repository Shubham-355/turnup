# AI Agent Quick Setup Guide

## 🚀 Quick Start

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

### 2. Configure Backend

```bash
cd backend

# Add to your .env file (or create one if it doesn't exist)
echo "GEMINI_API_KEY=your-api-key-here" >> .env

# Start the server
npm run dev
```

### 3. Test the AI Agent

Use the test script:

```bash
# Make sure server is running first
node test-ai-agent.js
```

Or test manually with curl:

```bash
# Replace YOUR_JWT_TOKEN with a valid auth token
curl -X POST http://localhost:3000/api/ai-agent/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Create a trip to Paris"}'
```

## 📱 Frontend Integration

### React Native (Mobile)

1. Copy the AIAgentChat component:
   - `frontend/src/screens/AIAgentChat.tsx`

2. Add to your navigation:
```tsx
import AIAgentChat from './src/screens/AIAgentChat';

// In your navigator
<Stack.Screen name="AIAgent" component={AIAgentChat} />
```

3. Add a button to navigate:
```tsx
<Button onPress={() => navigation.navigate('AIAgent')}>
  AI Assistant
</Button>
```

### React (Web)

1. Copy the AIAgentChat component:
   - `web/src/components/AIAgentChat.jsx`
   - `web/src/components/AIAgentChat.css`

2. Add to your routes:
```jsx
import AIAgentChat from './components/AIAgentChat';

// In your router
<Route path="/ai-agent" element={<AIAgentChat />} />
```

## 🧪 Testing Examples

### Example 1: Create a Plan
```bash
POST /api/ai-agent/chat
{
  "message": "Create a 3-day trip to Tokyo starting next Friday"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "I've created a 3-day trip to Tokyo starting next Friday! Your plan is ready. Would you like me to add some activities like visiting Mount Fuji or exploring Shibuya?",
    "toolCalls": [
      {
        "name": "createPlan",
        "args": {
          "name": "Tokyo Trip",
          "category": "TRIP",
          "startDate": "2026-01-17",
          "endDate": "2026-01-19"
        }
      }
    ]
  }
}
```

### Example 2: Add Activities
```bash
POST /api/ai-agent/chat
{
  "message": "Add dinner at 7 PM and karaoke at 10 PM to my Tokyo trip"
}
```

### Example 3: Complex Multi-Action
```bash
POST /api/ai-agent/chat
{
  "message": "Create a nightout plan for Saturday, add dinner, drinks, and club as activities, then invite john@example.com"
}
```

## 🎯 What You Can Do

The AI Agent can:

✅ **Plans**
- "Create a trip to Las Vegas"
- "Show me all my plans"
- "Cancel my Vegas trip"
- "Update my trip dates to next month"

✅ **Activities**
- "Add sightseeing to my Paris trip"
- "Schedule dinner at 8 PM"
- "Remove the hiking activity"
- "What activities do I have?"

✅ **Expenses**
- "Add a $150 dinner expense"
- "Split the hotel cost equally"
- "Show me all expenses"

✅ **Members**
- "Invite sarah@example.com to my trip"
- "Who's in my plan?"
- "Remove John from the plan"

✅ **Locations**
- "Update my location to 37.7749, -122.4194"
- "Where is everyone?"

✅ **Natural Conversation**
- "I want to plan a picnic"
- "Help me organize a birthday party"
- "What should I do for a bachelor party?"

## 🔧 Environment Variables

Required in your `.env` file:

```env
# Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here

# These should already exist
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
PORT=3000
```

## 📊 API Endpoints

All endpoints require authentication:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai-agent/chat` | Chat with AI agent |
| GET | `/api/ai-agent/history` | Get conversation history |
| POST | `/api/ai-agent/reset` | Reset conversation |
| GET | `/api/ai-agent/tools` | List available tools |

## 🐛 Troubleshooting

### "GEMINI_API_KEY not found"
- Make sure you added the key to `.env`
- Restart your server after adding the key

### "Authentication required"
- You need to pass a valid JWT token
- Login first and use the token from the response

### "Tool execution failed"
- Check if the user has permission for that action
- Verify the plan/activity IDs are correct
- Check server logs for detailed error

### "AI not responding"
- Check your Gemini API quota
- Verify your API key is valid
- Check network connectivity

## 💡 Tips

1. **Be Natural**: Just talk to the AI like you would to a human assistant
2. **Be Specific**: Include details like dates, times, names when relevant
3. **Ask Questions**: The AI can explain things and answer questions
4. **Multi-Step**: You can ask for multiple things in one message
5. **Context**: The AI remembers your conversation, no need to repeat yourself

## 🎓 Example Conversations

**User:** "I want to plan a weekend getaway"

**AI:** "I'd love to help you plan a weekend getaway! Where would you like to go? And do you have specific dates in mind?"

**User:** "Let's go to San Diego next weekend"

**AI:** "Great choice! I've created a weekend trip to San Diego for next weekend (January 17-19). Would you like me to suggest some activities like visiting the zoo, beach time, or exploring Gaslamp Quarter?"

**User:** "Yes, add all three of those"

**AI:** "Perfect! I've added three activities to your San Diego trip:
1. Visit San Diego Zoo
2. Beach time
3. Explore Gaslamp Quarter

Would you like me to set specific times for these activities or invite anyone to join?"

## 📖 Next Steps

1. ✅ Set up your Gemini API key
2. ✅ Test the backend endpoints
3. ✅ Integrate the frontend component
4. ✅ Customize the UI to match your brand
5. 🎉 Let your users enjoy the AI assistant!

## 🔗 Resources

- [Full Documentation](./AI_AGENT_README.md)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Function Calling Guide](https://ai.google.dev/docs/function_calling)

---

Need help? Check the full documentation or raise an issue!
