import React, { useEffect, useRef } from 'react';

const GoogleMapRoute = ({ route, origin, destination }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!route && !origin && !destination) return;

    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 7,
        center: { lat: 37.7749, lng: -122.4194 },
        mapTypeControl: true,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;

      // If we have a route polyline, decode and display it
      if (route?.overview_polyline) {
        displayPolyline(map, route.overview_polyline);
      } else if (origin && destination) {
        // Otherwise, use Directions Service
        displayDirections(map, origin, destination);
      }
    };

    const displayPolyline = (map, polyline) => {
      const decodedPath = decodePolyline(polyline);
      
      const routePath = new window.google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: '#7C3AED',
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });

      routePath.setMap(map);

      // Fit bounds to show entire route
      const bounds = new window.google.maps.LatLngBounds();
      decodedPath.forEach(point => bounds.extend(point));
      map.fitBounds(bounds);

      // Add start and end markers
      if (decodedPath.length > 0) {
        new window.google.maps.Marker({
          position: decodedPath[0],
          map: map,
          label: 'A',
          title: 'Start',
        });

        new window.google.maps.Marker({
          position: decodedPath[decodedPath.length - 1],
          map: map,
          label: 'B',
          title: 'End',
        });
      }
    };

    const displayDirections = (map, origin, destination) => {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: map,
        polylineOptions: {
          strokeColor: '#7C3AED',
          strokeOpacity: 1.0,
          strokeWeight: 4,
        },
      });

      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
          } else {
            console.error('Directions request failed:', status);
          }
        }
      );
    };

    // Decode polyline (Google's encoding algorithm)
    const decodePolyline = (encoded) => {
      const poly = [];
      let index = 0, len = encoded.length;
      let lat = 0, lng = 0;

      while (index < len) {
        let b, shift = 0, result = 0;
        do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        poly.push({
          lat: lat / 1e5,
          lng: lng / 1e5,
        });
      }
      return poly;
    };

    loadGoogleMaps();

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [route, origin, destination]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '400px', 
        borderRadius: '8px',
        marginTop: '16px'
      }}
    />
  );
};

export default GoogleMapRoute;
