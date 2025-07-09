import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api';

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

export interface Postcard {
  id: number;
  user_name: string;
  user_avatar?: string;
  location: string;
  country: string;
  image_url: string;
  caption: string;
  personal_message: string;
  date_stamp: string;
  lat: number;
  lng: number;
  likes: number;
  comments: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePostcardData {
  user_name: string;
  location: string;
  country: string;
  caption: string;
  personal_message: string;
  date_stamp: string;
  lat: number;
  lng: number;
  image: File;
  user_avatar?: File;
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

  // Postcards
  async getPostcards(): Promise<Postcard[]> {
    const response = await this.api.get('/postcards');
    return response.data;
  }

  async createPostcard(data: CreatePostcardData): Promise<Postcard> {
    const formData = new FormData();
    formData.append('user_name', data.user_name);
    formData.append('location', data.location);
    formData.append('country', data.country);
    formData.append('caption', data.caption);
    formData.append('personal_message', data.personal_message);
    formData.append('date_stamp', data.date_stamp);
    formData.append('lat', data.lat.toString());
    formData.append('lng', data.lng.toString());
    formData.append('image', data.image);
    
    if (data.user_avatar) {
      formData.append('user_avatar', data.user_avatar);
    }

    const response = await this.api.post('/postcards', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deletePostcard(id: number): Promise<void> {
    await this.api.delete(`/postcards/${id}`);
  }

  async likePostcard(id: number): Promise<{ likes: number }> {
    const response = await this.api.put(`/postcards/${id}/like`);
    return response.data;
  }
}

export const apiService = new ApiService();
