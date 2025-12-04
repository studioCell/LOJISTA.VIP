
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context';
import { 
  Home, 
  ShoppingBag, 
  Users, 
  GraduationCap, 
  MessageCircle, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { UserRole } from './types';

// Pages
import LoginPage from './pages/Login';
import FeedPage from './pages/Feed';
import SuppliersPage from './pages/Suppliers';
import VipStorePage from './pages/VipStore';
import CoursesPage from './pages/Courses';
import AdminPage from './pages/Admin';
import SupplierDetail from './pages/SupplierDetail';
import CourseDetail from './pages/CourseDetail';
import ChatPage from './pages/Chat';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useApp();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
         <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path ? 'text-yellow-400' : 'text-gray-400';

  return (
    <div className="min-h-screen bg-dark text-gray-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-dark-surface border-r border-gray-800 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-yellow-400 tracking-tighter">LOJISTA<span className="text-white">VIP</span></h1>
          <p className="text-xs text-gray-500 mt-1">Plataforma Premium</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {/* Chat First/Prominent */}
          <button onClick={() => navigate('/chat')} className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-800 transition ${isActive('/chat')}`}>
            <MessageCircle size={20} /> <span>Chat & Mensagens</span>
          </button>
          
          <button onClick={() => navigate('/')} className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-800 transition ${isActive('/')}`}>
            <Home size={20} /> <span>Feed de Ofertas</span>
          </button>
          
          <button onClick={() => navigate('/suppliers')} className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-800 transition ${isActive('/suppliers')}`}>
            <Users size={20} /> <span>Fornecedores</span>
          </button>
          <button onClick={() => navigate('/store')} className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-800 transition ${isActive('/store')}`}>
            <ShoppingBag size={20} /> <span>VIP Store</span>
          </button>
          <button onClick={() => navigate('/courses')} className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-800 transition ${isActive('/courses')}`}>
            <GraduationCap size={20} /> <span>Cursos</span>
          </button>
          
          {user?.role === UserRole.ADMIN && (
            <button onClick={() => navigate('/admin')} className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-800 transition ${isActive('/admin')}`}>
              <Settings size={20} /> <span>Painel Admin</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <img src={user?.avatar} alt="User" className="w-8 h-8 rounded-full bg-gray-700" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role === UserRole.ADMIN ? 'Administrador' : 'Lojista'}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center space-x-3 w-full p-2 text-red-400 hover:text-red-300 transition text-sm">
            <LogOut size={16} /> <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-dark-surface border-b border-gray-800 p-4 sticky top-0 z-50 flex justify-between items-center">
        <h1 className="text-xl font-bold text-yellow-400">LOJISTA<span className="text-white">VIP</span></h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-dark-surface z-40 pt-20 px-6 space-y-4">
           <button onClick={() => { navigate('/chat'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 border-b border-gray-800 text-yellow-400 font-bold">Chat & Mensagens</button>
           <button onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 border-b border-gray-800">Feed de Ofertas</button>
           <button onClick={() => { navigate('/suppliers'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 border-b border-gray-800">Fornecedores</button>
           <button onClick={() => { navigate('/store'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 border-b border-gray-800">VIP Store</button>
           <button onClick={() => { navigate('/courses'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 border-b border-gray-800">Cursos</button>
           {user?.role === UserRole.ADMIN && (
             <button onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 border-b border-gray-800 text-yellow-400">Painel Admin</button>
           )}
           <button onClick={logout} className="block w-full text-left py-3 text-red-400">Sair</button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-60px)] md:h-screen pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Nav - Chat First (Leftmost) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-gray-800 flex justify-around p-3 z-30 pb-safe">
        <button onClick={() => navigate('/chat')} className={`flex flex-col items-center ${isActive('/chat')}`}>
          <MessageCircle size={20} />
          <span className="text-[10px] mt-1">Chat</span>
        </button>
        <button onClick={() => navigate('/')} className={`flex flex-col items-center ${isActive('/')}`}>
          <Home size={20} />
          <span className="text-[10px] mt-1">Feed</span>
        </button>
        <button onClick={() => navigate('/suppliers')} className={`flex flex-col items-center ${isActive('/suppliers')}`}>
          <Users size={20} />
          <span className="text-[10px] mt-1">Forn.</span>
        </button>
        <button onClick={() => navigate('/store')} className={`flex flex-col items-center ${isActive('/store')}`}>
          <ShoppingBag size={20} />
          <span className="text-[10px] mt-1">Loja</span>
        </button>
        <button onClick={() => navigate('/courses')} className={`flex flex-col items-center ${isActive('/courses')}`}>
          <GraduationCap size={20} />
          <span className="text-[10px] mt-1">EAD</span>
        </button>
      </nav>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><Layout><FeedPage /></Layout></PrivateRoute>} />
          <Route path="/suppliers" element={<PrivateRoute><Layout><SuppliersPage /></Layout></PrivateRoute>} />
          <Route path="/suppliers/:id" element={<PrivateRoute><Layout><SupplierDetail /></Layout></PrivateRoute>} />
          <Route path="/store" element={<PrivateRoute><Layout><VipStorePage /></Layout></PrivateRoute>} />
          <Route path="/courses" element={<PrivateRoute><Layout><CoursesPage /></Layout></PrivateRoute>} />
          <Route path="/courses/:id" element={<PrivateRoute><Layout><CourseDetail /></Layout></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><Layout><ChatPage /></Layout></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><Layout><AdminPage /></Layout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
