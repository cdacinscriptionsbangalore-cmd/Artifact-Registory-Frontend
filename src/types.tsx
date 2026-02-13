declare global {
  interface Window {
    _env_?: {
      VITE_BACKEND_AI_URL?: string;
      [key: string]: string | undefined;
    };
  }
}

export interface GeoInfo {
  hasGPS: boolean;
  latitude?: string;
  longitude?: string;
  accuracy?: number;
  latRef?: string;
  lonRef?: string;
}

export interface UploadedImageData {
  photo: string;
  geoInfo: GeoInfo | null;
  timestamp: string;
}

export interface User {
  _id: string;
  name: string;
  profileImage: string;
  imagesUploaded: number;
  upvotesReceived: number;
  followers: number;
  points: number;
};

export interface PostDescription {
  title: string;
  subject: string;
  description: string;
  scriptLanguage: string[];
  language: string[];
  upvote: number;
  geolocation: {
    city: string;
    region: string;
    state?: string;
  };
}

export interface Post {
  _id: string;
  user_id: string;
  createdAt: Date;
  images: {
    thumbnailImage: string;
    image: string[];
  };
  description: PostDescription;
  topic: string;
  script: string[];
  type: string;
  distance?: number;
  rating?: number;
}