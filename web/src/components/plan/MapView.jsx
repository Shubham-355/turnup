import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { MapPin, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create numbered icon
const createNumberedIcon = (number) => {
  return L.divIcon({
    className: 'custom-numbered-icon',
    html: `<div style="background-color: #9333ea; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${number}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// Component to fit map bounds to markers
const FitBounds = ({ positions }) => {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);
  
  return null;
};

const MapView = ({ activities }) => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Filter activities with valid coordinates
  const activitiesWithLocation = activities.filter(
    activity => activity.latitude && activity.longitude
  );

  // Get route from backend
  useEffect(() => {
    const fetchRoute = async () => {
      if (activitiesWithLocation.length < 2) {
        setRouteCoordinates([]);
        return;
      }

      try {
        setIsLoadingRoute(true);
        const planId = activitiesWithLocation[0]?.planId;
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/plans/${planId}/route`, {
          headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch route');

        const data = await response.json();
        
        // Backend returns route with polyline or coordinates
        if (data.data?.route?.coordinates) {
          // Use coordinates from backend route
          setRouteCoordinates(data.data.route.coordinates.map(coord => [coord.lat, coord.lng]));
        } else if (data.data?.activities) {
          // Fallback: use activity coordinates in order
          setRouteCoordinates(
            data.data.activities
              .filter(a => a.latitude && a.longitude)
              .map(a => [a.latitude, a.longitude])
          );
        } else {
          // Final fallback: draw straight lines between points
          setRouteCoordinates(
            activitiesWithLocation.map(a => [a.latitude, a.longitude])
          );
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        // Fallback: draw straight lines between points
        setRouteCoordinates(
          activitiesWithLocation.map(a => [a.latitude, a.longitude])
        );
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [activitiesWithLocation.length]);

  if (activitiesWithLocation.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center">
        <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No locations added</h3>
        <p className="text-gray-600">
          Add activities with locations to see them on the map and view your route.
        </p>
      </div>
    );
  }

  const defaultCenter = [activitiesWithLocation[0].latitude, activitiesWithLocation[0].longitude];
  const positions = activitiesWithLocation.map(a => [a.latitude, a.longitude]);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg">
      <div className="h-[500px] relative">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Fit bounds to show all markers */}
          <FitBounds positions={positions} />
          
          {/* Draw route line */}
          {routeCoordinates.length > 0 && (
            <Polyline
              positions={routeCoordinates}
              color="#9333ea"
              weight={4}
              opacity={0.8}
            />
          )}
          
          {/* Activity markers with numbers */}
          {activitiesWithLocation.map((activity, index) => (
            <Marker
              key={activity.id}
              position={[activity.latitude, activity.longitude]}
              icon={createNumberedIcon(index + 1)}
            >
              <Popup>
                <div className="p-2">
                  <div className="font-semibold text-purple-600 mb-1">
                    {index + 1}. {activity.name}
                  </div>
                  {activity.locationName && (
                    <div className="text-sm text-gray-600 mb-1">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {activity.locationName}
                    </div>
                  )}
                  {activity.locationAddress && (
                    <div className="text-xs text-gray-500">
                      {activity.locationAddress}
                    </div>
                  )}
                  {(activity.date || activity.time) && (
                    <div className="text-xs text-gray-500 mt-1">
                      {activity.date && new Date(activity.date).toLocaleDateString()}
                      {activity.date && activity.time && ' at '}
                      {activity.time}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {isLoadingRoute && (
          <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md text-sm text-gray-600 z-[1000]">
            <Navigation className="w-4 h-4 inline mr-2 animate-spin" />
            Loading route...
          </div>
        )}
      </div>
      
      {/* Route Summary */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {activitiesWithLocation.length} {activitiesWithLocation.length === 1 ? 'Location' : 'Locations'}
            </div>
            <div className="text-xs text-gray-500">
              Click markers to see activity details
            </div>
          </div>
          {routeCoordinates.length > 1 && (
            <div className="text-sm text-purple-600 font-medium">
              Route mapped
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
