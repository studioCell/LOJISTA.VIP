
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Offer, Supplier, VipProduct, Course, CourseModule, Lesson, ChatMessage, UserRole, Story, Comment } from './types';
import { INITIAL_OFFERS, INITIAL_VIP_PRODUCTS, INITIAL_COURSES, INITIAL_SUPPLIERS, MOCK_ADMIN } from './mockData';
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

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
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Local Data States (Still local for now, except Chat/Users)
  const [offers, setOffers] = useState<Offer[]>(() => loadFromStorage('lv_offers', INITIAL_OFFERS));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadFromStorage('lv_suppliers', INITIAL_SUPPLIERS_WITH_ADDRESS));
  const [vipProducts, setVipProducts] = useState<VipProduct[]>(() => loadFromStorage('lv_vip_products', INITIAL_VIP_PRODUCTS));
  const [courses, setCourses] = useState<Course[]>(() => loadFromStorage('lv_courses', INITIAL_COURSES));
  const [stories, setStories] = useState<Story[]>(() => loadFromStorage('lv_stories', []));
  
  // Real-time Chat States
  const [communityMessages, setCommunityMessages] = useState<ChatMessage[]>([]);
  const [privateMessages, setPrivateMessages] = useState<ChatMessage[]>([]);
  
  const [onlineCount, setOnlineCount] = useState(24);

  // --- 1. AUTHENTICATION & USER SYNC ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch extended user data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          // Force Admin for specific email if needed
          if (firebaseUser.email === 'm.mateushugo123@gmail.com' && userData.role !== UserRole.ADMIN) {
             const adminUpdate = { ...userData, role: UserRole.ADMIN, permissions: { suppliers: true, courses: true } };
             await setDoc(userDocRef, adminUpdate);
             setUser(adminUpdate);
          } else {
             setUser({ ...userData, id: firebaseUser.uid });
          }
        } else {
          // Sync missing user to Firestore (e.g. Google Login first time)
          const isAdmin = firebaseUser.email === 'm.mateushugo123@gmail.com';
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Lojista',
            email: firebaseUser.email || '',
            role: isAdmin ? UserRole.ADMIN : UserRole.USER,
            avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'U')}&background=FACC15&color=000`,
            subscriptionDueDate: '',
            allowedSuppliers: [],
            allowedCourses: [],
            permissions: { suppliers: isAdmin, courses: isAdmin }
          };
          await setDoc(userDocRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // --- 2. FIRESTORE SYNC (Users & Messages) ---
  useEffect(() => {
    // Sync All Users (for Admin list)
    const qUsers = query(collection(db, 'users'));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      const usersList = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
      setAllUsers(usersList);
    });

    // Sync All Messages
    const qMessages = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubMessages = onSnapshot(qMessages, (snap) => {
      const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setCommunityMessages(msgs.filter(m => m.channelId === 'community'));
      setPrivateMessages(msgs.filter(m => m.channelId !== 'community'));
    }, (err) => console.error("Chat sync error", err));

    return () => {
      unsubUsers();
      unsubMessages();
    };
  }, []);

  // --- PERSISTENCE FOR LOCAL DATA ---
  useEffect(() => { localStorage.setItem('lv_offers', JSON.stringify(offers)); }, [offers]);
  useEffect(() => { localStorage.setItem('lv_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('lv_vip_products', JSON.stringify(vipProducts)); }, [vipProducts]);
  useEffect(() => { localStorage.setItem('lv_courses', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('lv_stories', JSON.stringify(stories)); }, [stories]);

  // --- ACTIONS ---

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password || '');
      return true;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const register = async (name: string, email: string, password: string, whatsapp: string) => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCred.user, { displayName: name });
    
    const newUser: User = {
        id: userCred.user.uid,
        name,
        email,
        whatsapp,
        role: UserRole.USER,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FACC15&color=000`,
        subscriptionDueDate: '',
        allowedSuppliers: [],
        allowedCourses: [],
        permissions: { suppliers: false, courses: false }
    };
    
    // Create User Doc in Firestore
    await setDoc(doc(db, 'users', userCred.user.uid), newUser);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const sendCommunityMessage = async (text: string, imageUrl?: string) => {
    if (!user) return;
    await addDoc(collection(db, 'messages'), {
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar || '',
        text,
        imageUrl: imageUrl || null,
        channelId: 'community',
        createdAt: new Date().toISOString()
    });
  };

  const sendPrivateMessage = async (text: string, targetUserId: string, imageUrl?: string) => {
    if (!user) return;
    await addDoc(collection(db, 'messages'), {
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar || '',
        text,
        imageUrl: imageUrl || null,
        channelId: targetUserId,
        createdAt: new Date().toISOString()
    });
  };

  // --- OTHER ACTIONS (Local) ---
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
  
  const toggleUserPermission = async (userId: string, permission: 'suppliers' | 'courses') => {
    // Optimistic Update
    const updatedUsers = allUsers.map(u => u.id === userId ? { ...u, permissions: { ...u.permissions, [permission]: !u.permissions[permission] } } : u);
    setAllUsers(updatedUsers);
    
    // Firestore Update
    const targetUser = allUsers.find(u => u.id === userId);
    if(targetUser) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            [`permissions.${permission}`]: !targetUser.permissions[permission]
        });
    }
  };
  
  const updateUserAccess = async (userId: string, dueDate: string, supplierIds: string[], courseIds: string[]) => {
      // Optimistic
      const updatedUsers = allUsers.map(u => u.id === userId ? { ...u, subscriptionDueDate: dueDate, allowedSuppliers: supplierIds, allowedCourses: courseIds } : u);
      setAllUsers(updatedUsers);

      // Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
          subscriptionDueDate: dueDate,
          allowedSuppliers: supplierIds,
          allowedCourses: courseIds
      });
  };

  return (
    <AppContext.Provider value={{
      user, allUsers, isLoading, login, register, logout, loginWithGoogle,
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
