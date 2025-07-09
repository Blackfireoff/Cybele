
import React, { useState } from 'react';
import { Globe } from '@/components/Globe';
import { CorkBoard } from '@/components/CorkBoard';
import { Header } from '@/components/Header';
import { UpdateLocationModal } from '@/components/UpdateLocationModal';
import { CreatePostModal } from '@/components/CreatePostModal';
import { SearchModal } from '@/components/SearchModal';
import { FriendRequestsModal } from '@/components/FriendRequestsModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [showUpdateLocation, setShowUpdateLocation] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showSearchFriends, setShowSearchFriends] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const { toast } = useToast();

  const handleUpdateLocation = (location: string, status: string) => {
    console.log('Updating location:', location, 'Status:', status);
    toast({
      title: "Location Updated",
      description: `Your location has been set to ${location}`,
    });
  };

  const handleCreatePost = (image: string, caption: string) => {
    console.log('Creating post:', caption);
    toast({
      title: "Post Shared",
      description: "Your moment has been shared with friends",
    });
  };

  const handleSendFriendRequest = (userId: string) => {
    console.log('Sending friend request to:', userId);
    toast({
      title: "Friend Request Sent",
      description: "Your friend request has been sent",
    });
  };

  const handleAcceptFriendRequest = (requestId: string) => {
    console.log('Accepting friend request:', requestId);
    toast({
      title: "Friend Request Accepted",
      description: "You're now connected!",
    });
  };

  const handleRejectFriendRequest = (requestId: string) => {
    console.log('Rejecting friend request:', requestId);
    toast({
      title: "Friend Request Declined",
      description: "Request has been declined",
    });
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header
          onUpdateLocation={() => setShowUpdateLocation(true)}
          onCreatePost={() => setShowCreatePost(true)}
          onSearchFriends={() => setShowSearchFriends(true)}
          onFriendRequests={() => setShowFriendRequests(true)}
        />

        {/* Main Content with Tabs */}
        <Tabs defaultValue="globe" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-card mb-4 sm:mb-6">
            <TabsTrigger value="globe" className="data-[state=active]:bg-white/20 text-xs sm:text-sm">
              🌍 <span className="hidden sm:inline">Globe View</span><span className="sm:hidden">Globe</span>
            </TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-white/20 text-xs sm:text-sm">
              📌 <span className="hidden sm:inline">Posts Board</span><span className="sm:hidden">Posts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="globe" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
              {/* Globe Section */}
              <div className="flex-1">
                <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px]">
                  <div className="text-center mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-ocean-900 mb-1 sm:mb-2">
                      Your Global Network
                    </h2>
                    <p className="text-xs sm:text-sm lg:text-base text-ocean-600">
                      Discover where your friends are studying around the world
                    </p>
                  </div>
                  <div className="h-full">
                    <Globe />
                  </div>
                </div>
              </div>

              {/* Info Panel */}
              <div className="xl:w-80 lg:w-72">
                <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-ocean-900 mb-3 sm:mb-4">
                    Quick Stats
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-ocean-700">Connected Friends</span>
                      <span className="font-semibold text-ocean-900">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-ocean-700">Countries</span>
                      <span className="font-semibold text-ocean-900">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-ocean-700">Recent Posts</span>
                      <span className="font-semibold text-ocean-900">24</span>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
                    <h4 className="text-sm sm:text-base font-medium text-ocean-900 mb-2 sm:mb-3">
                      Recent Activity
                    </h4>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className="text-ocean-700">
                        <span className="font-medium">Emma</span> shared a photo from Paris
                      </div>
                      <div className="text-ocean-700">
                        <span className="font-medium">Marco</span> updated location to Tokyo
                      </div>
                      <div className="text-ocean-700">
                        <span className="font-medium">Sarah</span> posted from Rome
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="posts">
            <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 min-h-[400px] sm:min-h-[600px] lg:min-h-[800px]">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-ocean-900 mb-1 sm:mb-2">
                  Friends' Memories
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-ocean-600">
                  Explore your friends' adventures pinned on the cork board
                </p>
              </div>
              <CorkBoard />
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-ocean-500">
          Stay connected with friends during your exchange semester
        </div>
      </div>

      {/* Modals */}
      {showUpdateLocation && (
        <UpdateLocationModal
          onClose={() => setShowUpdateLocation(false)}
          onUpdate={handleUpdateLocation}
        />
      )}

      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onPost={handleCreatePost}
        />
      )}

      {showSearchFriends && (
        <SearchModal
          onClose={() => setShowSearchFriends(false)}
          onSendRequest={handleSendFriendRequest}
        />
      )}

      {showFriendRequests && (
        <FriendRequestsModal
          onClose={() => setShowFriendRequests(false)}
          onAccept={handleAcceptFriendRequest}
          onReject={handleRejectFriendRequest}
        />
      )}
    </div>
  );
};

export default Index;
