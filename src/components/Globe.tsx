
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FriendModal } from './FriendModal';
import { CreatePostcardMapModal } from './CreatePostcardMapModal';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { apiService, CustomPoint as ApiCustomPoint, Friend as ApiFriend, Postcard } from '../lib/api';

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
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [isCreatePostcardModalOpen, setIsCreatePostcardModalOpen] = useState(false);
  const [clickCoordinates, setClickCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load friends, custom points, and postcards from API
        const [apiCustomPoints, apiFriends, apiPostcards] = await Promise.all([
          apiService.getCustomPoints(),
          apiService.getFriends(),
          apiService.getPostcards()
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

        // Map postcards by friend location to add to friends data
        const postcardsByLocation = new Map<string, any[]>();
        apiPostcards.forEach(postcard => {
          const locationKey = `${postcard.lat.toFixed(4)},${postcard.lng.toFixed(4)}`;
          if (!postcardsByLocation.has(locationKey)) {
            postcardsByLocation.set(locationKey, []);
          }
          
          // Build complete image URL with the proper host and port
          const imageUrl = apiService.getCompleteImageUrl(postcard.image_url);
            
          postcardsByLocation.get(locationKey)?.push({
            id: postcard.id.toString(),
            image: imageUrl,
            caption: postcard.caption,
            timestamp: new Date(postcard.created_at).toLocaleDateString()
          });
        });

        const convertedFriends: Friend[] = apiFriends.map(friend => {
          const locationKey = `${friend.lat.toFixed(4)},${friend.lng.toFixed(4)}`;
          const friendPosts = postcardsByLocation.get(locationKey) || [];
          
          return {
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
            posts: friendPosts
          };
        });

        setCustomPoints(convertedCustomPoints);
        setFriends(convertedFriends);
        setPostcards(apiPostcards);
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

  // Handle postcard creation and reload data
  const handlePostcardCreated = async () => {
    try {
      // Reload postcards
      const apiPostcards = await apiService.getPostcards();
      setPostcards(apiPostcards);
      
      // Update friends with new postcards data
      const updatedFriends = [...friends];
      apiPostcards.forEach(postcard => {
        // Find friends near this postcard location
        const nearbyFriends = updatedFriends.filter(friend => 
          Math.abs(friend.location.lat - postcard.lat) < 0.01 && 
          Math.abs(friend.location.lng - postcard.lng) < 0.01
        );
        
        // Add postcard to friend's posts if found
        nearbyFriends.forEach(friend => {
          if (!friend.posts) friend.posts = [];
          
          // Check if postcard already exists in friend's posts
          const existingPostIndex = friend.posts.findIndex(post => post.id === postcard.id.toString());
          
          if (existingPostIndex === -1) {
            friend.posts.push({
              id: postcard.id.toString(),
              image: `http://localhost:8001${postcard.image_url}`,
              caption: postcard.caption,
              timestamp: new Date(postcard.created_at).toLocaleDateString()
            });
          }
        });
      });
      
      setFriends(updatedFriends);
      
      // Also reload custom points just in case
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
      console.error('Failed to reload data:', error);
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
        setIsCreatePostcardModalOpen(true);
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
            <span className="hidden sm:inline">Clear Custom Points ({customPoints.length})</span>
            <span className="sm:hidden">Clear ({customPoints.length})</span>
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-20 bg-black/80 text-white text-xs sm:text-sm p-2 sm:p-3 rounded-lg max-w-[180px] sm:max-w-xs shadow-lg">
        <div className="font-semibold mb-1">Controls:</div>
        <div>• Click anywhere to create a postcard</div>
        <div className="hidden sm:block">• Drag to pan, scroll to zoom</div>
        <div className="sm:hidden">• Drag & scroll</div>
        <div className="hidden sm:block">• Click friend pins to view profile</div>
        <div className="sm:hidden">• Click pins for profiles</div>
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
                <Popup maxWidth={300} className="custom-popup">
                  <div className="p-3 max-w-xs">
                    {/* Clickable header with profile picture and name */}
                    <div 
                      className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition-colors"
                      onClick={() => setSelectedFriend(friend)}
                      title="Click to view full profile"
                    >
                      <img 
                        src={friend.avatar} 
                        alt={friend.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-blue-200 shadow-sm map-profile-hover"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-sm sm:text-base text-blue-700 hover:text-blue-900 transition-colors">
                          {friend.name}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                          📍 {friend.location.city}, {friend.location.country}
                        </div>
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div className="text-xs sm:text-sm italic text-gray-700 mb-3 px-2 py-1 bg-gray-50 rounded">
                      💭 {friend.status}
                    </div>
                    
                    {/* Latest post image - only for mock friends that have posts */}
                    {friend.posts && friend.posts.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                          📸 Latest post
                        </div>
                        <img 
                          src={friend.posts[0].image}
                          alt={friend.posts[0].caption}
                          className="w-full h-28 sm:h-36 object-cover rounded-lg border border-gray-200 shadow-sm postcard-image-hover"
                        />
                        <div className="text-xs text-gray-700 mt-2 line-clamp-2 font-medium">
                          {friend.posts[0].caption}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          🕒 {friend.posts[0].timestamp}
                        </div>
                      </div>
                    )}
                    
                    {/* Show placeholder for friends without posts */}
                    {(!friend.posts || friend.posts.length === 0) && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                          📸 Recent posts
                        </div>
                        <div className="w-full h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-400">No photos yet</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Hint text */}
                    <div className="text-xs text-gray-400 italic text-center py-2 border-t border-gray-100">
                      👆 Click name or photo to view full profile
                    </div>
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
                          src={apiService.getCompleteImageUrl(point.image_url)}
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

      {/* Create Postcard Modal */}
      <CreatePostcardMapModal
        isOpen={isCreatePostcardModalOpen}
        onClose={() => setIsCreatePostcardModalOpen(false)}
        onPostcardCreated={handlePostcardCreated}
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
