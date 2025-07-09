import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface CustomPoint {
  id: number;
  name: string;
  description?: string;
  lat: number;
  lng: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Friend {
  id: number;
  name: string;
  status?: string;
  country?: string;
  city?: string;
  lat: number;
  lng: number;
  avatar_url?: string;
  created_at: string;
}

export interface CreateCustomPointData {
  name: string;
  description?: string;
  lat: number;
  lng: number;
  image?: File;
}

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  // Custom Points
  async getCustomPoints(): Promise<CustomPoint[]> {
    const response = await this.api.get('/custom-points');
    return response.data;
  }

  async createCustomPoint(data: CreateCustomPointData): Promise<CustomPoint> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('lat', data.lat.toString());
    formData.append('lng', data.lng.toString());
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await this.api.post('/custom-points', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateCustomPoint(id: number, data: Partial<CreateCustomPointData>): Promise<CustomPoint> {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.lat !== undefined) formData.append('lat', data.lat.toString());
    if (data.lng !== undefined) formData.append('lng', data.lng.toString());
    if (data.image) formData.append('image', data.image);

    const response = await this.api.put(`/custom-points/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteCustomPoint(id: number): Promise<void> {
    await this.api.delete(`/custom-points/${id}`);
  }

  // Friends
  async getFriends(): Promise<Friend[]> {
    const response = await this.api.get('/friends');
    return response.data;
  }

  async createFriend(data: {
    name: string;
    status?: string;
    country?: string;
    city?: string;
    lat: number;
    lng: number;
    avatar?: File;
  }): Promise<Friend> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('lat', data.lat.toString());
    formData.append('lng', data.lng.toString());
    
    if (data.status) formData.append('status', data.status);
    if (data.country) formData.append('country', data.country);
    if (data.city) formData.append('city', data.city);
    if (data.avatar) formData.append('avatar', data.avatar);

    const response = await this.api.post('/friends', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
