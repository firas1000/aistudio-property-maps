import React, { useState, useCallback } from 'react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { X, Check, MapPin, Search } from 'lucide-react';
import { isValidLatLng } from '../utils/coordinateParser';

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat: number;
  initialLng: number;
  apiKey: string;
  onSelectCoordinates: (lat: number, lng: number) => void;
}

export const MapPickerModal: React.FC<MapPickerModalProps> = ({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  apiKey,
  onSelectCoordinates,
}) => {
  const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number }>({
    lat: isValidLatLng(initialLat, initialLng) ? initialLat : 34.025922,
    lng: isValidLatLng(initialLat, initialLng) ? initialLng : -118.779757,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleMapClick = useCallback((e: any) => {
    if (e.detail && e.detail.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      setSelectedPos({ lat, lng });
    }
  }, []);

  const handleConfirm = () => {
    onSelectCoordinates(selectedPos.lat, selectedPos.lng);
    onClose();
  };

  const handleGeocodeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !apiKey) return;

    setIsSearching(true);
    try {
      // Use client geocoder if available in window.google.maps or simple query
      if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ address: searchQuery }, (results: any, status: any) => {
          setIsSearching(false);
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location;
            setSelectedPos({ lat: loc.lat(), lng: loc.lng() });
          }
        });
      } else {
        setIsSearching(false);
      }
    } catch {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col border border-stone-200 max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-lg">Pick Coordinates on Google Maps</h3>
              <p className="text-xs text-stone-500">
                Click anywhere on the map to place the pin at the exact property location.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar inside modal */}
        <div className="p-3 bg-stone-100 border-b border-stone-200">
          <form onSubmit={handleGeocodeSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search an address, city, landmark to center the map..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-stone-900"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSearching ? 'Finding...' : 'Jump'}
            </button>
          </form>
        </div>

        {/* Map View Container */}
        <div className="relative w-full h-[460px] bg-stone-200">
          {apiKey ? (
            <APIProvider apiKey={apiKey}>
              <GoogleMap
                mapId="DEMO_MAP_ID"
                style={{ width: '100%', height: '100%' }}
                defaultCenter={selectedPos}
                center={selectedPos}
                defaultZoom={15}
                onClick={handleMapClick}
                gestureHandling="greedy"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              >
                <AdvancedMarker position={selectedPos}>
                  <Pin background="#4F46E5" borderColor="#312E81" glyphColor="#FFFFFF" />
                </AdvancedMarker>
              </GoogleMap>
            </APIProvider>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 p-6 text-center">
              <p className="font-medium text-stone-800 mb-1">Google Maps API key is not configured</p>
              <p className="text-xs max-w-md text-stone-500">
                Please ensure your Google Maps API key is provided via the setup dialog or environment variables.
              </p>
            </div>
          )}

          {/* Floating coordinate indicator badge */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-stone-200 text-xs font-mono text-stone-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Lat: <strong>{selectedPos.lat.toFixed(6)}</strong> | Lng:{' '}
              <strong>{selectedPos.lng.toFixed(6)}</strong>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            Selected: <span className="font-semibold text-stone-800">{selectedPos.lat.toFixed(6)}, {selectedPos.lng.toFixed(6)}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 text-sm font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Use These Coordinates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
