
import React, { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar: string;
  location: string;
  mutualFriends: number;
}

interface SearchModalProps {
  onClose: () => void;
  onSendRequest: (userId: string) => void;
}

const mockUsers: User[] = [
  {
    id: '4',
    name: 'Alex Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    location: 'Barcelona, Spain',
    mutualFriends: 3
  },
  {
    id: '5',
    name: 'Lisa Wang',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    location: 'Seoul, South Korea',
    mutualFriends: 1
  }
];

export const SearchModal: React.FC<SearchModalProps> = ({ onClose, onSendRequest }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendRequest = (userId: string) => {
    setSentRequests(prev => [...prev, userId]);
    onSendRequest(userId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-ocean-900">Find Friends</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-ocean-600" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ocean-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
            />
          </div>

          {/* Results */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-white/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  />
                  <div>
                    <h3 className="font-medium text-ocean-900">{user.name}</h3>
                    <p className="text-sm text-ocean-600">{user.location}</p>
                    <p className="text-xs text-ocean-500">{user.mutualFriends} mutual friends</p>
                  </div>
                </div>
                
                {sentRequests.includes(user.id) ? (
                  <span className="text-sm text-ocean-600 font-medium">Request Sent</span>
                ) : (
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    className="p-2 bg-gradient-to-r from-ocean-500 to-sunset-500 hover:from-ocean-600 hover:to-sunset-600 text-white rounded-lg transition-all transform hover:scale-105"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            
            {filteredUsers.length === 0 && searchTerm && (
              <div className="text-center py-8 text-ocean-600">
                No users found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
