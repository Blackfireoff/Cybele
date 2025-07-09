
import React, { useEffect, useRef, useState } from 'react';
import ThreeGlobe from 'three-globe';
import * as THREE from 'three';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FriendModal } from './FriendModal';
import { CreatePointModal } from './CreatePointModal';
import { Button } from './ui/button';
import { Globe as GlobeIcon, Map, Plus } from 'lucide-react';
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
  const mountRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<ThreeGlobe>();
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const frameRef = useRef<number>();
  
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [viewMode, setViewMode] = useState<'globe' | 'map'>('map'); // Changed default to map
  const [customPoints, setCustomPoints] = useState<CustomPoint[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isCreatePointModalOpen, setIsCreatePointModalOpen] = useState(false);
  const [clickCoordinates, setClickCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const mouseRef = useRef({ x: 0, y: 0 });

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

  useEffect(() => {
    if (!mountRef.current || viewMode !== 'globe') return;

    // Calculate responsive dimensions that fit within the container
    const container = mountRef.current;
    const containerRect = container.getBoundingClientRect();
    const availableWidth = containerRect.width - 16; // Account for padding
    const availableHeight = containerRect.height - 16; // Account for padding
    
    // Use the smaller dimension to ensure it fits, with reasonable limits
    const size = Math.min(availableWidth, availableHeight, 600);
    const minSize = 200; // Minimum size for usability
    const responsiveSize = Math.max(size, minSize);

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(responsiveSize, responsiveSize);
    renderer.setClearColor(0x000000, 0);
    
    // Style the canvas to be centered and contained
    renderer.domElement.style.maxWidth = '100%';
    renderer.domElement.style.maxHeight = '100%';
    renderer.domElement.style.objectFit = 'contain';
    
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Combine friends and custom points for globe display
    const allPoints = [
      ...friends.map(friend => ({ ...friend, type: 'friend' as const })),
      ...customPoints.map(point => ({ ...point, type: 'custom' as const }))
    ];

    // Create globe
    const globe = new ThreeGlobe()
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .htmlElementsData(allPoints)
      .htmlElement((d: any) => {
        const point = d;
        const el = document.createElement('div');
        
        if (point.type === 'friend') {
          const friend = point as Friend & { type: 'friend' };
          el.innerHTML = `
            <div class="friend-pin" data-friend-id="${friend.id}" style="
              position: relative;
              cursor: pointer;
              transition: all 0.2s ease;
            ">
              <div style="
                width: 32px;
                height: 32px;
                background: #ff6b6b;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                border: 2px solid white;
              ">
                <img src="${friend.avatar}" alt="${friend.name}" style="
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  transform: rotate(45deg);
                  object-fit: cover;
                "/>
              </div>
              <div class="friend-tooltip" style="
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255,255,255,0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 8px;
                padding: 8px 12px;
                font-size: 12px;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease;
                margin-bottom: 8px;
                z-index: 1000;
              ">
                <div style="font-weight: 600; color: #1a365d;">${friend.name}</div>
                <div style="color: #4a5568; font-size: 10px; margin-top: 2px;">${friend.location.city}, ${friend.location.country}</div>
                <div style="color: #718096; font-size: 10px; margin-top: 2px; font-style: italic;">${friend.status}</div>
              </div>
            </div>
          `;

          // Add event listeners for friends
          const pinElement = el.querySelector('.friend-pin') as HTMLElement;
          const tooltip = el.querySelector('.friend-tooltip') as HTMLElement;

          pinElement.addEventListener('mouseenter', () => {
            setIsHovering(true);
            tooltip.style.opacity = '1';
            pinElement.style.transform = 'scale(1.1)';
          });

          pinElement.addEventListener('mouseleave', () => {
            setIsHovering(false);
            tooltip.style.opacity = '0';
            pinElement.style.transform = 'scale(1)';
          });

          pinElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedFriend(friend);
          });
        } else {
          // Custom point rendering
          const customPoint = point as CustomPoint;
          el.innerHTML = `
            <div class="custom-pin" data-point-id="${customPoint.id}" style="
              position: relative;
              cursor: pointer;
              transition: all 0.2s ease;
            ">
              <div style="
                width: 24px;
                height: 24px;
                background: #10b981;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                border: 2px solid white;
              ">
                ${customPoint.image_url ? `
                  <img src="http://localhost:8000${customPoint.image_url}" alt="${customPoint.name}" style="
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    object-fit: cover;
                  "/>
                ` : `
                  <div style="
                    width: 12px;
                    height: 12px;
                    background: white;
                    border-radius: 50%;
                  "></div>
                `}
              </div>
              <div class="custom-tooltip" style="
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255,255,255,0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 8px;
                padding: 8px 12px;
                font-size: 12px;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease;
                margin-bottom: 8px;
                z-index: 1000;
                max-width: 200px;
                white-space: normal;
              ">
                <div style="font-weight: 600; color: #1a365d;">${customPoint.name}</div>
                ${customPoint.description ? `<div style="color: #4a5568; font-size: 10px; margin-top: 2px;">${customPoint.description}</div>` : ''}
                <div style="color: #718096; font-size: 10px; margin-top: 2px;">${customPoint.lat.toFixed(4)}, ${customPoint.lng.toFixed(4)}</div>
              </div>
            </div>
          `;

          // Add event listeners for custom points
          const pinElement = el.querySelector('.custom-pin') as HTMLElement;
          const tooltip = el.querySelector('.custom-tooltip') as HTMLElement;

          pinElement.addEventListener('mouseenter', () => {
            setIsHovering(true);
            tooltip.style.opacity = '1';
            pinElement.style.transform = 'scale(1.1)';
          });

          pinElement.addEventListener('mouseleave', () => {
            setIsHovering(false);
            tooltip.style.opacity = '0';
            pinElement.style.transform = 'scale(1)';
          });

          pinElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Could add custom point details modal here
          });
        }

        return el;
      })
      .htmlLat((d: any) => d.type === 'friend' ? d.location.lat : d.lat)
      .htmlLng((d: any) => d.type === 'friend' ? d.location.lng : d.lng)
      .htmlAltitude(0.01);

    // Add click handler for globe surface to add points
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleGlobeClick = (event: MouseEvent) => {
      if (isHovering || isDragging) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(globe, true);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        const lat = Math.asin(point.y / 100) * (180 / Math.PI);
        const lng = Math.atan2(point.z, point.x) * (180 / Math.PI);

        setClickCoordinates({ lat, lng });
        setIsCreatePointModalOpen(true);
      }
    };

    renderer.domElement.addEventListener('click', handleGlobeClick);

    scene.add(globe);
    globeRef.current = globe;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Position camera
    camera.position.z = 300;

    // Mouse controls for globe
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseDown = (event: MouseEvent) => {
      if (!isHovering) {
        isMouseDown = true;
        setIsDragging(true);
        mouseX = event.clientX;
        mouseY = event.clientY;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDown && !isHovering) {
        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;
        
        if (globeRef.current) {
          // Access rotation through the Three.js Object3D properties
          (globeRef.current as any).rotation.y += deltaX * 0.005;
          (globeRef.current as any).rotation.x += deltaY * 0.005;
          (globeRef.current as any).rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, (globeRef.current as any).rotation.x));
        }
        
        mouseX = event.clientX;
        mouseY = event.clientY;
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;
      setIsDragging(false);
    };

    // Zoom controls for globe
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY * 0.001;
      camera.position.z = Math.max(150, Math.min(500, camera.position.z + delta * 50));
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('wheel', handleWheel);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('click', handleGlobeClick);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isHovering, viewMode, customPoints, friends]);

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

      {/* View Toggle Controls - Map first, Globe second */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 flex gap-1 sm:gap-2">
        <Button
          variant={viewMode === 'map' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('map')}
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 shadow-lg"
        >
          <Map className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Map</span>
        </Button>
        <Button
          variant={viewMode === 'globe' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('globe')}
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 shadow-lg"
        >
          <GlobeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Globe</span>
        </Button>
      </div>

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
        <div className="hidden sm:block">• {viewMode === 'globe' ? 'Drag to rotate, scroll to zoom' : 'Drag to pan, scroll to zoom'}</div>
        <div className="sm:hidden">• {viewMode === 'globe' ? 'Drag & scroll' : 'Drag & scroll'}</div>
        <div className="hidden sm:block">• Click friend pins to view details</div>
        <div className="sm:hidden">• Click pins for details</div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
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
      )}

      {/* Globe View */}
      {viewMode === 'globe' && (
        <div 
          ref={mountRef} 
          className="absolute inset-0 cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden"
        />
      )}

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
