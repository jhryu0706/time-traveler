import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTimezoneFromCoordinates } from '@/utils/timezone';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Red marker for selection
const redMarkerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path fill="#ef4444" stroke="#b91c1c" stroke-width="1" d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z"/>
      <circle fill="white" cx="12" cy="12" r="5"/>
    </svg>
  `),
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -36],
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-card-lg w-full max-w-3xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Select Location</h3>
            <p className="text-sm text-muted-foreground">{country.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Map */}
        <div className="h-96 relative">
          <MapContainer
            center={[country.lat, country.lng]}
            zoom={country.zoom}
            className="h-full w-full"
            style={{ background: 'hsl(var(--muted))' }}
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
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-md">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Click on the map to place a pin
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          {selectedPosition ? (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-destructive" />
                  <span className="font-mono text-foreground">
                    {selectedPosition.lat.toFixed(4)}, {selectedPosition.lng.toFixed(4)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Timezone: {timezone}
                </p>
              </div>
              <Button onClick={handleSubmit} className="gap-2">
                <Check className="w-4 h-4" />
                Submit
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">No location selected</p>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
