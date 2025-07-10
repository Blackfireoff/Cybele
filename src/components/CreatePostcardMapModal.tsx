import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Upload, X, MapPin, Calendar, Check } from 'lucide-react';
import { apiService, CreatePostcardData } from '../lib/api';
import { validCountries } from './PostcardStamp';

// For reverse geocoding
const GEOCODING_API_URL = 'https://nominatim.openstreetmap.org/reverse';

interface CreatePostcardMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostcardCreated: () => void;
  initialLat?: number;
  initialLng?: number;
}

export const CreatePostcardMapModal: React.FC<CreatePostcardMapModalProps> = ({
  isOpen,
  onClose,
  onPostcardCreated,
  initialLat = 0,
  initialLng = 0,
}) => {
  const [formData, setFormData] = useState({
    userName: '',
    location: '',
    country: '',
    caption: '',
    personalMessage: '',
    lat: initialLat,
    lng: initialLng,
    dateStamp: new Date().toISOString().split('T')[0]
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [countryValid, setCountryValid] = useState<boolean | null>(null);
  const [suggestedCountries, setSuggestedCountries] = useState<string[]>([]);

  // When modal opens or coordinates change, fetch location data
  useEffect(() => {
    if (isOpen && initialLat && initialLng) {
      fetchLocationFromCoordinates(initialLat, initialLng);
      setFormData(prev => ({
        ...prev,
        lat: initialLat,
        lng: initialLng,
        dateStamp: new Date().toISOString().split('T')[0]
      }));
    }
    // Reset form state when modal opens
    if (isOpen) {
      setSelectedImage(null);
      setImagePreview(null);
      setError(null);
      setCountryValid(null);
      setSuggestedCountries([]);
    }
  }, [isOpen, initialLat, initialLng]);

  // Validate country when it changes
  useEffect(() => {
    if (formData.country) {
      validateCountry(formData.country);
    } else {
      setCountryValid(null);
      setSuggestedCountries([]);
    }
  }, [formData.country]);

  // Fetch location data from coordinates using OpenStreetMap Nominatim API
  const fetchLocationFromCoordinates = async (lat: number, lng: number) => {
    if (!lat || !lng) return;
    
    setIsLoadingLocation(true);
    try {
      const url = `${GEOCODING_API_URL}?lat=${lat}&lon=${lng}&format=json`;
      const response = await fetch(url);
      const data = await response.json();
      
      // Extract location information
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.hamlet || '';
        let country = data.address.country || '';
        
        setFormData(prev => ({
          ...prev,
          location: city,
          country: country
        }));
        
        // Validate the retrieved country
        validateCountry(country);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

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

  const handleSuggestionClick = (country: string) => {
    setFormData(prev => ({ ...prev, country }));
    setCountryValid(true);
    setSuggestedCountries([]);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userName.trim() || !formData.location.trim() || !formData.country.trim() || !formData.caption.trim() || !selectedImage) {
      setError('Please fill all required fields and upload an image');
      return;
    }

    if (countryValid === false) {
      setError('Please select a valid country from the suggestions');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const postcardData: CreatePostcardData = {
        user_name: formData.userName.trim(),
        location: formData.location.trim(),
        country: formData.country.trim(),
        caption: formData.caption.trim(),
        personal_message: formData.personalMessage.trim(),
        date_stamp: new Date(formData.dateStamp).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: '2-digit' 
        }).toUpperCase(),
        lat: formData.lat,
        lng: formData.lng,
        image: selectedImage
      };

      await apiService.createPostcard(postcardData);
      onPostcardCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create postcard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Create Postcard</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="userName" className="text-sm sm:text-base">Your Name *</Label>
            <Input
              id="userName"
              value={formData.userName}
              onChange={(e) => handleInputChange('userName', e.target.value)}
              placeholder="Enter your name"
              required
              className="text-sm sm:text-base"
            />
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm sm:text-base flex items-center gap-1">
                <MapPin className="h-4 w-4" /> City/Location *
              </Label>
              <div className="relative">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={isLoadingLocation ? "Loading..." : "e.g. Paris, Tokyo"}
                  required
                  className="text-sm sm:text-base"
                  disabled={isLoadingLocation}
                />
                {isLoadingLocation && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm sm:text-base">Country *</Label>
              <div className="relative">
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder={isLoadingLocation ? "Loading..." : "e.g. France, Japan"}
                  required
                  className={`text-sm sm:text-base ${
                    countryValid === true ? 'border-green-500' : 
                    countryValid === false ? 'border-red-500' : ''
                  }`}
                  disabled={isLoadingLocation}
                />
                {countryValid === true && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              {/* Country suggestions */}
              {suggestedCountries.length > 0 && (
                <div className="mt-1 p-2 bg-white shadow-lg rounded-md border">
                  <p className="text-xs text-gray-500 mb-1">Suggestions:</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestedCountries.map((country) => (
                      <button
                        key={country}
                        type="button"
                        onClick={() => handleSuggestionClick(country)}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100"
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coordinates (hidden but editable for advanced users) */}
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground transition-colors">Map Coordinates (Advanced)</summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="lat" className="text-sm">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={(e) => handleInputChange('lat', parseFloat(e.target.value))}
                  required
                  className="text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng" className="text-sm">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={(e) => handleInputChange('lng', parseFloat(e.target.value))}
                  required
                  className="text-xs"
                />
              </div>
            </div>
          </details>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="dateStamp" className="text-sm sm:text-base flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Date
            </Label>
            <Input
              id="dateStamp"
              type="date"
              value={formData.dateStamp}
              onChange={(e) => handleInputChange('dateStamp', e.target.value)}
              className="text-sm sm:text-base"
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption" className="text-sm sm:text-base">Caption *</Label>
            <Input
              id="caption"
              value={formData.caption}
              onChange={(e) => handleInputChange('caption', e.target.value)}
              placeholder="Quick description of your photo"
              required
              className="text-sm sm:text-base"
            />
          </div>

          {/* Personal Message */}
          <div className="space-y-2">
            <Label htmlFor="personalMessage" className="text-sm sm:text-base">Personal Message</Label>
            <Textarea
              id="personalMessage"
              value={formData.personalMessage}
              onChange={(e) => handleInputChange('personalMessage', e.target.value)}
              placeholder="Share your experience and thoughts..."
              rows={3}
              className="text-sm sm:text-base resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Photo *</Label>
            
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-xs sm:text-sm text-gray-600">Click to upload a photo</span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-xs sm:text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto text-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto text-sm">
              {isSubmitting ? 'Creating...' : 'Create Postcard'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
