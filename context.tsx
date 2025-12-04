
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Offer, Supplier, VipProduct, Course, CourseModule, Lesson, ChatMessage, UserRole, Story, Comment } from './types';
import { INITIAL_OFFERS, INITIAL_VIP_PRODUCTS, INITIAL_COURSES, MOCK_ADMIN, MOCK_USERS_LIST } from './mockData';

// Updated Initial Suppliers with Addresses and Cities
const INITIAL_SUPPLIERS_WITH_ADDRESS: Supplier[] = [
  {
    id: 's1',
    name: 'Atacado Moda Sul',
    category: 'Moda',
    city: 'Brás - SP',
    imageUrl: 'https://picsum.photos/200/200?random=3',
    rating: 4.8,
    isVerified: true,
    whatsapp: '5511999999999',
    bio: 'Somos referência em moda feminina no sul do país. Enviamos para todo Brasil.',
    address: 'Rua Miller, 500 - Brás, São Paulo - SP',
    mapsUrl: '',
    cnpj: '12.345.678/0001-90',
    images: ['https://picsum.photos/400/400?random=10', 'https://picsum.photos/400/400?random=11']
  },
  {
    id: 's2',
    name: 'Jeans & Cia',
    category: 'Moda',
    city: 'Goiânia - GO',
    imageUrl: 'https://picsum.photos/200/200?random=4',
    rating: 4.5,
    isVerified: false,
    whatsapp: '5511977777777',
    bio: 'Fábrica de Jeans premium. Atacado mínimo 12 peças.',
    address: 'Galeria 44, Goiânia - GO',
    mapsUrl: '',
    cnpj: '98.765.432/0001-01',
    images: ['https://picsum.photos/400/400?random=12']
  }
];

interface AppContextType {
  user: User | null;
  allUsers: User[];
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, whatsapp: string) => Promise<void>;
  logout: () => void;
  offers: Offer[];
  suppliers: Supplier[];
  vipProducts: VipProduct[];
  courses: Course[];
  stories: Story[];
  communityMessages: ChatMessage[];
  privateMessages: ChatMessage[]; 
  onlineCount: number;
  addOffer: (offer: Offer) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  addProduct: (product: VipProduct) => void;
  addCourse: (course: Course) => void;
  addModule: (courseId: string, title: string) => void;
  addLesson: (courseId: string, moduleId: string, lesson: Lesson) => void;
  updateLesson: (courseId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>) => void;
  addStory: (mediaUrl: string, mediaType: 'image' | 'video') => void;
  deleteOffer: (id: string) => void;
  addHeat: (offerId: string) => void;
  addComment: (offerId: string, text: string) => void;
  sendCommunityMessage: (text: string, imageUrl?: string) => void;
  sendPrivateMessage: (text: string, targetUserId: string, imageUrl?: string) => void;
  toggleUserPermission: (userId: string, permission: 'suppliers' | 'courses') => void;
  updateUserAccess: (userId: string, dueDate: string, supplierIds: string[], courseIds: string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to load from local storage or fallback to initial data
const loadFromStorage = (key: string, fallback: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.warn(`Error loading ${key} from storage, resetting to default.`, error);
    // If corrupted, remove it so it works next time
    try { localStorage.removeItem(key); } catch (e) {}
    return fallback;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage (The "Database")
  const [user, setUser] = useState<User | null>(() => loadFromStorage('lv_session', null));
  const [allUsers, setAllUsers] = useState<User[]>(() => loadFromStorage('lv_users', MOCK_USERS_LIST));
  const [offers, setOffers] = useState<Offer[]>(() => loadFromStorage('lv_offers', INITIAL_OFFERS));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadFromStorage('lv_suppliers', INITIAL_SUPPLIERS_WITH_ADDRESS));
  const [vipProducts, setVipProducts] = useState<VipProduct[]>(() => loadFromStorage('lv_vip_products', INITIAL_VIP_PRODUCTS));
  const [courses, setCourses] = useState<Course[]>(() => loadFromStorage('lv_courses', INITIAL_COURSES));
  const [stories, setStories] = useState<Story[]>(() => loadFromStorage('lv_stories', []));
  const [onlineCount, setOnlineCount] = useState(24);
  
  // Messages
  const [communityMessages, setCommunityMessages] = useState<ChatMessage[]>(() => loadFromStorage('lv_comm_msgs', [
    {
      id: 'm1',
      senderId: 'u2',
      senderName: 'Carla Modas',
      senderAvatar: 'https://picsum.photos/100/100?random=50',
      text: 'Alguém já comprou com o fornecedor do Brás novo?',
      timestamp: '10:30',
      isMine: false,
      channelId: 'community'
    },
    {
      id: 'm2',
      senderId: 'a1',
      senderName: 'Mateus Hugo (Admin)',
      senderAvatar: 'https://picsum.photos/100/100',
      text: 'Pessoal, acabei de postar novidade na aba Fornecedores!',
      timestamp: '10:35',
      isMine: false,
      channelId: 'community'
    }
  ]));

  const [privateMessages, setPrivateMessages] = useState<ChatMessage[]>(() => loadFromStorage('lv_priv_msgs', [
    {
      id: 'pm1',
      senderId: 'u2', 
      senderName: 'Carla Modas',
      senderAvatar: 'https://picsum.photos/100/100?random=50',
      text: 'Olá, gostaria de saber como funciona a área VIP.',
      timestamp: '09:00',
      isMine: false,
      channelId: 'u2' 
    },
    {
      id: 'pm2',
      senderId: 'a1', 
      senderName: 'Mateus Hugo (Admin)',
      senderAvatar: 'https://picsum.photos/100/100',
      text: 'Oi Carla! A área VIP libera produtos exclusivos. Posso te ajudar com o cadastro?',
      timestamp: '09:05',
      isMine: true,
      channelId: 'u2'
    }
  ]));

  // Simulate Online Count Fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
        setOnlineCount(prev => {
            const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
            return Math.max(10, prev + change);
        });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- PERSISTENCE EFFECT ---
  useEffect(() => { localStorage.setItem('lv_users', JSON.stringify(allUsers)); }, [allUsers]);
  useEffect(() => { localStorage.setItem('lv_offers', JSON.stringify(offers)); }, [offers]);
  useEffect(() => { localStorage.setItem('lv_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('lv_vip_products', JSON.stringify(vipProducts)); }, [vipProducts]);
  useEffect(() => { localStorage.setItem('lv_courses', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('lv_stories', JSON.stringify(stories)); }, [stories]);
  useEffect(() => { localStorage.setItem('lv_comm_msgs', JSON.stringify(communityMessages)); }, [communityMessages]);
  useEffect(() => { localStorage.setItem('lv_priv_msgs', JSON.stringify(privateMessages)); }, [privateMessages]);
  useEffect(() => { 
    if (user) localStorage.setItem('lv_session', JSON.stringify(user));
    else localStorage.removeItem('lv_session');
  }, [user]);

  // --- AUTHENTICATION ---

  const login = async (email: string, password?: string): Promise<boolean> => {
    if (email === 'm.mateushugo123@gmail.com' && password === '12345678') {
      const adminUser = allUsers.find(u => u.email === email) || MOCK_ADMIN;
      setUser(adminUser);
      return true;
    }
    const foundUser = allUsers.find(u => u.email === email);
    if (foundUser) {
        if (foundUser.password && foundUser.password !== password) {
            return false;
        }
        setUser(foundUser);
        return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string, whatsapp: string) => {
      if (allUsers.find(u => u.email === email)) {
          throw new Error("Este e-mail já está cadastrado.");
      }
      const newUser: User = {
          id: Date.now().toString(),
          name,
          email,
          password,
          whatsapp,
          role: UserRole.USER,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FACC15&color=000`,
          subscriptionDueDate: '',
          allowedSuppliers: [],
          allowedCourses: [],
          permissions: {
              suppliers: false,
              courses: false
          }
      };
      setAllUsers([...allUsers, newUser]);
      setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  // --- ACTIONS ---

  const toggleUserPermission = (userId: string, permission: 'suppliers' | 'courses') => {
    const updatedUsers = allUsers.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          permissions: {
            ...u.permissions,
            [permission]: !u.permissions[permission]
          }
        };
      }
      return u;
    });
    setAllUsers(updatedUsers);
    if (user && user.id === userId) {
        setUser(updatedUsers.find(u => u.id === userId) || null);
    }
  };

  const updateUserAccess = (userId: string, dueDate: string, supplierIds: string[], courseIds: string[]) => {
      const updatedUsers = allUsers.map(u => {
        if (u.id === userId) {
            return {
                ...u,
                subscriptionDueDate: dueDate,
                allowedSuppliers: supplierIds,
                allowedCourses: courseIds
            };
        }
        return u;
      });
      setAllUsers(updatedUsers);
      if (user && user.id === userId) {
        setUser(updatedUsers.find(u => u.id === userId) || null);
      }
  };

  const addOffer = (offer: Offer) => setOffers([offer, ...offers]);
  const deleteOffer = (id: string) => setOffers(offers.filter(o => o.id !== id));
  
  const addHeat = (offerId: string) => {
    setOffers(offers.map(o => {
      if (o.id === offerId) {
        return { ...o, likes: o.likes + 1 };
      }
      return o;
    }));
  };

  const addComment = (offerId: string, text: string) => {
      if (!user) return;
      setOffers(offers.map(o => {
          if (o.id === offerId) {
              const newComment: Comment = {
                  id: Date.now().toString(),
                  userId: user.id,
                  userName: user.name,
                  userAvatar: user.avatar || '',
                  text,
                  timestamp: 'Agora'
              };
              return { ...o, comments: [...o.comments, newComment] };
          }
          return o;
      }));
  };

  const addSupplier = (supplier: Supplier) => setSuppliers([...suppliers, supplier]);
  
  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
      setSuppliers(suppliers.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addProduct = (product: VipProduct) => setVipProducts([...vipProducts, product]);
  
  const addCourse = (course: Course) => setCourses([...courses, course]);
  
  const addModule = (courseId: string, title: string) => {
    setCourses(courses.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          modules: [...c.modules, { id: Date.now().toString(), title, lessons: [] }]
        };
      }
      return c;
    }));
  };

  const addLesson = (courseId: string, moduleId: string, lesson: Lesson) => {
    setCourses(courses.map(c => {
      if (c.id === courseId) {
        const updatedModules = c.modules.map(m => {
          if (m.id === moduleId) {
            return { ...m, lessons: [...m.lessons, lesson] };
          }
          return m;
        });
        return { ...c, modules: updatedModules, lessonCount: c.lessonCount + 1 };
      }
      return c;
    }));
  };

  const updateLesson = (courseId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourses(courses.map(c => {
      if (c.id === courseId) {
        const updatedModules = c.modules.map(m => {
          if (m.id === moduleId) {
            const updatedLessons = m.lessons.map(l => {
                if (l.id === lessonId) {
                    return { ...l, ...updates };
                }
                return l;
            });
            return { ...m, lessons: updatedLessons };
          }
          return m;
        });
        return { ...c, modules: updatedModules };
      }
      return c;
    }));
  };

  const addStory = (mediaUrl: string, mediaType: 'image' | 'video') => {
    if (!user) return;
    const newStory: Story = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || '',
      mediaUrl,
      mediaType,
      timestamp: 'Agora',
      isViewed: false
    };
    setStories([newStory, ...stories]);
  };

  const sendCommunityMessage = (text: string, imageUrl?: string) => {
    if (!user) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text,
      imageUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      channelId: 'community'
    };
    setCommunityMessages([...communityMessages, newMessage]);
  };

  const sendPrivateMessage = (text: string, targetUserId: string, imageUrl?: string) => {
    if (!user) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text,
      imageUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true, 
      channelId: targetUserId 
    };
    setPrivateMessages([...privateMessages, newMessage]);
  };

  return (
    <AppContext.Provider value={{
      user, allUsers, login, register, logout,
      offers, suppliers, vipProducts, courses, stories, communityMessages, privateMessages, onlineCount,
      addOffer, addSupplier, updateSupplier, addProduct, addCourse, addModule, addLesson, updateLesson, addStory, deleteOffer,
      addHeat, addComment,
      sendCommunityMessage, sendPrivateMessage, toggleUserPermission, updateUserAccess
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
