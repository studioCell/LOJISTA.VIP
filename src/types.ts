
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; 
  whatsapp?: string; 
  role: UserRole;
  avatar?: string;
  subscriptionDueDate?: string; 
  allowedSuppliers?: string[]; 
  allowedCourses?: string[]; 
  permissions: {
    suppliers: boolean; 
    courses: boolean;   
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
  supplierId?: string; 
  supplierName: string;
  productName?: string; 
  description: string;
  mediaUrl: string; 
  price?: string;
  likes: number; 
  comments: Comment[];
  whatsapp: string;
  category: string;
  timestamp: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  city?: string; 
  imageUrl: string;
  rating: number;
  isVerified: boolean;
  whatsapp: string;
  bio: string;
  address?: string; 
  mapsUrl?: string; 
  cnpj?: string; 
  images: string[];
}

export interface VipProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  stock: number;
  isLocked: boolean; 
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
  videoUrl: string; 
  content: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  imageUrl?: string;
  channelId: string;
  createdAt: string; // ISO String for sorting
}
