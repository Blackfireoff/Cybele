
import React, { useEffect, useRef, useState } from 'react';
import ThreeGlobe from 'three-globe';
import * as THREE from 'three';
import { FriendModal } from './FriendModal';

interface Friend {
  id: string;
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
  
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(800, 800);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Create globe
    const globe = new ThreeGlobe()
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .htmlElementsData(mockFriends)
      .htmlElement((d: any) => {
        const friend = d as Friend;
        const el = document.createElement('div');
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

        // Add event listeners
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

        return el;
      })
      .htmlLat((d: any) => (d as Friend).location.lat)
      .htmlLng((d: any) => (d as Friend).location.lng)
      .htmlAltitude(0.01);

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

    // Mouse controls
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

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
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
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isHovering]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Three.js Globe Container */}
      <div 
        ref={mountRef} 
        className="relative cursor-grab active:cursor-grabbing"
        style={{ width: '800px', height: '800px' }}
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
