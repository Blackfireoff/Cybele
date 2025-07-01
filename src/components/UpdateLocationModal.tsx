
import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';

interface UpdateLocationModalProps {
  onClose: () => void;
  onUpdate: (location: string, status: string) => void;
}

export const UpdateLocationModal: React.FC<UpdateLocationModalProps> = ({ onClose, onUpdate }) => {
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(location, status);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-md animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-ocean-900">Update Location & Status</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-ocean-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-2">
                Current Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ocean-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Paris, France"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-2">
                Status
              </label>
              <textarea
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="Share what you're up to..."
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
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
