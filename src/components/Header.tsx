
import React from 'react';
import { MapPin, Plus, Users, Search } from 'lucide-react';

interface HeaderProps {
  onUpdateLocation: () => void;
  onCreatePost: () => void;
  onSearchFriends: () => void;
  onFriendRequests: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onUpdateLocation,
  onCreatePost,
  onSearchFriends,
  onFriendRequests
}) => {
  return (
    <header className="glass-card rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-sunset-500 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ocean-900">StudyGlobe</h1>
            <p className="text-xs text-ocean-600">Stay connected worldwide</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onUpdateLocation}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors group"
            title="Update Location"
          >
            <MapPin className="w-5 h-5 text-ocean-600 group-hover:text-ocean-800" />
          </button>
          
          <button
            onClick={onCreatePost}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors group"
            title="Create Post"
          >
            <Plus className="w-5 h-5 text-ocean-600 group-hover:text-ocean-800" />
          </button>
          
          <button
            onClick={onSearchFriends}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors group"
            title="Search Friends"
          >
            <Search className="w-5 h-5 text-ocean-600 group-hover:text-ocean-800" />
          </button>
          
          <button
            onClick={onFriendRequests}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors group relative"
            title="Friend Requests"
          >
            <Users className="w-5 h-5 text-ocean-600 group-hover:text-ocean-800" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-sunset-500 rounded-full"></div>
          </button>
        </div>
      </div>
    </header>
  );
};
