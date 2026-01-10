import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader } from 'lucide-react';
import Input from './Input';
import { colors, borderRadius, shadows } from '../../theme';

const LocationSearch = ({ value, onChange, placeholder = "Search location..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const searchRef = useRef(null);

  // Initialize with value if provided
  useEffect(() => {
    if (value) {
      setSelectedPlace(value);
      setSearchQuery(value.name || '');
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/maps/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
          },
        });
        
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        setResults(data.data || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectPlace = async (place) => {
    try {
      // Get detailed place info
      const response = await fetch(`${import.meta.env.VITE_API_URL}/maps/place/${place.placeId}`, {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to get place details');

      const data = await response.json();
      const details = data.data;

      setSelectedPlace(details);
      setSearchQuery(details.name);
      setShowResults(false);
      
      // Call parent onChange with full place details
      onChange?.({
        name: details.name,
        address: details.address,
        latitude: details.latitude,
        longitude: details.longitude,
        placeId: details.placeId,
      });
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedPlace(null);
    setResults([]);
    setShowResults(false);
    onChange?.(null);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    
    // If user clears or edits, clear selection
    if (!newValue || (selectedPlace && newValue !== selectedPlace.name)) {
      setSelectedPlace(null);
      onChange?.(null);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Input
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={placeholder}
          icon={MapPin}
        />
        
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader className="w-4 h-4 animate-spin" style={{ color: colors.primary }} />
          </div>
        )}
        
        {searchQuery && !isSearching && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
            style={{ color: colors.textTertiary }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div 
          className="absolute z-50 w-full mt-2 max-h-80 overflow-y-auto"
          style={{
            backgroundColor: colors.background,
            borderRadius: borderRadius.lg,
            boxShadow: shadows.lg,
            border: `1px solid ${colors.border}`,
          }}
        >
          {results.map((place) => (
            <button
              key={place.placeId}
              type="button"
              onClick={() => handleSelectPlace(place)}
              className="w-full px-4 py-3 text-left border-b last:border-b-0 transition-colors hover:opacity-90"
              style={{ 
                borderColor: colors.divider,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.surfaceLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-3 mt-1 flex-shrink-0" style={{ color: colors.primary }} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" style={{ color: colors.text }}>
                    {place.name}
                  </div>
                  {place.address && (
                    <div className="text-sm truncate" style={{ color: colors.textSecondary }}>
                      {place.address}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showResults && searchQuery.length >= 3 && results.length === 0 && !isSearching && (
        <div 
          className="absolute z-50 w-full mt-2 p-4 text-center"
          style={{
            backgroundColor: colors.background,
            borderRadius: borderRadius.lg,
            boxShadow: shadows.lg,
            border: `1px solid ${colors.border}`,
            color: colors.textSecondary,
          }}
        >
          No locations found. Try a different search term.
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
