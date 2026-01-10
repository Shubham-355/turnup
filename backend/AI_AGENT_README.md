# AI Agent Implementation

## Overview

The TurnUp AI Agent is a comprehensive AI assistant powered by Google's Gemini API that has full control over the platform. Users can interact with it through natural language to perform any action on the platform.

## Features

The AI Agent can:

- **Plan Management**
  - Create plans (trips, nightouts, picnics, any events)
  - Update plan details
  - Delete plans
  - List user's plans
  - Get detailed plan information

- **Activity Management**
  - Add activities to plans
  - Update activity details
  - Delete activities
  - List all activities for a plan

- **Expense Management**
  - Add expenses to plans
  - Split expenses among members
  - List all expenses
  - Track who owes what

- **Member Management**
  - Invite members by email
  - List plan members
  - Remove members
  - Manage member roles

- **Location Services**
  - Update member locations
  - Get all member locations
  - Track real-time positions

- **Notifications**
  - Send notifications to plan members
  - Alert members about updates

## API Endpoints

### Base URL: `/api/ai-agent`

All endpoints require authentication via JWT token.

#### 1. Chat with AI Agent
```
POST /api/ai-agent/chat
```

**Request Body:**
```json
{
  "message": "Create a weekend trip plan to Vegas",
  "context": {
    "currentPlanId": "optional-plan-id",
    "timezone": "America/Los_Angeles"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "I've created a weekend trip plan to Vegas for you! The plan is ready and you can start adding activities. Would you like me to suggest some activities?",
    "toolCalls": [
      {
        "name": "createPlan",
        "args": {
          "name": "Vegas Weekend Trip",
          "category": "TRIP",
          "type": "PRIVATE"
        }
      }
    ],
    "toolResults": [
      {
        "name": "createPlan",
        "result": {
          "id": "plan-id-123",
          "name": "Vegas Weekend Trip",
          "category": "TRIP",
          ...
        }
      }
    ]
  }
}
```

#### 2. Get Conversation History
```
GET /api/ai-agent/history
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "role": "user",
      "parts": [{ "text": "Create a trip to Vegas" }]
    },
    {
      "role": "model",
      "parts": [{ "text": "I've created a Vegas trip for you!" }]
    }
  ]
}
```

#### 3. Reset Conversation
```
POST /api/ai-agent/reset
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Conversation reset successfully"
  }
}
```

#### 4. Get Available Tools
```
GET /api/ai-agent/tools
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tools": [
      {
        "name": "createPlan",
        "description": "Creates a new plan...",
        "parameters": { ... }
      },
      ...
    ]
  }
}
```

## Example Conversations

### Creating a Plan
**User:** "I want to create a nightout plan for this Saturday with my friends"

**AI Agent:** 
- Creates the plan
- Responds: "I've created a nightout plan for Saturday! The plan is ready. Would you like to add any activities like dinner, drinks, or club hopping?"

### Adding Activities
**User:** "Add dinner at 7 PM and then club at 10 PM"

**AI Agent:**
- Adds two activities
- Responds: "I've added two activities to your plan: Dinner at 7:00 PM and Club at 10:00 PM. Would you like to specify locations for these?"

### Managing Expenses
**User:** "Add a $200 expense for the dinner that we'll split equally"

**AI Agent:**
- Creates expense with equal split
- Responds: "I've added a $200 dinner expense and split it equally among all members. Each person owes $40."

### Complex Request
**User:** "Create a 3-day trip to San Francisco, add activities for visiting Golden Gate Bridge, Alcatraz, and Fisherman's Wharf, and invite john@example.com"

**AI Agent:**
- Creates the trip plan
- Adds three activities
- Sends invitation
- Responds with a summary of all actions taken

## Setup Instructions

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 2. Configure Environment Variables

Add to your `.env` file:
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Start the Server

The AI Agent routes are automatically registered when you start the server:
```bash
npm run dev
```

## Available Tools/Functions

The AI Agent has access to these functions:

1. **createPlan** - Create new plans
2. **listUserPlans** - Get all user plans
3. **getPlanDetails** - Get detailed plan info
4. **updatePlan** - Update plan details
5. **deletePlan** - Delete a plan
6. **addActivity** - Add activity to plan
7. **listActivities** - Get all activities
8. **updateActivity** - Update activity
9. **deleteActivity** - Delete activity
10. **addExpense** - Add expense
11. **listExpenses** - Get all expenses
12. **inviteMemberByEmail** - Invite members
13. **listPlanMembers** - Get plan members
14. **removeMember** - Remove member
15. **updateMemberLocation** - Update location
16. **getMemberLocations** - Get all locations
17. **sendNotification** - Send notifications

## Technical Details

### Architecture

```
User Request
    ↓
AI Agent Controller
    ↓
AI Agent Service
    ↓
Gemini AI (Function Calling)
    ↓
Tool Execution (Platform Services)
    ↓
Response to User
```

### Function Calling Flow

1. User sends a natural language message
2. AI Agent analyzes the intent
3. Gemini determines which tools to call
4. Service executes the tools
5. Results are sent back to Gemini
6. Gemini formulates a natural language response
7. Response is sent to user

### Conversation Management

- Each user has a separate conversation history
- History is stored in memory (can be moved to database)
- Last 20 messages are kept for context
- Users can reset their conversation anytime

## Frontend Integration Examples

### React/React Native

```javascript
// Chat with AI Agent
const chatWithAI = async (message) => {
  const response = await fetch('/api/ai-agent/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  });
  
  const data = await response.json();
  return data.data.message;
};

// Example usage
const response = await chatWithAI('Create a trip to Paris for next month');
console.log(response); // AI's natural language response
```

### Chat UI Component

```jsx
function AIAgentChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    
    // Get AI response
    const response = await chatWithAI(input);
    
    // Add AI response
    setMessages(prev => [...prev, { role: 'agent', text: response }]);
    
    setInput('');
  };

  return (
    <View>
      {messages.map((msg, i) => (
        <Text key={i}>{msg.role}: {msg.text}</Text>
      ))}
      <TextInput value={input} onChangeText={setInput} />
      <Button onPress={sendMessage}>Send</Button>
    </View>
  );
}
```

## Security Considerations

- All endpoints require authentication
- Users can only perform actions on their own plans or plans they're members of
- The AI agent respects all existing permission checks
- API key should be kept secret on the server

## Error Handling

The AI Agent gracefully handles errors:
- Invalid requests
- Permission denied
- Tool execution failures
- API limits

Users receive friendly error messages and suggestions.

## Future Enhancements

Potential improvements:
- Voice interaction
- Multi-language support
- Context-aware suggestions
- Learning user preferences
- Integration with external APIs (weather, flights, hotels)
- Persistent conversation history in database
- Support for file uploads
- Image generation for plans

## Testing

Example test scenarios:

```javascript
// Test creating a plan
POST /api/ai-agent/chat
{
  "message": "Create a nightout plan called 'Saturday Fun'"
}

// Test adding activities
POST /api/ai-agent/chat
{
  "message": "Add dinner at 8 PM to my Saturday Fun plan"
}

// Test complex multi-action request
POST /api/ai-agent/chat
{
  "message": "Create a 5-day trip to Tokyo, add visit to Mount Fuji as an activity, and invite sarah@example.com"
}
```

## Troubleshooting

### Common Issues

1. **"API key not found"**
   - Ensure GEMINI_API_KEY is set in .env file
   - Restart the server after adding the key

2. **"Tool execution failed"**
   - Check if user has permission for the action
   - Verify plan/activity IDs are valid

3. **"No response from AI"**
   - Check Gemini API quota
   - Verify API key is valid
   - Check network connectivity

## Support

For issues or questions:
- Check the API documentation
- Review the example conversations
- Test with the `/tools` endpoint to see available functions
