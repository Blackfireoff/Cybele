
import React, { useState, useEffect } from 'react';
import { X, Plus, MapPin, Calendar, Check } from 'lucide-react';
import { apiService, CreatePostcardData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { validCountries } from './PostcardStamp';

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
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [countryValid, setCountryValid] = useState<boolean | null>(null);
  const [suggestedCountries, setSuggestedCountries] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Validate country when it changes
  useEffect(() => {
    if (country) {
      validateCountry(country);
    } else {
      setCountryValid(null);
      setSuggestedCountries([]);
    }
  }, [country]);

  // Validate country against our list of supported countries
  const validateCountry = (countryName: string) => {
    const normalizedInput = countryName.trim().toUpperCase();
    
    // Check if country exists in our valid countries list
    const exactMatch = validCountries.find(c => c === normalizedInput);
    if (exactMatch) {
      setCountryValid(true);
      setSuggestedCountries([]);
      return;
    }
    
    // Find close matches for suggestions
    const suggestions = validCountries.filter(c => 
      c.includes(normalizedInput) || 
      normalizedInput.includes(c)
    ).slice(0, 3); // Limit to 3 suggestions
    
    setCountryValid(false);
    setSuggestedCountries(suggestions);
  };

  const handleSuggestionClick = (selectedCountry: string) => {
    setCountry(selectedCountry);
    setCountryValid(true);
    setSuggestedCountries([]);
  };
  
  // Fetch location data from coordinates using OpenStreetMap Nominatim API
  const fetchLocationFromCoordinates = async (lat: number, lng: number) => {
    const GEOCODING_API_URL = 'https://nominatim.openstreetmap.org/reverse';
    
    setIsLoadingLocation(true);
    try {
      const url = `${GEOCODING_API_URL}?lat=${lat}&lon=${lng}&format=json`;
      const response = await fetch(url);
      const data = await response.json();
      
      // Extract location information
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.hamlet || '';
        let country = data.address.country || '';
        
        setLocation(city);
        setCountry(country);
        
        // Validate the retrieved country
        validateCountry(country);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

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

  const getCoordinates = async (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Get location data from coordinates
            await fetchLocationFromCoordinates(lat, lng);
            
            resolve({
              lat,
              lng
            });
          },
          () => {
            // Fallback to Paris coordinates if geolocation fails
            const fallbackLat = 48.8566;
            const fallbackLng = 2.3522;
            
            // Try to get location data even for fallback coordinates
            fetchLocationFromCoordinates(fallbackLat, fallbackLng);
            
            resolve({
              lat: fallbackLat,
              lng: fallbackLng
            });
          }
        );
      } else {
        // Fallback to Paris coordinates if geolocation is not supported
        const fallbackLat = 48.8566;
        const fallbackLng = 2.3522;
        
        // Try to get location data even for fallback coordinates
        fetchLocationFromCoordinates(fallbackLat, fallbackLng);
        
        resolve({
          lat: fallbackLat,
          lng: fallbackLng
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
    
    if (countryValid === false) {
      toast({
        title: "Invalid Country",
        description: "Please select a valid country from the suggestions",
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
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={isLoadingLocation ? "Loading..." : "e.g. Paris, Tokyo"}
                    className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent pr-10"
                    disabled={isLoadingLocation}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => getCoordinates()}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ocean-500 hover:text-ocean-700 transition-colors"
                    title="Get your current location"
                    disabled={isLoadingLocation}
                  >
                    {isLoadingLocation ? (
                      <div className="animate-spin h-4 w-4 border-2 border-ocean-500 border-t-transparent rounded-full"></div>
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ocean-800 mb-2">
                  Country *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={isLoadingLocation ? "Loading..." : "e.g. France, Japan"}
                    className={`w-full px-4 py-3 bg-white/50 border ${
                      countryValid === true ? 'border-green-500' : 
                      countryValid === false ? 'border-red-500' : 'border-white/20'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent`}
                    disabled={isLoadingLocation}
                    required
                  />
                  {isLoadingLocation && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-ocean-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  {countryValid === true && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                
                {/* Country suggestions */}
                {suggestedCountries.length > 0 && (
                  <div className="mt-2 p-2 bg-white/70 shadow-lg rounded-md border border-white/30">
                    <p className="text-xs text-ocean-700 mb-1">Suggestions:</p>
                    <div className="flex flex-wrap gap-1">
                      {suggestedCountries.map((suggestedCountry) => (
                        <button
                          key={suggestedCountry}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestedCountry)}
                          className="px-2 py-1 bg-ocean-50 text-ocean-700 rounded text-xs hover:bg-ocean-100 transition-colors"
                        >
                          {suggestedCountry}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
