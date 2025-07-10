import React from 'react';

// Vintage stamp designs with hex colors and country-specific patterns
export const stamps = [
  { color: 'bg-red-500', hexColor: '#ef4444', pattern: '🗼', country: 'FRANCE' },
  { color: 'bg-pink-500', hexColor: '#ec4899', pattern: '🌸', country: 'JAPAN' },
  { color: 'bg-green-500', hexColor: '#22c55e', pattern: '🏛️', country: 'ITALY' },
  { color: 'bg-yellow-500', hexColor: '#eab308', pattern: '🎨', country: 'SPAIN' },
  { color: 'bg-blue-500', hexColor: '#3b82f6', pattern: '🗽', country: 'USA' },
  { color: 'bg-purple-500', hexColor: '#a855f7', pattern: '🏰', country: 'UK' },
  { color: 'bg-indigo-500', hexColor: '#6366f1', pattern: '🏔️', country: 'SWITZERLAND' },
  { color: 'bg-cyan-500', hexColor: '#06b6d4', pattern: '🏝️', country: 'GREECE' },
  { color: 'bg-teal-500', hexColor: '#14b8a6', pattern: '🌴', country: 'BRAZIL' },
  { color: 'bg-lime-500', hexColor: '#84cc16', pattern: '🌋', country: 'ICELAND' },
  { color: 'bg-amber-500', hexColor: '#f59e0b', pattern: '🏙️', country: 'CHINA' },
  { color: 'bg-emerald-500', hexColor: '#10b981', pattern: '🦘', country: 'AUSTRALIA' },
  { color: 'bg-rose-500', hexColor: '#f43f5e', pattern: '🍁', country: 'CANADA' },
  { color: 'bg-fuchsia-500', hexColor: '#d946ef', pattern: '🌵', country: 'MEXICO' },
  { color: 'bg-orange-500', hexColor: '#f97316', pattern: '🗺️', country: 'DEFAULT' }
];

// List of valid countries for validation
export const validCountries = stamps.map(stamp => stamp.country);

// Format a date for the postmark
export const formatPostmarkDate = (dateString?: string | object | null): string => {
  // Default to current date if no date string is provided
  if (!dateString) {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      month: 'short',
      day: '2-digit'
    }).toUpperCase();
  }
  
  // If dateString is not a string, return default date
  if (typeof dateString !== 'string') {
    return 'JUL 10';
  }
  
  try {
    // Handle various date formats
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      // If parsing fails, try to extract from formatted string
      const parts = dateString.split(' ');
      if (parts.length >= 2) {
        // Already in desired format
        return `${parts[0]} ${parts[1]}`;
      }
      
      // If we can't parse it in any way, return the original string
      // as long as it's reasonably short
      if (dateString.length <= 8) {
        return dateString.toUpperCase();
      }
      
      // Fall back to default date
      return 'JUL 10';
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: '2-digit'
    }).toUpperCase();
  } catch (error) {
    console.error('Error formatting date for postmark:', error);
    return 'JUL 10';
  }
};

export interface PostcardStampProps {
  country: string;
  date?: string;
  city?: string;
}

const PostcardStamp: React.FC<PostcardStampProps> = ({ 
  country = 'FRANCE', 
  city = 'Paris',
  date = 'JUL 10' 
}) => {
  // Safely handle potentially invalid inputs with default values
  const safeCountryInput = typeof country === 'string' ? country : 'FRANCE';
  const safeCityInput = typeof city === 'string' ? city : 'Paris';
  const safeDateInput = typeof date === 'string' ? date : 'JUL 10';
  
  try {
    // Normalize country name to uppercase for matching
    const normalizedCountry = safeCountryInput.toUpperCase();
    
    // Get colors and patterns based on country
    const stampInfo = stamps.find(s => s.country === normalizedCountry) || stamps[stamps.length - 1];
    const currentYear = new Date().getFullYear();
    
    // Format the date for postmark with proper error handling
    const formattedDate = formatPostmarkDate(safeDateInput);
    
    // Default stamp pattern if not found in country patterns
    const pattern = stampInfo?.pattern || '★';

    return (
      <div className="flex items-start">
        {/* Vintage stamp based on country */}
        <div 
          className="w-12 h-14 sm:w-14 sm:h-16 text-white flex flex-col items-center justify-center stamp-perforations rounded-sm border border-white shadow-md transform rotate-1"
          style={{ backgroundColor: stampInfo?.hexColor || '#f97316' }}
        >
          <div className="text-[10px] sm:text-xs mb-1 font-bold uppercase">{normalizedCountry}</div>
          <div className="text-base sm:text-lg font-bold">{pattern}</div>
        </div>
        
        {/* Postmark circle - overlapping the stamp slightly */}
        <div className="absolute top-0 -right-2 w-20 h-20 sm:w-20 sm:h-20 postmark-circle flex items-center justify-center transform -rotate-6 opacity-80">
          <div className="text-center text-xs text-gray-600 transform rotate-6">
            <div className="font-bold text-[10px] sm:text-xs uppercase tracking-wide">{safeCityInput}</div>
            <div className="font-mono text-[10px] sm:text-xs font-medium">{formattedDate}</div>
            <div className="font-mono text-[10px] sm:text-xs font-medium">{currentYear}</div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering PostcardStamp:', error);
    
    // Fallback rendering in case of any error
    return (
      <div className="flex items-start">
        {/* Fallback stamp */}
        <div 
          className="w-12 h-14 sm:w-14 sm:h-16 text-white flex flex-col items-center justify-center stamp-perforations rounded-sm border border-white shadow-md transform rotate-1"
          style={{ backgroundColor: '#f97316' }}
        >
          <div className="text-[10px] sm:text-xs mb-1 font-bold uppercase">DEFAULT</div>
          <div className="text-base sm:text-lg font-bold">★</div>
        </div>
        
        {/* Fallback postmark */}
        <div className="absolute top-0 -right-2 w-20 h-20 sm:w-20 sm:h-20 postmark-circle flex items-center justify-center transform -rotate-6 opacity-80">
          <div className="text-center text-xs text-gray-600 transform rotate-6">
            <div className="font-bold text-[10px] sm:text-xs uppercase tracking-wide">Paris</div>
            <div className="font-mono text-[10px] sm:text-xs font-medium">JUL 10</div>
            <div className="font-mono text-[10px] sm:text-xs font-medium">{new Date().getFullYear()}</div>
          </div>
        </div>
      </div>
    );
  }
};

export default PostcardStamp;
