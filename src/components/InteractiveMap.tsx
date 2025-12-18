import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTimezoneFromCoordinates } from '@/utils/timezone';
import 'leaflet/dist/leaflet.css';

// Red marker for selection
const redMarkerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
      <path fill="#ef4444" stroke="#b91c1c" stroke-width="1" d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z"/>
      <circle fill="white" cx="12" cy="12" r="5"/>
    </svg>
  `),
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

interface InteractiveMapProps {
  country: { name: string; lat: number; lng: number; zoom: number };
  onSelect: (lat: number, lng: number, timezone: string) => void;
  onClose: () => void;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function InteractiveMap({ country, onSelect, onClose }: InteractiveMapProps) {
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [timezone, setTimezone] = useState<string>('');

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
    const tz = getTimezoneFromCoordinates(lat, lng);
    setTimezone(tz);
  };

  const handleSubmit = () => {
    if (selectedPosition) {
      onSelect(selectedPosition.lat, selectedPosition.lng, timezone);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card safe-top">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate">Select Location</h3>
          <p className="text-sm text-muted-foreground truncate">{country.name}</p>
        </div>
        <button
          onClick={onClose}
          className="p-3 -mr-2 touch-active"
          aria-label="Close map"
        >
          <X className="w-6 h-6 text-muted-foreground" />
        </button>
      </header>

      {/* Map - Full height */}
      <div className="flex-1 relative">
        <MapContainer
          center={[country.lat, country.lng]}
          zoom={country.zoom}
          className="h-full w-full"
          style={{ background: 'hsl(var(--muted))' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={[country.lat, country.lng]} zoom={country.zoom} />
          <MapClickHandler onMapClick={handleMapClick} />
          {selectedPosition && (
            <Marker position={[selectedPosition.lat, selectedPosition.lng]} icon={redMarkerIcon} />
          )}
        </MapContainer>
        
        {/* Click instruction overlay */}
        {!selectedPosition && (
          <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm px-4 py-3 rounded-xl border border-border shadow-lg">
            <p className="text-base text-muted-foreground flex items-center gap-3">
              <MapPin className="w-5 h-5 flex-shrink-0" />
              Tap on the map to place a pin
            </p>
          </div>
        )}
      </div>

      {/* Footer - Sticky bottom */}
      <footer className="px-4 py-4 border-t border-border bg-card safe-bottom">
        {selectedPosition ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-mono text-foreground text-base block">
                  {selectedPosition.lat.toFixed(4)}, {selectedPosition.lng.toFixed(4)}
                </span>
                <p className="text-sm text-muted-foreground truncate">
                  {timezone}
                </p>
              </div>
            </div>
            <Button onClick={handleSubmit} className="w-full h-12 text-base gap-2 touch-active">
              <Check className="w-5 h-5" />
              Confirm Location
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={onClose} className="w-full h-12 text-base touch-active">
            Cancel
          </Button>
        )}
      </footer>
    </div>
  );
}
