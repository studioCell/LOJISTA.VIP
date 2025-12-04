
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Offer, Supplier, VipProduct, Course, CourseModule, Lesson, ChatMessage, UserRole, Story, Comment } from './types';
import { INITIAL_OFFERS, INITIAL_VIP_PRODUCTS, INITIAL_COURSES, INITIAL_SUPPLIERS, MOCK_USERS_LIST, MOCK_ADMIN } from './mockData';
import { auth, db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot
} from 'firebase/firestore';

interface AppContextType {
  user: User | null;
  allUsers: User[];
  isLoading: boolean;
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

const loadFromStorage = (key: string, fallback: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    return fallback;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => loadFromStorage('lv_session', null));
  const [allUsers, setAllUsers] = useState<User[]>(() => loadFromStorage('lv_users', MOCK_USERS_LIST));
  const [isLoading, setIsLoading] = useState(false); // Can be used for Auth loading later

  // Data States
  const [offers, setOffers] = useState<Offer[]>(() => loadFromStorage('lv_offers', INITIAL_OFFERS));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadFromStorage('lv_suppliers', INITIAL_SUPPLIERS));
  const [vipProducts, setVipProducts] = useState<VipProduct[]>(() => loadFromStorage('lv_vip_products', INITIAL_VIP_PRODUCTS));
  const [courses, setCourses] = useState<Course[]>(() => loadFromStorage('lv_courses', INITIAL_COURSES));
  const [stories, setStories] = useState<Story[]>(() => loadFromStorage('lv_stories', []));
  
  // Real-time Chat States
  const [communityMessages, setCommunityMessages] = useState<ChatMessage[]>([]);
  const [privateMessages, setPrivateMessages] = useState<ChatMessage[]>([]);
  
  const [onlineCount, setOnlineCount] = useState(24);

  // --- FIRESTORE CHAT SYNC ---
  useEffect(() => {
    // Listen for ALL messages
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      
      setCommunityMessages(msgs.filter(m => m.channelId === 'community'));
      setPrivateMessages(msgs.filter(m => m.channelId !== 'community'));
    }, (error) => {
      console.error("Chat sync error:", error);
    });

    return () => unsubscribe();
  }, []);

  // --- PERSISTENCE ---
  useEffect(() => { localStorage.setItem('lv_users', JSON.stringify(allUsers)); }, [allUsers]);
  useEffect(() => { localStorage.setItem('lv_offers', JSON.stringify(offers)); }, [offers]);
  useEffect(() => { localStorage.setItem('lv_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('lv_vip_products', JSON.stringify(vipProducts)); }, [vipProducts]);
  useEffect(() => { localStorage.setItem('lv_courses', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('lv_stories', JSON.stringify(stories)); }, [stories]);
  useEffect(() => { 
    if (user) localStorage.setItem('lv_session', JSON.stringify(user));
    else localStorage.removeItem('lv_session');
  }, [user]);

  // --- AUTH ---
  const login = async (email: string, password?: string): Promise<boolean> => {
    // Admin Backdoor
    if (email === 'm.mateushugo123@gmail.com' && password === '12345678') {
      const adminUser = allUsers.find(u => u.email === email) || MOCK_ADMIN;
      setUser(adminUser);
      return true;
    }
    const foundUser = allUsers.find(u => u.email === email);
    if (foundUser) {
        if (foundUser.password && foundUser.password !== password) return false;
        setUser(foundUser);
        return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string, whatsapp: string) => {
      if (allUsers.find(u => u.email === email)) throw new Error("E-mail já cadastrado.");
      const newUser: User = {
          id: Date.now().toString(),
          name,
          email,
          password,
          whatsapp,
          role: UserRole.USER,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FACC15&color=000`,
          permissions: { suppliers: false, courses: false }
      };
      setAllUsers([...allUsers, newUser]);
      setUser(newUser);
  };

  const logout = () => setUser(null);

  // --- CHAT ACTIONS (FIRESTORE) ---
  const sendCommunityMessage = async (text: string, imageUrl?: string) => {
    if (!user) return;
    try {
        await addDoc(collection(db, 'messages'), {
            senderId: user.id,
            senderName: user.name,
            senderAvatar: user.avatar || '',
            text,
            imageUrl: imageUrl || null,
            channelId: 'community',
            createdAt: new Date().toISOString()
        });
    } catch (e) {
        console.error("Error sending message:", e);
        alert("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  const sendPrivateMessage = async (text: string, targetUserId: string, imageUrl?: string) => {
    if (!user) return;
    try {
        await addDoc(collection(db, 'messages'), {
            senderId: user.id,
            senderName: user.name,
            senderAvatar: user.avatar || '',
            text,
            imageUrl: imageUrl || null,
            channelId: targetUserId,
            createdAt: new Date().toISOString()
        });
    } catch (e) {
        console.error("Error sending private message:", e);
    }
  };

  // --- OTHER ACTIONS ---
  const addOffer = (offer: Offer) => setOffers([offer, ...offers]);
  const deleteOffer = (id: string) => setOffers(offers.filter(o => o.id !== id));
  const addHeat = (offerId: string) => setOffers(offers.map(o => o.id === offerId ? { ...o, likes: o.likes + 1 } : o));
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
  const updateSupplier = (id: string, updates: Partial<Supplier>) => setSuppliers(suppliers.map(s => s.id === id ? { ...s, ...updates } : s));
  const addProduct = (product: VipProduct) => setVipProducts([...vipProducts, product]);
  const addCourse = (course: Course) => setCourses([...courses, course]);
  const addModule = (courseId: string, title: string) => setCourses(courses.map(c => c.id === courseId ? { ...c, modules: [...c.modules, { id: Date.now().toString(), title, lessons: [] }] } : c));
  const addLesson = (courseId: string, moduleId: string, lesson: Lesson) => setCourses(courses.map(c => c.id === courseId ? { ...c, modules: c.modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m), lessonCount: c.lessonCount + 1 } : c));
  const updateLesson = (courseId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>) => setCourses(courses.map(c => c.id === courseId ? { ...c, modules: c.modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l) } : m) } : c));
  const addStory = (mediaUrl: string, mediaType: 'image' | 'video') => {
    if (!user) return;
    setStories([{ id: Date.now().toString(), userId: user.id, userName: user.name, userAvatar: user.avatar || '', mediaUrl, mediaType, timestamp: 'Agora', isViewed: false }, ...stories]);
  };
  const toggleUserPermission = (userId: string, permission: 'suppliers' | 'courses') => {
    const updatedUsers = allUsers.map(u => u.id === userId ? { ...u, permissions: { ...u.permissions, [permission]: !u.permissions[permission] } } : u);
    setAllUsers(updatedUsers);
  };
  const updateUserAccess = (userId: string, dueDate: string, supplierIds: string[], courseIds: string[]) => {
      const updatedUsers = allUsers.map(u => u.id === userId ? { ...u, subscriptionDueDate: dueDate, allowedSuppliers: supplierIds, allowedCourses: courseIds } : u);
      setAllUsers(updatedUsers);
  };

  return (
    <AppContext.Provider value={{
      user, allUsers, isLoading, login, register, logout,
      offers, suppliers, vipProducts, courses, stories, communityMessages, privateMessages, onlineCount,
      addOffer, addSupplier, updateSupplier, addProduct, addCourse, addModule, addLesson, updateLesson, addStory, deleteOffer,
      addHeat, addComment, sendCommunityMessage, sendPrivateMessage, toggleUserPermission, updateUserAccess
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
