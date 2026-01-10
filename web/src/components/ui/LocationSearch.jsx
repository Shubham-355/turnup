import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader } from 'lucide-react';
import Input from './Input';

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
            <Loader className="w-4 h-4 animate-spin text-purple-600" />
          </div>
        )}
        
        {searchQuery && !isSearching && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
          {results.map((place) => (
            <button
              key={place.placeId}
              type="button"
              onClick={() => handleSelectPlace(place)}
              className="w-full px-4 py-3 text-left hover:bg-purple-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-purple-600 mr-3 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {place.name}
                  </div>
                  {place.address && (
                    <div className="text-sm text-gray-500 truncate">
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
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500">
          No locations found. Try a different search term.
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
