import { useState, useRef, useEffect } from "react";
import { Search, MapPin } from "lucide-react";

interface LocationSearchBarProps {
  onLocationSelect: (location: { name: string; lat: number; lng: number }) => void;
  currentLocation?: string;
}

export function LocationSearchBar({ onLocationSelect, currentLocation }: LocationSearchBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    if (!inputRef.current || !(window as any).google) return;

    const google = (window as any).google;
    
    // Initialize Google Places Autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode", "establishment"],
      fields: ["name", "geometry", "formatted_address"],
    });

    // Listen for place selection
    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const name = place.name || place.formatted_address || "Unknown Location";
        
        onLocationSelect({ name, lat, lng });
        setSearchValue("");
        setIsExpanded(false);
        inputRef.current?.blur();
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onLocationSelect]);

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!searchValue) {
        setIsExpanded(false);
      }
    }, 200);
  };

  return (
    <div 
      className={`
        bg-white/80 backdrop-blur-md rounded-full shadow-lg
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-96' : 'w-72'}
      `}
      data-testid="location-search-bar"
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <MapPin className="h-4 w-4 text-gray-600 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={currentLocation || "Search location..."}
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder:text-gray-500"
          data-testid="input-location-search"
        />
        <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </div>
    </div>
  );
}
