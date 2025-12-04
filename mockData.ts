
import { Offer, Supplier, VipProduct, Course, UserRole, User } from './types';

export const MOCK_ADMIN: User = {
  id: 'a1',
  name: 'Mateus Hugo (Admin)',
  email: 'm.mateushugo123@gmail.com',
  role: UserRole.ADMIN,
  avatar: 'https://picsum.photos/100/100',
  subscriptionDueDate: '2030-12-31',
  allowedSuppliers: [], // Admin sees all by default logic
  allowedCourses: [],
  permissions: {
    suppliers: true,
    courses: true
  }
};

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Lojista Usuário',
  email: 'user@lojista.vip',
  role: UserRole.USER,
  avatar: 'https://picsum.photos/100/100',
  subscriptionDueDate: '', // Not set
  allowedSuppliers: [],
  allowedCourses: [],
  permissions: {
    suppliers: false, 
    courses: false    
  }
};

export const MOCK_USERS_LIST: User[] = [
  MOCK_ADMIN,
  MOCK_USER,
  {
    id: 'u2',
    name: 'Carla Modas',
    email: 'carla@loja.com',
    role: UserRole.USER,
    avatar: 'https://picsum.photos/100/100?random=50',
    subscriptionDueDate: '2024-12-31',
    allowedSuppliers: ['s1'],
    allowedCourses: ['c1'],
    permissions: { suppliers: true, courses: true }
  },
  {
    id: 'u3',
    name: 'João Multimarcas',
    email: 'joao@store.com',
    role: UserRole.USER,
    avatar: 'https://picsum.photos/100/100?random=51',
    subscriptionDueDate: '2023-01-01', // Expired
    allowedSuppliers: [],
    allowedCourses: [],
    permissions: { suppliers: false, courses: true }
  },
  {
    id: 'u4',
    name: 'Ana Boutique',
    email: 'ana@boutique.com',
    role: UserRole.USER,
    avatar: 'https://picsum.photos/100/100?random=52',
    subscriptionDueDate: '',
    allowedSuppliers: [],
    allowedCourses: [],
    permissions: { suppliers: false, courses: false }
  }
];

export const INITIAL_OFFERS: Offer[] = [
  {
    id: 'o1',
    supplierName: 'Atacado Moda Sul',
    productName: 'Casaco de Lã Batida',
    description: 'Nova coleção de Inverno chegando com tudo! Casacos de lã batida direto da fábrica.',
    mediaUrl: 'https://picsum.photos/600/400?random=1',
    price: 'R$ 89,90',
    likes: 45,
    comments: [],
    whatsapp: '5511999999999',
    category: 'Roupas',
    timestamp: '2h atrás'
  },
  {
    id: 'o2',
    supplierName: 'Eletrônicos ChinaImp',
    productName: 'Smartwatch Ultra Series 9',
    description: 'Lote exclusivo para revenda. Alta margem de lucro! Acompanha pulseira extra.',
    mediaUrl: 'https://picsum.photos/600/400?random=2',
    price: 'R$ 45,00',
    likes: 12,
    comments: [],
    whatsapp: '5511988888888',
    category: 'Eletrônicos',
    timestamp: '5h atrás'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 's1',
    name: 'Atacado Moda Sul',
    category: 'Moda Feminina',
    city: 'Brás - SP',
    imageUrl: 'https://picsum.photos/200/200?random=3',
    rating: 4.8,
    isVerified: true,
    whatsapp: '5511999999999',
    bio: 'Somos referência em moda feminina no sul do país. Enviamos para todo Brasil.',
    address: 'Rua Miller, 500 - Brás, São Paulo - SP',
    cnpj: '12.345.678/0001-90',
    mapsUrl: '',
    images: ['https://picsum.photos/400/400?random=10', 'https://picsum.photos/400/400?random=11']
  },
  {
    id: 's2',
    name: 'Jeans & Cia',
    category: 'Jeans',
    city: 'Goiânia - GO',
    imageUrl: 'https://picsum.photos/200/200?random=4',
    rating: 4.5,
    isVerified: false,
    whatsapp: '5511977777777',
    bio: 'Fábrica de Jeans premium. Atacado mínimo 12 peças.',
    address: 'Galeria 44, Goiânia - GO',
    cnpj: '98.765.432/0001-01',
    images: ['https://picsum.photos/400/400?random=12']
  }
];

export const INITIAL_VIP_PRODUCTS: VipProduct[] = [
  {
    id: 'p1',
    title: 'Kit Expositor de Joias',
    description: 'Veludo premium preto, kit completo para balcão.',
    price: 'R$ 250,00',
    imageUrl: 'https://picsum.photos/300/300?random=5',
    stock: 15,
    isLocked: false
  },
  {
    id: 'p2',
    title: 'Manequim Realista Importado',
    description: 'Acabamento de pele real, maquiagem inclusa.',
    price: 'R$ 1.200,00',
    imageUrl: 'https://picsum.photos/300/300?random=6',
    stock: 5,
    isLocked: true // VIP only
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Domine as Vendas no Instagram',
    description: 'Aprenda a transformar seguidores em clientes fiéis.',
    imageUrl: 'https://picsum.photos/600/300?random=7',
    lessonCount: 12,
    modules: [
      {
        id: 'm1',
        title: 'Módulo 1: Preparando o Perfil',
        lessons: [
          { id: 'l1', title: 'Biografia que Vende', videoUrl: '', content: 'Texto explicativo sobre bio...', completed: false },
          { id: 'l2', title: 'Destaques Estratégicos', videoUrl: '', content: 'Como criar destaques...', completed: false }
        ]
      }
    ]
  },
  {
    id: 'c2',
    title: 'Gestão Financeira para Lojistas',
    description: 'Pare de misturar o dinheiro da loja com o pessoal.',
    imageUrl: 'https://picsum.photos/600/300?random=8',
    lessonCount: 8,
    modules: []
  }
];
