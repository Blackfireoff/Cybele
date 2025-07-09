
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FriendModal } from './FriendModal';
import { CreatePointModal } from './CreatePointModal';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { apiService, CustomPoint as ApiCustomPoint, Friend as ApiFriend } from '../lib/api';

interface Friend {
  id: string | number;
  name: string;
  status: string;
  avatar: string;
  location: {
    country: string;
    city: string;
    lat: number;
    lng: number;
  };
  posts: Array<{
    id: string;
    image: string;
    caption: string;
    timestamp: string;
  }>;
}

interface CustomPoint {
  id: string | number;
  lat: number;
  lng: number;
  name: string;
  description?: string;
  image_url?: string;
  type: 'custom';
}

const mockFriends: Friend[] = [
  {
    id: '1',
    name: 'Emma Johnson',
    status: 'Loving the café culture in Paris! ☕',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3fd?w=150&h=150&fit=crop&crop=face',
    location: { country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
    posts: [
      {
        id: '1',
        image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
        caption: 'Sunset from my dorm window in Paris',
        timestamp: '2 hours ago'
      }
    ]
  },
  {
    id: '2',
    name: 'Marco Silva',
    status: 'Study sessions at the library 📚',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: { country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    posts: [
      {
        id: '2',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
        caption: 'Cherry blossoms are incredible here!',
        timestamp: '1 day ago'
      }
    ]
  },
  {
    id: '3',
    name: 'Sarah Chen',
    status: 'Exploring ancient history 🏛️',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    location: { country: 'Italy', city: 'Rome', lat: 41.9028, lng: 12.4964 },
    posts: [
      {
        id: '3',
        image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&h=300&fit=crop',
        caption: 'The Colosseum never gets old',
        timestamp: '3 days ago'
      }
    ]
  }
];

export const Globe = () => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [customPoints, setCustomPoints] = useState<CustomPoint[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isCreatePointModalOpen, setIsCreatePointModalOpen] = useState(false);
  const [clickCoordinates, setClickCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load friends and custom points from API
        const [apiCustomPoints, apiFriends] = await Promise.all([
          apiService.getCustomPoints(),
          apiService.getFriends()
        ]);

        // Convert API data to component format
        const convertedCustomPoints: CustomPoint[] = apiCustomPoints.map(point => ({
          id: point.id,
          lat: point.lat,
          lng: point.lng,
          name: point.name,
          description: point.description,
          image_url: point.image_url,
          type: 'custom' as const
        }));

        const convertedFriends: Friend[] = apiFriends.map(friend => ({
          id: friend.id.toString(),
          name: friend.name,
          status: friend.status || '',
          avatar: friend.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          location: {
            country: friend.country || '',
            city: friend.city || '',
            lat: friend.lat,
            lng: friend.lng,
          },
          posts: [] // We'll implement posts later if needed
        }));

        setCustomPoints(convertedCustomPoints);
        setFriends(convertedFriends);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback to mock data if API fails
        setFriends(mockFriends);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle point creation
  const handlePointCreated = async () => {
    try {
      const apiCustomPoints = await apiService.getCustomPoints();
      const convertedCustomPoints: CustomPoint[] = apiCustomPoints.map(point => ({
        id: point.id,
        lat: point.lat,
        lng: point.lng,
        name: point.name,
        description: point.description,
        image_url: point.image_url,
        type: 'custom' as const
      }));
      setCustomPoints(convertedCustomPoints);
    } catch (error) {
      console.error('Failed to reload custom points:', error);
    }
  };

  // Handle point deletion
  const handleDeletePoint = async (pointId: string | number) => {
    try {
      await apiService.deleteCustomPoint(Number(pointId));
      setCustomPoints(prev => prev.filter(p => p.id !== pointId));
    } catch (error) {
      console.error('Failed to delete point:', error);
    }
  };

  // Fix Leaflet default icons
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Component for handling map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setClickCoordinates({ lat, lng });
        setIsCreatePointModalOpen(true);
      }
    });
    return null;
  };

  // Custom icon for custom points
  const customIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Clear Points Button */}
      {customPoints.length > 0 && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomPoints([])}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 shadow-lg"
          >
            <span className="hidden sm:inline">Clear Points ({customPoints.length})</span>
            <span className="sm:hidden">Clear ({customPoints.length})</span>
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-20 bg-black/80 text-white text-xs sm:text-sm p-2 sm:p-3 rounded-lg max-w-[180px] sm:max-w-xs shadow-lg">
        <div className="font-semibold mb-1">Controls:</div>
        <div>• Click anywhere to add a point</div>
        <div className="hidden sm:block">• Drag to pan, scroll to zoom</div>
        <div className="sm:hidden">• Drag & scroll</div>
        <div className="hidden sm:block">• Click friend pins to view details</div>
        <div className="sm:hidden">• Click pins for details</div>
      </div>

      {/* Map View */}
      <div className="absolute inset-0 w-full h-full">
          <MapContainer
            center={[20, 0]}
            zoom={window.innerWidth < 640 ? 1 : 2}
            style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
            className="rounded-lg"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
            
            {/* Friend Markers */}
            {friends.map((friend) => (
              <Marker
                key={friend.id}
                position={[friend.location.lat, friend.location.lng]}
              >
                <Popup>
                  <div className="p-2">
                    <div className="flex items-center gap-2 mb-2">
                      <img 
                        src={friend.avatar} 
                        alt={friend.name}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-sm sm:text-base">{friend.name}</div>
                        <div className="text-xs text-gray-600">
                          {friend.location.city}, {friend.location.country}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm italic text-gray-700">{friend.status}</div>
                    <Button 
                      size="sm" 
                      className="mt-2 w-full text-xs"
                      onClick={() => setSelectedFriend(friend)}
                    >
                      View Profile
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Custom Point Markers */}
            {customPoints.map((point) => (
              <Marker
                key={point.id}
                position={[point.lat, point.lng]}
                icon={customIcon}
              >
                <Popup>
                  <div className="p-2">
                    <div className="flex items-center gap-2 mb-2">
                      {point.image_url && (
                        <img 
                          src={`http://localhost:8000${point.image_url}`}
                          alt={point.name}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-sm sm:text-base">{point.name}</div>
                        <div className="text-xs text-gray-600">
                          {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                    {point.description && (
                      <div className="text-xs sm:text-sm text-gray-700 mb-2">{point.description}</div>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="flex-1 text-xs"
                        onClick={() => handleDeletePoint(point.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

      {/* Create Point Modal */}
      <CreatePointModal
        isOpen={isCreatePointModalOpen}
        onClose={() => setIsCreatePointModalOpen(false)}
        onPointCreated={handlePointCreated}
        initialLat={clickCoordinates?.lat || 0}
        initialLng={clickCoordinates?.lng || 0}
      />

      {/* Friend Modal */}
      {selectedFriend && (
        <FriendModal
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
        />
      )}
    </div>
  );
};
