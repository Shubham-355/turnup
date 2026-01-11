import { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, RefreshCw, Maximize2 } from 'lucide-react';
import { colors } from '../../theme';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const MapView = ({ activities }) => {
  const mapContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Filter activities with valid coordinates
  const activitiesWithLocation = activities?.filter(
    activity => activity.latitude && activity.longitude
  ) || [];

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.log('Geolocation error:', err);
        }
      );
    }
  }, []);

  // Generate the map HTML
  const getMapHTML = () => {
    const activityMarkers = activitiesWithLocation.map((a, index) => ({
      lat: a.latitude,
      lng: a.longitude,
      name: a.locationName || a.name || `Stop ${index + 1}`,
      address: a.locationAddress || '',
      order: index + 1,
    }));

    // Calculate center
    const centerLat = activityMarkers[0]?.lat || userLocation?.lat || 37.7749;
    const centerLng = activityMarkers[0]?.lng || userLocation?.lng || -122.4194;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #6B7280;
      background: #F9FAFB;
    }
    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #EF4444;
      background: #FEE2E2;
      padding: 20px;
      text-align: center;
    }
    .legend {
      position: absolute;
      bottom: 20px;
      left: 20px;
      background: white;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      z-index: 1000;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .legend-item:last-child { margin-bottom: 0; }
    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    .info-window {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 8px;
      min-width: 150px;
    }
    .info-window h4 {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
    }
    .info-window p {
      font-size: 12px;
      color: #6B7280;
      margin: 0;
    }
    .info-window .order {
      display: inline-block;
      background: ${colors.success};
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      text-align: center;
      line-height: 20px;
      font-size: 11px;
      font-weight: bold;
      margin-right: 6px;
    }
  </style>
</head>
<body>
  <div id="map"><div class="loading">Loading Google Maps...</div></div>
  
  <div class="legend">
    <div class="legend-item">
      <div class="legend-dot" style="background: #4285F4;"></div>
      <span>Your Location</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background: ${colors.success};"></div>
      <span>Venues</span>
    </div>
    <div class="legend-item">
      <div style="width: 20px; height: 4px; background: #7C3AED; border-radius: 2px;"></div>
      <span>Route</span>
    </div>
  </div>

  <script>
    let map;
    let directionsService;
    let directionsRenderer;
    
    function initMap() {
      try {
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 13,
          center: { lat: ${centerLat}, lng: ${centerLng} },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'off' }] }
          ]
        });

        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#7C3AED',
            strokeOpacity: 0.8,
            strokeWeight: 5,
          }
        });

        const bounds = new google.maps.LatLngBounds();

        // User location marker (blue dot)
        ${userLocation ? `
        const userMarker = new google.maps.Marker({
          position: { lat: ${userLocation.lat}, lng: ${userLocation.lng} },
          map: map,
          title: 'Your Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
          },
          zIndex: 1000
        });
        bounds.extend({ lat: ${userLocation.lat}, lng: ${userLocation.lng} });
        ` : ''}

        // Activity/Venue markers
        const activityLocations = ${JSON.stringify(activityMarkers)};
        
        activityLocations.forEach((activity, index) => {
          const marker = new google.maps.Marker({
            position: { lat: activity.lat, lng: activity.lng },
            map: map,
            title: activity.name,
            label: {
              text: String(index + 1),
              color: '#FFFFFF',
              fontWeight: 'bold',
              fontSize: '14px'
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 18,
              fillColor: '${colors.success}',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3,
            },
            zIndex: 500
          });
          
          const infoWindow = new google.maps.InfoWindow({
            content: \`
              <div class="info-window">
                <h4><span class="order">\${index + 1}</span>\${activity.name}</h4>
                \${activity.address ? '<p>' + activity.address + '</p>' : ''}
              </div>
            \`
          });
          
          marker.addListener('click', () => infoWindow.open(map, marker));
          bounds.extend({ lat: activity.lat, lng: activity.lng });
        });

        // Fit bounds if we have markers
        if (activityLocations.length > 0 || ${userLocation ? 'true' : 'false'}) {
          map.fitBounds(bounds, { padding: 60 });
          
          // Don't zoom in too much for single marker
          google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
            if (map.getZoom() > 16) map.setZoom(16);
          });
        }

        // Draw route between activities
        if (activityLocations.length >= 2) {
          const waypoints = activityLocations.slice(1, -1).map(loc => ({
            location: new google.maps.LatLng(loc.lat, loc.lng),
            stopover: true
          }));

          directionsService.route({
            origin: new google.maps.LatLng(activityLocations[0].lat, activityLocations[0].lng),
            destination: new google.maps.LatLng(
              activityLocations[activityLocations.length - 1].lat,
              activityLocations[activityLocations.length - 1].lng
            ),
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false,
          }, (result, status) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(result);
            } else {
              console.log('Directions request failed:', status);
            }
          });
        }
        
        // Notify parent that map loaded
        window.parent.postMessage({ type: 'mapLoaded' }, '*');
        
      } catch (error) {
        document.getElementById('map').innerHTML = '<div class="error"><strong>Map Error</strong><p>' + error.message + '</p></div>';
      }
    }
    
    // Error handler
    function handleMapError() {
      document.getElementById('map').innerHTML = '<div class="error"><strong>Failed to load Google Maps</strong><p>Please check your API key and internet connection.</p></div>';
    }
  </script>
  <script 
    src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap" 
    async 
    defer
    onerror="handleMapError()"
  ></script>
</body>
</html>
    `;
  };

  useEffect(() => {
    if (mapContainerRef.current && (activitiesWithLocation.length > 0 || userLocation)) {
      const iframe = mapContainerRef.current.querySelector('iframe');
      if (iframe) {
        iframe.srcdoc = getMapHTML();
      }
    }
  }, [activitiesWithLocation.length, userLocation]);

  // Listen for map loaded message
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'mapLoaded') {
        setIsLoading(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (activitiesWithLocation.length === 0) {
    return (
      <div 
        className="rounded-xl p-12 text-center"
        style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
      >
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: colors.surfaceLight }}
        >
          <MapPin className="w-10 h-10" style={{ color: colors.textTertiary }} />
        </div>
        <h3 
          className="text-xl font-semibold mb-2"
          style={{ color: colors.text }}
        >
          No locations added
        </h3>
        <p style={{ color: colors.textSecondary }}>
          Add activities with locations to see them on the map and view your route.
        </p>
      </div>
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div 
        className="rounded-xl p-12 text-center"
        style={{ backgroundColor: colors.errorLight, border: `1px solid ${colors.error}` }}
      >
        <MapPin className="w-16 h-16 mx-auto mb-4" style={{ color: colors.error }} />
        <h3 
          className="text-xl font-semibold mb-2"
          style={{ color: colors.error }}
        >
          Google Maps API Key Missing
        </h3>
        <p style={{ color: colors.error }}>
          Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl overflow-hidden shadow-lg"
      style={{ backgroundColor: colors.background }}
    >
      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="relative"
        style={{ height: '500px' }}
      >
        <iframe
          srcDoc={getMapHTML()}
          className="w-full h-full border-0"
          title="Google Maps"
          allow="geolocation"
        />
        
        {isLoading && (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: colors.surface }}
          >
            <div className="text-center">
              <RefreshCw 
                className="w-8 h-8 animate-spin mx-auto mb-2" 
                style={{ color: colors.primary }}
              />
              <p style={{ color: colors.textSecondary }}>Loading map...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Route Summary */}
      <div 
        className="p-4"
        style={{ 
          backgroundColor: colors.surface,
          borderTop: `1px solid ${colors.border}` 
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div 
              className="text-sm font-medium"
              style={{ color: colors.text }}
            >
              {activitiesWithLocation.length} {activitiesWithLocation.length === 1 ? 'Location' : 'Locations'}
            </div>
            <div 
              className="text-xs"
              style={{ color: colors.textSecondary }}
            >
              Click markers to see activity details
            </div>
          </div>
          {activitiesWithLocation.length > 1 && (
            <div 
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: colors.primary }}
            >
              <Navigation className="w-4 h-4" />
              Route mapped
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
