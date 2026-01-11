# 🚀 AI Agent - Getting Started in 5 Minutes

## Step 1: Get Your Gemini API Key (1 minute)

1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy your API key

## Step 2: Configure Backend (1 minute)

```bash
cd backend

# Create or edit .env file
echo "GEMINI_API_KEY=your-api-key-here" >> .env

# Start the server
npm run dev
```

That's it! The backend is ready. ✅

## Step 3: Test It Works (2 minutes)

### Option A: Use the Test Script
```bash
# First, get a login token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Copy the token from response, update it in test-ai-agent.js
# Then run:
node test-ai-agent.js
```

### Option B: Quick Manual Test
```bash
# Replace YOUR_TOKEN with your JWT token
curl -X POST http://localhost:3000/api/ai-agent/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Hello! Can you help me create a trip?"}'
```

## Step 4: Add to Your Frontend (1 minute)

### For Mobile App (React Native)

In your main App file:

```tsx
import FloatingAIButton from './src/components/FloatingAIButton';

export default function App() {
  return (
    <NavigationContainer>
      {/* Your existing navigation */}
      <Stack.Navigator>
        {/* Your screens */}
      </Stack.Navigator>
      
      {/* Add this one line! */}
      <FloatingAIButton />
    </NavigationContainer>
  );
}
```

### For Web App (React)

In your main App file:

```jsx
import FloatingAIButton from './components/FloatingAIButton';

function App() {
  return (
    <div className="App">
      {/* Your existing app content */}
      
      {/* Add this one line! */}
      <FloatingAIButton />
    </div>
  );
}
```

## Step 5: Start Using! 🎉

Click the floating ✨ button and try:

- "Create a trip to Paris"
- "Add dinner at 7 PM"
- "Show me all my plans"
- "Invite john@example.com"
- "Add a $50 expense for lunch"

## That's It!

You now have a fully functional AI agent that can:
- ✅ Create and manage plans
- ✅ Add and organize activities
- ✅ Handle expenses and splits
- ✅ Invite and manage members
- ✅ Track locations
- ✅ Send notifications
- ✅ And everything else on your platform!

## Quick Tips

💡 **Talk naturally** - Just type like you're talking to a person

💡 **Be specific** - Include details like dates, times, names

💡 **Ask questions** - The AI can answer questions about your plans

💡 **Multiple actions** - You can request multiple things at once

## Common Issues

**"GEMINI_API_KEY not found"**
- Make sure you added it to `.env`
- Restart the server after adding

**"Authentication required"**
- You need a valid JWT token
- Login first to get a token

**"AI not responding"**
- Check your Gemini API quota
- Verify API key is correct

## Need Help?

- 📖 Full documentation: `AI_AGENT_README.md`
- 📋 Setup guide: `AI_AGENT_SETUP.md`
- 📊 Complete summary: `AI_AGENT_SUMMARY.md`

## What Next?

- Customize the UI colors to match your brand
- Add more tools/functions for new features
- Integrate with external APIs (maps, weather, etc.)
- Add voice input for mobile

---

**Enjoy your AI-powered platform!** 🚀✨
