
import React from 'react';
import { X, MapPin } from 'lucide-react';

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

interface FriendModalProps {
  friend: Friend;
  onClose: () => void;
}

export const FriendModal: React.FC<FriendModalProps> = ({ friend, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
              />
              <div>
                <h3 className="font-semibold text-ocean-900">{friend.name}</h3>
                <div className="flex items-center text-sm text-ocean-600">
                  <MapPin className="w-3 h-3 mr-1" />
                  {friend.location.city}, {friend.location.country}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-ocean-600" />
            </button>
          </div>
          <div className="mt-3 text-sm text-ocean-700 italic">
            {friend.status}
          </div>
        </div>

        {/* Posts */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <h4 className="font-medium text-ocean-900 mb-4">Recent Posts</h4>
          <div className="space-y-4">
            {friend.posts.map((post) => (
              <div key={post.id} className="border border-white/20 rounded-lg overflow-hidden">
                <img
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  <p className="text-sm text-ocean-800">{post.caption}</p>
                  <p className="text-xs text-ocean-500 mt-2">{post.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
