
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface CreatePostModalProps {
  onClose: () => void;
  onPost: (image: string, caption: string) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPost }) => {
  const [caption, setCaption] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imagePreview && caption) {
      onPost(imagePreview, caption);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-ocean-900">Share a Moment</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-ocean-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-2">
                Photo
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
                    onClick={() => setImagePreview('')}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-2">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
                className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-white/50 hover:bg-white/70 border border-white/20 rounded-lg transition-colors text-ocean-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-gradient-to-r from-ocean-500 to-sunset-500 hover:from-ocean-600 hover:to-sunset-600 text-white rounded-lg transition-all transform hover:scale-105"
                disabled={!imagePreview || !caption}
              >
                Share
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
