
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface FriendRequest {
  id: string;
  name: string;
  avatar: string;
  location: string;
  mutualFriends: number;
}

interface FriendRequestsModalProps {
  onClose: () => void;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const mockRequests: FriendRequest[] = [
  {
    id: '6',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    location: 'London, UK',
    mutualFriends: 2
  },
  {
    id: '7',
    name: 'Maria Garcia',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    location: 'Madrid, Spain',
    mutualFriends: 4
  }
];

export const FriendRequestsModal: React.FC<FriendRequestsModalProps> = ({ 
  onClose, 
  onAccept, 
  onReject 
}) => {
  const [requests, setRequests] = useState(mockRequests);
  const [processedRequests, setProcessedRequests] = useState<string[]>([]);

  const handleAccept = (requestId: string) => {
    setProcessedRequests(prev => [...prev, requestId]);
    onAccept(requestId);
  };

  const handleReject = (requestId: string) => {
    setProcessedRequests(prev => [...prev, requestId]);
    onReject(requestId);
  };

  const pendingRequests = requests.filter(req => !processedRequests.includes(req.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-ocean-900">Friend Requests</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-ocean-600" />
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-4 bg-white/30 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={request.avatar}
                    alt={request.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  />
                  <div>
                    <h3 className="font-medium text-ocean-900">{request.name}</h3>
                    <p className="text-sm text-ocean-600">{request.location}</p>
                    <p className="text-xs text-ocean-500">{request.mutualFriends} mutual friends</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-ocean-500 to-sunset-500 hover:from-ocean-600 hover:to-sunset-600 text-white rounded-lg transition-all text-sm font-medium"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="flex-1 py-2 px-3 bg-white/50 hover:bg-white/70 border border-white/20 rounded-lg transition-colors text-ocean-700 text-sm font-medium"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
            
            {pendingRequests.length === 0 && (
              <div className="text-center py-8 text-ocean-600">
                No pending friend requests
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
