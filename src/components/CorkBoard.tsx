import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, MapPin, Mail, Stamp } from 'lucide-react';
import { apiService, Postcard } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import PostcardStampComponent, { stamps as stampDesigns } from './PostcardStamp';

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



interface PostCardProps {
  post: Postcard;
  rotation: number;
  position: { left: string; top: string };
  dimensions: { width: number; height: number };
  onLike: (id: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, rotation, position, dimensions, onLike }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Get appropriate stamp for the country
  const stamp = stampDesigns.find(s => s.country === post.country.toUpperCase()) || stampDesigns[stampDesigns.length - 1];

  // Format timestamp to display relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} day${Math.floor(diffInDays) !== 1 ? 's' : ''} ago`;
    } else {
      return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) !== 1 ? 's' : ''} ago`;
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike(post.id);
  };

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
          
          <div className="w-full h-full bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden vintage-border">
            {/* Main Image */}
            <div className="relative h-[70%] w-full postcard-shadow">
              <img
                src={apiService.getCompleteImageUrl(post.image_url)}
                alt={post.caption}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Handle image loading error with fallback
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              
              {/* Vintage photo border effect with slight yellow tint */}
              <div className="absolute inset-0 border-4 border-white/90 bg-gradient-to-br from-transparent to-amber-50/10"></div>
              
              {/* Location tag on photo - more stylish */}
              <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 backdrop-blur-sm">
                <MapPin className="w-3 h-3" />
                <span>{post.location}, {post.country}</span>
              </div>
            </div>

            {/* Bottom section */}
            <div className="h-[30%] p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-yellow-50 relative">
              {/* Vintage postcard text */}
              <div className="absolute top-1.5 sm:top-2 left-3 sm:left-4 text-xs text-gray-500 font-mono tracking-widest uppercase">
                Postcard
              </div>
              
              {/* Caption as handwritten note */}
              <div className="mt-5 sm:mt-6">
                <p className="text-gray-800 text-xs sm:text-sm leading-relaxed line-clamp-2 handwriting-font">
                  {post.caption}
                </p>
                <div className="flex justify-between items-center mt-2 sm:mt-3">
                  <span className="text-xs text-gray-500 handwriting-font">
                    - {post.user_name}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {post.date_stamp}
                  </span>
                </div>
              </div>

              {/* Engagement stats with improved styling */}
              <div className="absolute bottom-2 sm:bottom-3 right-3 sm:right-4 flex items-center space-x-3 sm:space-x-4">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-1.5 text-xs transition-all hover:scale-110"
                  title="Like this postcard"
                >
                  <Heart
                    className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${
                      isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'
                    }`}
                  />
                  <span className={`text-xs ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                    {post.likes + (isLiked ? 1 : 0)}
                  </span>
                </button>
                <div className="flex items-center gap-1.5 text-xs text-gray-500" title="Comments">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
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
          
          <div className="w-full h-full bg-white rounded-lg shadow-2xl border border-gray-200 p-3 sm:p-4 md:p-6 relative vintage-border">
            {/* Postcard back header */}
            <div className="flex justify-between items-start mb-2 sm:mb-3">
              <div className="text-sm text-gray-500 font-mono tracking-wider ml-3 mt-3">
                Message :
              </div>
            </div>

            {/* Enhanced Stamp and Postmark in top right corner */}
            <div className="absolute top-2.5 sm:top-3 right-3 sm:right-4 flex items-start">
              <PostcardStampComponent 
                country={post.country}
                city={post.location}
                date={post.date_stamp ? post.date_stamp.substring(0, 6) : 'JUL 09'}
              />
            </div>

            {/* Message section - now above the horizontal line with improved styling */}
            <div className="absolute left-3 sm:left-6 right-3 sm:right-6 top-12 sm:top-16 w-[80%] sm:w-[75%] z-10">
              <div 
                className="text-xs sm:text-sm text-gray-700 leading-relaxed italic handwriting-font"
              >
                {post.personal_message || 'No message provided'}
              </div>
              
              {/* Signature with improved styling */}
              <div className="mt-4 sm:mt-6 flex items-center gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 overflow-hidden rounded-full border border-gray-200 flex-shrink-0">
                  <img
                    src={post.user_avatar ? apiService.getCompleteImageUrl(post.user_avatar) : 'https://images.unsplash.com/photo-1494790108755-2616b612b3fd?w=150&h=150&fit=crop&crop=face'}
                    alt={post.user_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="text-xs font-medium text-gray-800 handwriting-font">
                    {post.user_name}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Exchange Student
                  </div>
                </div>
              </div>
            </div>
            
            {/* Horizontal divider line - styled to match the image */}
            <div className="absolute left-2 sm:left-4 right-2 sm:right-4 top-[42%] h-[1px] bg-gray-300"></div>

            {/* Stats section - now below the horizontal line with improved responsiveness */}
            <div className="absolute left-3 sm:left-6 right-3 sm:right-6 top-[calc(42%+16px)] sm:top-[calc(42%+20px)]">
              <div className="text-xs text-gray-600 mb-2 font-mono uppercase tracking-wider">Postcard Stats:</div>
              <div className="py-1">
                <div className="flex justify-between text-[11px] sm:text-xs text-gray-600">
                  {/* Left side - hearts and comments */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-red-400 flex-shrink-0" /> 
                      <span>{post.likes + (isLiked ? 1 : 0)} hearts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" /> 
                      <span>{post.comments} comments</span>
                    </div>
                  </div>
                  
                  {/* Right side - date and location */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 flex items-center justify-center text-blue-500 flex-shrink-0">📅</div>
                      <span className="line-clamp-1">Sent {getRelativeTime(post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" /> 
                      <span className="line-clamp-1">From {post.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Click instruction - styled to match the image */}
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-400 italic">
              Click to flip back
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CorkBoard = () => {
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  // Fetch postcards from API
  useEffect(() => {
    const fetchPostcards = async () => {
      try {
        setLoading(true);
        const data = await apiService.getPostcards();
        setPostcards(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching postcards:', err);
        setError('Failed to load postcards');
        setPostcards([]); // Fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    fetchPostcards();
  }, []);

  // Handle like functionality
  const handleLike = async (postcardId: number) => {
    try {
      const response = await apiService.likePostcard(postcardId);
      // Update the local state with new like count
      setPostcards(prev => prev.map(post => 
        post.id === postcardId 
          ? { ...post, likes: response.likes }
          : post
      ));
    } catch (error) {
      console.error('Error liking postcard:', error);
      toast({
        title: "Error",
        description: "Failed to like postcard",
        variant: "destructive"
      });
    }
  };

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
  const totalRows = Math.ceil(postcards.length / cols);
  const totalHeight = postcards.length > 0 
    ? 40 + (totalRows * (cardHeight + verticalSpacing)) + 100 
    : 400; // Minimum height when no postcards

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mx-auto mb-4"></div>
          <p className="text-ocean-700">Loading postcards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
      
      {/* Posts Container */}
      <div 
        className="relative p-4 sm:p-6 lg:p-8" 
        style={{ minHeight: `${totalHeight}px` }}
      >
        {postcards.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-ocean-700 mb-4">No postcards yet!</p>
              <p className="text-sm text-ocean-600">Create your first postcard to get started.</p>
            </div>
          </div>
        ) : (
          // Postcards
          postcards.map((post, index) => {
            const styles = getPostStyles(index);
            return (
              <PostCard
                key={post.id}
                post={post}
                rotation={styles.rotation}
                position={styles.position}
                dimensions={styles.dimensions}
                onLike={handleLike}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
