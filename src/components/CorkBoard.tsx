import React, { useState } from 'react';
import { Heart, MessageCircle, MapPin, Mail, Stamp } from 'lucide-react';

// Beautiful PushPin component
const PushPin: React.FC<{ color?: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  color = '#ef4444', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const needleLength = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Pin shadow */}
      <div 
        className={`absolute ${sizeClasses[size]} rounded-full opacity-20`}
        style={{ 
          backgroundColor: color,
          transform: 'translate(2px, 2px)',
          filter: 'blur(2px)'
        }}
      />
      
      {/* Pin head */}
      <div 
        className={`relative ${sizeClasses[size]} rounded-full shadow-lg border-2 border-white z-10`}
        style={{ 
          backgroundColor: color,
          background: `radial-gradient(circle at 30% 30%, ${color}dd, ${color})`
        }}
      >
        {/* Highlight reflection */}
        <div 
          className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-60"
          style={{ transform: 'scale(0.4)' }}
        />
      </div>
      
      {/* Pin needle */}
      <div 
        className="absolute bg-gray-400 opacity-30"
        style={{
          width: '1px',
          height: `${needleLength[size]}px`,
          top: '50%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(to bottom, #9ca3af, #6b7280)'
        }}
      />
    </div>
  );
};

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  location: string;
  country: string;
  image: string;
  caption: string;
  timestamp: string;
  likes: number;
  comments: number;
  dateStamp: string;
  personalMessage: string;
}

const mockPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Emma Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3fd?w=150&h=150&fit=crop&crop=face',
    location: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=600&h=400&fit=crop',
    caption: 'Sunset from my dorm window in Paris',
    personalMessage: 'Hey! You wouldn\'t believe how gorgeous the sunsets are from my dorm room. Every evening feels like a movie scene. Miss you tons! Can\'t wait to show you around when you visit. ❤️',
    timestamp: '2 hours ago',
    dateStamp: 'MAR 15, 2025',
    likes: 24,
    comments: 5
  },
  {
    id: '2',
    userId: '2',
    userName: 'Marco Silva',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop',
    caption: 'Cherry blossoms are incredible here!',
    personalMessage: 'Dude, the cherry blossoms here are absolutely insane! I\'ve been taking photos every day but nothing captures how magical it really is. The whole city turns pink for like 2 weeks. Wish you were here to see this with me!',
    timestamp: '1 day ago',
    dateStamp: 'MAR 12, 2025',
    likes: 18,
    comments: 3
  },
  {
    id: '3',
    userId: '3',
    userName: 'Sarah Chen',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    location: 'Rome',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=600&h=400&fit=crop',
    caption: 'The Colosseum never gets old',
    personalMessage: 'Still can\'t believe I\'m studying next to the ACTUAL Colosseum! Every morning I walk past 2000-year-old ruins on my way to get coffee. Rome is like living in a history book. Also, the pasta here... life-changing! 🍝',
    timestamp: '3 days ago',
    dateStamp: 'MAR 10, 2025',
    likes: 32,
    comments: 8
  },
  {
    id: '4',
    userId: '1',
    userName: 'Emma Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3fd?w=150&h=150&fit=crop&crop=face',
    location: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=600&h=400&fit=crop',
    caption: 'Morning coffee and croissants ☕🥐',
    personalMessage: 'Started my morning routine: fresh croissants from the boulangerie downstairs and coffee that\'s actually decent (finally!). Living like a true Parisienne. The French really know how to do breakfast right.',
    timestamp: '5 days ago',
    dateStamp: 'MAR 08, 2025',
    likes: 15,
    comments: 2
  },
  {
    id: '5',
    userId: '2',
    userName: 'Marco Silva',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop',
    caption: 'Traditional temple visit',
    personalMessage: 'Visited this amazing temple today. The peace and quiet was incredible after the chaos of Tokyo streets. There\'s something really special about these ancient places. Felt like meditation just walking through the gardens.',
    timestamp: '1 week ago',
    dateStamp: 'MAR 05, 2025',
    likes: 27,
    comments: 6
  },
  {
    id: '6',
    userId: '4',
    userName: 'Alex Rivera',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    location: 'Barcelona',
    country: 'Spain',
    image: 'https://images.unsplash.com/photo-1544609472-e5c2e4a7dba1?w=600&h=400&fit=crop',
    caption: 'Sagrada Familia at sunset',
    personalMessage: 'Gaudí was absolutely insane (in the best way possible). This cathedral has been under construction for over 100 years and it\'s still not done! But wow, when the light hits it at sunset... pure magic. Barcelona is treating me well!',
    timestamp: '2 weeks ago',
    dateStamp: 'FEB 28, 2025',
    likes: 41,
    comments: 12
  }
];

// Vintage stamp designs with hex colors
const stamps = [
  { color: 'bg-red-500', hexColor: '#ef4444', pattern: '🗼', country: 'FRANCE' },
  { color: 'bg-pink-500', hexColor: '#ec4899', pattern: '🌸', country: 'JAPAN' },
  { color: 'bg-green-500', hexColor: '#22c55e', pattern: '🏛️', country: 'ITALY' },
  { color: 'bg-yellow-500', hexColor: '#eab308', pattern: '🎨', country: 'SPAIN' },
  { color: 'bg-blue-500', hexColor: '#3b82f6', pattern: '🗽', country: 'USA' },
  { color: 'bg-purple-500', hexColor: '#a855f7', pattern: '🏰', country: 'UK' }
];

const PostCard: React.FC<{ 
  post: Post; 
  rotation: number; 
  position: { left: string; top: string };
  dimensions: { width: number; height: number };
}> = ({ post, rotation, position, dimensions }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Get appropriate stamp for the country
  const stamp = stamps.find(s => s.country === post.country.toUpperCase()) || stamps[0];

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

  const tiltX = isHovered ? (mousePosition.y / 15) : 0;
  const tiltY = isHovered ? -(mousePosition.x / 15) : 0;
  const translateZ = isHovered ? 25 : 0;

  return (
    <div 
      className="absolute cursor-pointer transition-all duration-500 ease-out"
      style={{
        left: position.left,
        top: position.top,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        transform: `
          rotate(${rotation}deg) 
          perspective(1200px) 
          rotateX(${tiltX}deg) 
          rotateY(${tiltY}deg) 
          translateZ(${translateZ}px)
          ${isHovered ? 'scale(1.03)' : 'scale(1)'}
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
        className="relative w-full h-full preserve-3d transition-transform duration-700 ease-in-out"
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Front Side - Photo Side */}
        <div className="absolute inset-0 backface-hidden">
          {/* Beautiful PushPin - centered at top */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
            <PushPin color={stamp.hexColor} size="md" />
          </div>
          
          <div className="w-full h-full bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
            {/* Main Image */}
            <div className="relative h-[70%] w-full">
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover"
              />
              
              {/* Vintage photo border effect */}
              <div className="absolute inset-0 border-4 border-white"></div>
              
              {/* Location tag on photo */}
              <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
                {post.location}, {post.country}
              </div>
            </div>

            {/* Bottom section */}
            <div className="h-[30%] p-2 sm:p-3 md:p-4 bg-gradient-to-br from-orange-50 to-yellow-50 relative">
              {/* Vintage postcard text */}
              <div className="absolute top-1 sm:top-2 left-2 sm:left-4 text-xs text-gray-500 font-mono tracking-wider">
                POSTCARD
              </div>
              
              {/* Caption as handwritten note */}
              <div className="mt-4 sm:mt-6">
                <p className="text-gray-800 text-xs sm:text-sm leading-relaxed line-clamp-2" style={{ fontFamily: 'cursive' }}>
                  {post.caption}
                </p>
                <div className="flex justify-between items-center mt-2 sm:mt-3">
                  <span className="text-xs text-gray-500" style={{ fontFamily: 'cursive' }}>
                    - {post.userName}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {post.dateStamp}
                  </span>
                </div>
              </div>

              {/* Engagement stats */}
              <div className="absolute bottom-1 sm:bottom-2 right-2 sm:right-4 flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                  }}
                  className="flex items-center space-x-1 text-xs transition-colors hover:scale-110"
                >
                  <Heart
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                      isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'
                    }`}
                  />
                  <span className="text-gray-600 text-xs">{post.likes + (isLiked ? 1 : 0)}</span>
                </button>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs">{post.comments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side - Address Side */}
        <div 
          className="absolute inset-0 backface-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          {/* Beautiful PushPin - centered at top */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
            <PushPin color={stamp.hexColor} size="md" />
          </div>
          
          <div className="w-full h-full bg-white rounded-lg shadow-2xl border border-gray-200 p-3 sm:p-4 md:p-6 relative">
            {/* Postcard back header */}
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="text-xs text-gray-500 font-mono tracking-wider">
                POST CARD
              </div>
              
              {/* Vintage stamp */}
              <div className={`w-12 h-8 sm:w-16 sm:h-12 ${stamp.color} text-white flex flex-col items-center justify-center rounded-sm border-2 border-white shadow-md transform rotate-2`}>
                <div className="text-sm sm:text-lg">{stamp.pattern}</div>
                <div className="text-xs font-bold hidden sm:block">{stamp.country}</div>
              </div>
            </div>

            {/* Postmark */}
            <div className="absolute top-6 sm:top-8 right-8 sm:right-12 w-16 h-16 sm:w-20 sm:h-20 border-2 border-gray-400 rounded-full flex items-center justify-center transform -rotate-12 opacity-60">
              <div className="text-center text-xs text-gray-600">
                <div className="font-bold text-xs sm:text-sm">{post.location.toUpperCase()}</div>
                <div className="text-xs">{post.dateStamp}</div>
              </div>
            </div>

            {/* Vertical divider line (classic postcard) */}
            <div className="absolute left-1/2 top-16 sm:top-20 bottom-4 sm:bottom-6 w-px bg-gray-300"></div>

            {/* Left side - Message */}
            <div className="w-[45%] h-full pt-12 sm:pt-16">
              <div className="text-xs text-gray-500 mb-2 sm:mb-3 font-mono">MESSAGE:</div>
              <div 
                className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-6 sm:line-clamp-none"
                style={{ fontFamily: 'cursive' }}
              >
                {post.personalMessage}
              </div>
              
              {/* Signature */}
              <div className="mt-4 sm:mt-6">
                <div className="flex items-center space-x-2">
                  <img
                    src={post.userAvatar}
                    alt={post.userName}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-200"
                  />
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-800" style={{ fontFamily: 'cursive' }}>
                      {post.userName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Exchange Student
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Address */}
            <div className="absolute right-3 sm:right-6 top-16 sm:top-20 w-[45%]">
              <div className="text-xs text-gray-500 mb-2 sm:mb-3 font-mono">TO:</div>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700" style={{ fontFamily: 'cursive' }}>
                <div className="font-semibold">You</div>
                <div>Best Friend</div>
                <div>Hometown University</div>
                <div>Missing You Blvd</div>
                <div>Friendship City</div>
              </div>

              {/* Stats section */}
              <div className="mt-4 sm:mt-8 p-2 sm:p-3 bg-gray-50 rounded border">
                <div className="text-xs text-gray-500 mb-1 sm:mb-2 font-mono">POSTCARD STATS:</div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>❤️ {post.likes + (isLiked ? 1 : 0)} hearts</div>
                  <div>💬 {post.comments} comments</div>
                  <div>📅 Sent {post.timestamp}</div>
                  <div>📍 From {post.location}</div>
                </div>
              </div>
            </div>

            {/* Click instruction */}
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 italic">
              Click to flip back
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CorkBoard = () => {
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  // Update window size on resize
  React.useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate responsive positions for posts
  const getPostStyles = (index: number) => {
    const isMobile = windowSize.width < 640;
    const isTablet = windowSize.width < 1024;
    const isDesktop = windowSize.width >= 1024;
    
    // Responsive dimensions
    const cardWidth = isMobile ? Math.min(280, windowSize.width - 40) : isTablet ? 300 : 320;
    const cardHeight = isMobile ? 420 : isTablet ? 450 : 480;
    
    // Responsive column layout with proper spacing
    const cols = isMobile ? 1 : isTablet ? 2 : 3;
    const col = index % cols;
    const rowIndex = Math.floor(index / cols);
    
    // Calculate spacing between cards
    const horizontalSpacing = isMobile ? 20 : isTablet ? 40 : 60;
    const verticalSpacing = isMobile ? 40 : isTablet ? 60 : 80;
    
    // Controlled randomness for natural look
    const randomX = (Math.random() - 0.5) * (isMobile ? 8 : isTablet ? 12 : 16);
    const randomY = (Math.random() - 0.5) * (isMobile ? 10 : isTablet ? 15 : 20);
    
    // Calculate positions based on screen size
    let leftPosition: string;
    
    if (isMobile) {
      // Single column, centered
      leftPosition = `calc(50% - ${cardWidth / 2}px + ${randomX}px)`;
    } else if (isTablet) {
      // Two columns
      const columnWidth = (windowSize.width - horizontalSpacing * 3) / 2;
      const startX = horizontalSpacing;
      leftPosition = `${startX + (col * (columnWidth + horizontalSpacing)) + randomX}px`;
    } else {
      // Three columns for desktop
      const columnWidth = (windowSize.width - horizontalSpacing * 4) / 3;
      const startX = horizontalSpacing;
      leftPosition = `${startX + (col * (columnWidth + horizontalSpacing)) + randomX}px`;
    }
    
    const topPosition = 20 + (rowIndex * (cardHeight + verticalSpacing)) + randomY; // Start from top with minimal padding
    
    return {
      position: {
        left: leftPosition,
        top: `${topPosition}px`
      },
      rotation: (Math.random() - 0.5) * (isMobile ? 2 : isTablet ? 4 : 6),
      dimensions: {
        width: cardWidth,
        height: cardHeight
      }
    };
  };

  // Calculate total height needed for all posts
  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width < 1024;
  const cols = isMobile ? 1 : isTablet ? 2 : 3;
  const cardHeight = isMobile ? 420 : isTablet ? 450 : 480;
  const verticalSpacing = isMobile ? 40 : isTablet ? 60 : 80;
  const totalRows = Math.ceil(mockPosts.length / cols);
  const totalHeight = 40 + (totalRows * (cardHeight + verticalSpacing)) + 100; // Reduced initial padding since no internal header

  return (
    <div className="relative w-full overflow-hidden" style={{ height: `${totalHeight}px` }}>
      {/* Cork Board Background with vintage feel */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(139, 69, 19, 0.1) 0%, transparent 20%),
            radial-gradient(circle at 80% 60%, rgba(160, 82, 45, 0.1) 0%, transparent 20%),
            radial-gradient(circle at 40% 80%, rgba(139, 69, 19, 0.1) 0%, transparent 20%),
            linear-gradient(135deg, #f4f1eb 0%, #e8dcc0 100%)
          `,
          backgroundSize: '200px 200px, 300px 300px, 250px 250px, 100% 100%',
          minHeight: `${totalHeight}px`
        }}
      />
      
      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c7a882' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          minHeight: `${totalHeight}px`
        }}
      />
      
      {/* Cork board edge shadow */}
      <div className="absolute inset-0 shadow-inner" style={{ 
        boxShadow: 'inset 0 0 100px rgba(139, 69, 19, 0.1)',
        minHeight: `${totalHeight}px`
      }} />
      
      {/* Posts Container - removed duplicate header */}
      <div 
        className="relative p-4 sm:p-6 lg:p-8" 
        style={{ minHeight: `${totalHeight}px` }}
      >
        {/* Postcards */}
        {mockPosts.map((post, index) => {
          const styles = getPostStyles(index);
          return (
            <PostCard
              key={post.id}
              post={post}
              rotation={styles.rotation}
              position={styles.position}
              dimensions={styles.dimensions}
            />
          );
        })}
      </div>
    </div>
  );
};
