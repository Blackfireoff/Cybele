import React, { useState } from 'react';
import { Heart, MessageCircle, MapPin } from 'lucide-react';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  location: string;
  image: string;
  caption: string;
  timestamp: string;
  likes: number;
  comments: number;
}

const mockPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Emma Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3fd?w=150&h=150&fit=crop&crop=face',
    location: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
    caption: 'Sunset from my dorm window in Paris',
    timestamp: '2 hours ago',
    likes: 24,
    comments: 5
  },
  {
    id: '2',
    userId: '2',
    userName: 'Marco Silva',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
    caption: 'Cherry blossoms are incredible here!',
    timestamp: '1 day ago',
    likes: 18,
    comments: 3
  },
  {
    id: '3',
    userId: '3',
    userName: 'Sarah Chen',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    location: 'Rome, Italy',
    image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&h=300&fit=crop',
    caption: 'The Colosseum never gets old',
    timestamp: '3 days ago',
    likes: 32,
    comments: 8
  },
  {
    id: '4',
    userId: '1',
    userName: 'Emma Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3fd?w=150&h=150&fit=crop&crop=face',
    location: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=400&h=300&fit=crop',
    caption: 'Morning coffee and croissants ☕🥐',
    timestamp: '5 days ago',
    likes: 15,
    comments: 2
  },
  {
    id: '5',
    userId: '2',
    userName: 'Marco Silva',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    caption: 'Traditional temple visit',
    timestamp: '1 week ago',
    likes: 27,
    comments: 6
  }
];

const PostCard: React.FC<{ post: Post; rotation: number; position: { left: string; top: string } }> = ({ post, rotation, position }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    setMousePosition({ x: mouseX, y: mouseY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const tiltX = isHovered ? (mousePosition.y / 10) : 0;
  const tiltY = isHovered ? -(mousePosition.x / 10) : 0;
  const translateZ = isHovered ? 20 : 0;

  return (
    <div 
      className="absolute w-48 sm:w-64 md:w-72 cursor-pointer transition-all duration-300 ease-out"
      style={{
        left: position.left,
        top: position.top,
        transform: `
          rotate(${rotation}deg) 
          perspective(1000px) 
          rotateX(${tiltX}deg) 
          rotateY(${tiltY}deg) 
          translateZ(${translateZ}px)
          ${isHovered ? 'scale(1.05)' : 'scale(1)'}
        `,
        transformOrigin: 'center center',
        zIndex: isHovered ? 50 : 10,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div 
        className="relative w-full h-full preserve-3d transition-transform duration-700 ease-in-out bg-white"
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Front Side */}
        <div className="absolute inset-0 p-2 sm:p-3 md:p-4 shadow-2xl border-2 border-white bg-white backdrop-blur-sm backface-hidden rounded-lg">
          {/* Pin */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-sunset-500 rounded-full shadow-lg"></div>
          
          {/* User Info */}
          <div className="flex items-center mb-2 sm:mb-3">
            <img
              src={post.userAvatar}
              alt={post.userName}
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
            <div className="ml-3 flex-1">
              <h3 className="font-semibold text-ocean-900 text-sm">{post.userName}</h3>
              <div className="flex items-center text-xs text-ocean-600">
                <MapPin className="w-3 h-3 mr-1" />
                {post.location}
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="mb-3 rounded-lg overflow-hidden shadow-md">
            <img
              src={post.image}
              alt={post.caption}
              className="w-full h-40 object-cover"
            />
          </div>

          {/* Caption */}
          <p className="text-sm text-ocean-800 mb-3 line-clamp-2">{post.caption}</p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className="flex items-center space-x-1 text-sm transition-colors"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isLiked ? 'fill-sunset-500 text-sunset-500' : 'text-ocean-600'
                  }`}
                />
                <span className="text-ocean-700">{post.likes + (isLiked ? 1 : 0)}</span>
              </button>
              <button className="flex items-center space-x-1 text-sm text-ocean-600">
                <MessageCircle className="w-4 h-4" />
                <span className="text-ocean-700">{post.comments}</span>
              </button>
            </div>
            <span className="text-xs text-ocean-500">{post.timestamp}</span>
          </div>
        </div>

        {/* Back Side */}
        <div 
          className="absolute inset-0 p-4 shadow-2xl border-2 border-white/30 bg-white backdrop-blur-sm backface-hidden rounded-lg"
          style={{ transform: 'rotateY(180deg)' }}
        >
          {/* Pin */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-ocean-500 rounded-full shadow-lg"></div>
          
          <div className="h-full flex flex-col justify-center items-center text-center bg-gradient-to-br from-sunset-100 to-ocean-100 rounded-md p-2">
            <div className="mb-4">
              <img
                src={post.userAvatar}
                alt={post.userName}
                className="w-16 h-16 rounded-full border-3 border-white shadow-lg mx-auto mb-2"
              />
              <h3 className="font-bold text-ocean-900 text-lg">{post.userName}</h3>
              <p className="text-sm text-ocean-600 mb-3">✈️ Exchange Student</p>
            </div>
            
            <div className="space-y-2 text-sm text-ocean-700">
              <p><span className="font-semibold">📍 Currently in:</span> {post.location}</p>
              <p><span className="font-semibold">📅 Posted:</span> {post.timestamp}</p>
              <p><span className="font-semibold">❤️ Total likes:</span> {post.likes + (isLiked ? 1 : 0)}</p>
              <p><span className="font-semibold">💬 Comments:</span> {post.comments}</p>
            </div>
            
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-xs text-ocean-600 italic">
                "Click again to see the front"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CorkBoard = () => {
  // Generate responsive positions for posts
  const getPostStyles = (index: number) => {
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth < 1024;
    
    // Responsive column layout
    const cols = isMobile ? 1 : isTablet ? 2 : 3;
    const col = index % cols;
    
    // Calculate vertical position based on index
    const rowIndex = Math.floor(index / cols);
    const cardHeight = isMobile ? 320 : isTablet ? 360 : 400;
    
    // Add some randomness to positioning but keep it controlled
    const randomX = (Math.random() - 0.5) * (isMobile ? 4 : 8);
    const randomY = (Math.random() - 0.5) * (isMobile ? 10 : 20);
    
    // Responsive positioning
    let leftPosition;
    if (isMobile) {
      leftPosition = '10%'; // Single column, centered
    } else if (isTablet) {
      leftPosition = col === 0 ? '10%' : '55%'; // Two columns
    } else {
      leftPosition = col === 0 ? '5%' : col === 1 ? '37.5%' : '70%'; // Three columns
    }
    
    return {
      position: {
        left: leftPosition,
        top: `${rowIndex * cardHeight + 50 + randomY}px`
      },
      rotation: (Math.random() - 0.5) * (isMobile ? 4 : 8) // Smaller rotation on mobile
    };
  };

  // Calculate total height needed for all posts
  const isMobile = window.innerWidth < 640;
  const isTablet = window.innerWidth < 1024;
  const cols = isMobile ? 1 : isTablet ? 2 : 3;
  const cardHeight = isMobile ? 320 : isTablet ? 360 : 400;
  const totalHeight = Math.ceil(mockPosts.length / cols) * cardHeight + 200;

  return (
    <div className="relative w-full overflow-x-hidden overflow-y-auto">
      {/* Cork Board Background - Responsive */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: `url('/wood-board-background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: isMobile ? 'scroll' : 'fixed', // Fixed attachment causes issues on mobile
          minHeight: `${totalHeight}px`
        }}
      />
      
      {/* Posts Container */}
      <div 
        className="relative p-4 sm:p-6 lg:p-8" 
        style={{ minHeight: `${totalHeight}px` }}
      >
        {mockPosts.map((post, index) => {
          const styles = getPostStyles(index);
          return (
            <PostCard
              key={post.id}
              post={post}
              rotation={styles.rotation}
              position={styles.position}
            />
          );
        })}
      </div>
    </div>
  );
};
