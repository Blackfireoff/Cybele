
import React, { useState } from 'react';
import { X, Plus, MapPin, Calendar } from 'lucide-react';
import { apiService, CreatePostcardData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CreatePostModalProps {
  onClose: () => void;
  onPostcardCreated?: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPostcardCreated }) => {
  const [userName, setUserName] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [caption, setCaption] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [dateStamp, setDateStamp] = useState(new Date().toISOString().split('T')[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCoordinates = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => {
            // Fallback to Paris coordinates if geolocation fails
            resolve({
              lat: 48.8566,
              lng: 2.3522
            });
          }
        );
      } else {
        // Fallback to Paris coordinates if geolocation is not supported
        resolve({
          lat: 48.8566,
          lng: 2.3522
        });
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !caption || !location || !country || !userName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const coordinates = await getCoordinates();
      
      const postcardData: CreatePostcardData = {
        user_name: userName,
        location,
        country,
        caption,
        personal_message: personalMessage,
        date_stamp: new Date(dateStamp).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: '2-digit' 
        }).toUpperCase(),
        lat: coordinates.lat,
        lng: coordinates.lng,
        image: imageFile
      };

      await apiService.createPostcard(postcardData);
      
      toast({
        title: "Postcard Created!",
        description: "Your postcard has been shared with friends",
      });
      
      onPostcardCreated?.();
      onClose();
    } catch (error) {
      console.error('Error creating postcard:', error);
      toast({
        title: "Error",
        description: "Failed to create postcard. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-ocean-900">Create a Postcard</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-ocean-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Name */}
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-2">
                Photo *
              </label>
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/30 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <Plus className="w-12 h-12 text-ocean-400 mb-2" />
                  <span className="text-sm text-ocean-600">Click to upload photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ocean-800 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  City/Location *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Paris, Tokyo"
                  className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ocean-800 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. France, Japan"
                  className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={dateStamp}
                onChange={(e) => setDateStamp(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-2">
                Caption *
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Quick description of your photo"
                className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                required
              />
            </div>

            {/* Personal Message */}
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-2">
                Personal Message
              </label>
              <textarea
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                placeholder="Share your experience and thoughts..."
                rows={3}
                className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-white/50 hover:bg-white/70 border border-white/20 rounded-lg transition-colors text-ocean-700"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-gradient-to-r from-ocean-500 to-sunset-500 hover:from-ocean-600 hover:to-sunset-600 text-white rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!imageFile || !caption || !location || !country || !userName || isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Postcard'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
