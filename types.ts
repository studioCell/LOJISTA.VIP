
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for persistence/login check
  whatsapp?: string; // Added for registration
  role: UserRole;
  avatar?: string;
  subscriptionDueDate?: string; // ISO Date string YYYY-MM-DD
  allowedSuppliers?: string[]; // List of Supplier IDs this user can see
  allowedCourses?: string[]; // List of Course IDs this user can see
  permissions: {
    suppliers: boolean; // Legacy/Global toggle (can be used as master switch)
    courses: boolean;   // Legacy/Global toggle
  };
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  timestamp: string;
  isViewed: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface Offer {
  id: string;
  supplierId?: string; // Link to registered supplier
  supplierName: string;
  productName?: string; // New field for highlighted product name
  description: string;
  mediaUrl: string; // Image or Video placeholder
  price?: string;
  likes: number; // Represents Heat now
  comments: Comment[];
  whatsapp: string;
  category: string;
  timestamp: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  city?: string; // New field for location filtering
  imageUrl: string;
  rating: number;
  isVerified: boolean;
  whatsapp: string;
  bio: string;
  address?: string; 
  mapsUrl?: string; // Specific Google Maps Link
  cnpj?: string; // Optional CNPJ
  images: string[];
}

export interface VipProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  stock: number;
  isLocked: boolean; // Requires VIP subscription
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  lessonCount: number;
  modules: CourseModule[];
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  videoUrl: string; // Placeholder
  content: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string; // Added for community chat
  senderAvatar?: string; // Added for community chat
  text: string;
  imageUrl?: string; // Added for image support
  timestamp: string;
  isMine: boolean;
  channelId?: string; // 'support' or 'community'
}
