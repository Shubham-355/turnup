# 🗺️ AI Agent with Google Maps Integration

## New Features Added

Your AI agent now has **complete Google Maps integration**! It can:

### ✅ Get Directions & Routes
- **Driving directions** between any two locations
- **Walking, bicycling, and transit** directions
- **Turn-by-turn instructions**
- **Distance and duration** estimates
- **Route visualization** (polyline for maps)

### ✅ Search for Places
- Find **restaurants, hotels, attractions**
- Search **near specific locations**
- Get **ratings and reviews**
- **Addresses and coordinates**
- **Place details** for recommendations

## Example Commands

### Get Directions
```
"Give me directions from San Francisco to Los Angeles"
"Show me the route from my hotel to the Eiffel Tower"
"How do I get to Central Park from Times Square?"
"Give me walking directions from the beach to downtown"
```

### Search Places
```
"Find the best restaurants in Paris"
"Show me hotels near Times Square"
"Find fun activities near me"
"Search for coffee shops in downtown Seattle"
"What are the top attractions in Tokyo?"
```

### Combined Actions
```
"Create a road trip from NYC to Boston and show me the route"
"Plan a trip to Paris, find restaurants near the Eiffel Tower"
"Add visit to Louvre as an activity and give me directions from my hotel"
"Find the best nightclubs in Miami and add them to my nightout plan"
```

## API Changes

### New Tools Available

#### 1. getDirections
Get directions between two locations.

**Parameters:**
- `origin` (required): Starting point (address or "lat,lng")
- `destination` (required): End point (address or "lat,lng")
- `mode` (optional): `driving`, `walking`, `bicycling`, or `transit`

**Response:**
```json
{
  "success": true,
  "distance": "383 mi",
  "duration": "5 hours 42 mins",
  "start_address": "San Francisco, CA, USA",
  "end_address": "Los Angeles, CA, USA",
  "steps": [
    {
      "instruction": "Head south on Market St",
      "distance": "0.2 mi",
      "duration": "1 min"
    }
  ],
  "overview_polyline": "..."
}
```

#### 2. searchPlaces
Search for places using Google Maps Places API.

**Parameters:**
- `query` (required): What to search for
- `location` (optional): Where to search (address or "lat,lng")

**Response:**
```json
{
  "success": true,
  "count": 5,
  "places": [
    {
      "name": "Restaurant Name",
      "address": "123 Main St, Paris",
      "rating": 4.5,
      "user_ratings_total": 1234,
      "types": ["restaurant", "food"],
      "location": {
        "lat": 48.8566,
        "lng": 2.3522
      },
      "place_id": "ChIJ..."
    }
  ]
}
```

## Usage Examples

### Example 1: Plan a Road Trip with Route

**User:** "Create a road trip from San Francisco to Seattle and show me the route"

**AI Agent:**
1. Creates a TRIP plan named "San Francisco to Seattle Road Trip"
2. Gets driving directions using Google Maps
3. Responds with:
   - Plan details
   - Total distance (808 miles)
   - Estimated duration (12 hours 30 minutes)
   - Major waypoints along the route

### Example 2: Find and Add Activities

**User:** "I'm planning a trip to Paris. Find the top tourist attractions and add them as activities"

**AI Agent:**
1. Searches for "tourist attractions in Paris" using Google Maps
2. Gets results like Eiffel Tower, Louvre, Arc de Triomphe
3. Creates activities for each attraction
4. Adds locations and details to each activity

### Example 3: Get Walking Tour Directions

**User:** "Give me a walking route that covers the Eiffel Tower, Louvre, and Notre Dame"

**AI Agent:**
1. Gets walking directions between each location
2. Calculates total walking distance and time
3. Provides turn-by-turn instructions
4. Suggests best order to visit based on route efficiency

## Technical Details

### Google Maps APIs Used

1. **Directions API** - For route calculations
   - Endpoint: `https://maps.googleapis.com/maps/api/directions/json`
   - Supports multiple travel modes
   - Provides step-by-step instructions

2. **Places API (Text Search)** - For finding places
   - Endpoint: `https://maps.googleapis.com/maps/api/place/textsearch/json`
   - Returns detailed place information
   - Includes ratings and reviews

### Environment Variable

Uses existing `MAP_API_KEY` from your `.env` file:
```env
MAP_API_KEY="your-google-maps-api-key"
```

**Note:** Make sure your Google Maps API key has these APIs enabled:
- Directions API
- Places API
- Maps JavaScript API (for frontend visualization)

## Error Handling

The AI agent gracefully handles:
- Invalid locations
- API quota limits
- Network errors
- Missing API key

Users receive friendly error messages like:
"I couldn't find directions for that route. Could you provide more specific locations?"

## Testing

Run the Google Maps test suite:

```bash
# Update AUTH_TOKEN in the file first
node test-google-maps-agent.js
```

Or test manually:

```bash
curl -X POST http://localhost:3000/api/ai-agent/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Show me directions from Paris to London"}'
```

## Frontend Integration

The directions and place data can be displayed on maps in your frontend:

### React Native (with react-native-maps)
```jsx
import MapView, { Polyline } from 'react-native-maps';

// Decode polyline and display route
<MapView>
  <Polyline
    coordinates={decodedPolyline}
    strokeColor="#7C3AED"
    strokeWidth={4}
  />
</MapView>
```

### Web (with Google Maps JavaScript API)
```javascript
// Display route on map
const directionsService = new google.maps.DirectionsService();
const directionsRenderer = new google.maps.DirectionsRenderer();

directionsRenderer.setMap(map);
directionsService.route(request, (result, status) => {
  if (status === 'OK') {
    directionsRenderer.setDirections(result);
  }
});
```

## What Changed

### Files Modified:
1. **`src/services/ai-agent.service.js`**
   - Added `getDirections` tool
   - Added `searchPlaces` tool
   - Implemented `getGoogleMapsDirections()` method
   - Implemented `searchGooglePlaces()` method
   - Fixed variable naming conflicts

2. **`test-google-maps-agent.js`** (new)
   - Comprehensive test suite for Google Maps features

## Total Tools Available: 19

Now your AI agent has 19 tools:
- 5 Plan management tools
- 4 Activity tools
- 2 Expense tools
- 3 Member management tools
- 2 Location tools
- **2 Google Maps tools** ⭐ NEW
- 1 Notification tool

## Cool Use Cases

1. **Intelligent Route Planning**
   - "Plan the most efficient route to visit all these places"
   - AI calculates optimal order based on distances

2. **Activity Suggestions**
   - "What can we do near our hotel?"
   - AI searches nearby and suggests relevant activities

3. **Travel Time Estimates**
   - "How long will it take to drive from here to there?"
   - Provides real-time traffic-based estimates

4. **Multi-Stop Tours**
   - "Create a day tour covering museum, lunch spot, and park"
   - Plans entire route with timing

5. **Local Discovery**
   - "Find hidden gems in this neighborhood"
   - Discovers and recommends places

---

**Your AI agent is now a complete travel and event planning assistant! 🚀🗺️**
