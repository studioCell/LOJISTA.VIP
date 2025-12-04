
import React, { useState } from 'react';
import { useApp } from '../context';
import { PlayCircle, Clock, Award, Plus, X, Lock, Clock as ClockIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

const Courses: React.FC = () => {
  const { courses, user, addCourse } = useApp();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Course State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  // --- ACCESS CONTROL LOGIC ---
  const isExpired = user && user.subscriptionDueDate ? new Date(user.subscriptionDueDate) < new Date() : false;
  const hasPlan = user && (user.role === UserRole.ADMIN || (user.subscriptionDueDate && !isExpired));

  const allowedCourseIds = user?.allowedCourses || [];
  
  // Admin sees all. Users see only what is allowed.
  // HOWEVER: The prompt implies users can SEE the cover but not access. 
  // But for the "Choose which course to release" feature to make sense, maybe we should hide the others?
  // Let's Stick to the previous "Show all but Lock" logic, BUT prioritize the Specific Access List.
  // If a user has NO access to a course, it shows locked. If they have access ID, it shows unlocked.
  
  // Wait, if the requirement is "Choose the course I will release", that implies filtering access.
  // If I only release Course A, Course B should be Locked.
  
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    addCourse({
      id: Date.now().toString(),
      title: title,
      description: desc,
      imageUrl: `https://picsum.photos/600/300?random=${Date.now()}`,
      lessonCount: 0,
      modules: []
    });
    setIsModalOpen(false);
    setTitle('');
    setDesc('');
  };

  // If expired completely, block the whole page like Suppliers?
  if (user && user.role !== UserRole.ADMIN && (!hasPlan || isExpired)) {
      return (
          <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center p-8 animate-fade-in">
              <div className="w-24 h-24 bg-red-900/30 rounded-full flex items-center justify-center mb-6 border border-red-500/50">
                  <ClockIcon size={48} className="text-red-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Plano Expirado</h2>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                  Sua assinatura venceu. Renove agora para continuar assistindo às aulas.
              </p>
              <button 
                  onClick={() => navigate('/chat')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-xl transition"
              >
                  Renovar Assinatura
              </button>
          </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Academia Lojista VIP</h2>
          <p className="text-gray-400">Domine as vendas e a gestão da sua loja.</p>
        </div>
        {user?.role === UserRole.ADMIN && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold flex items-center space-x-2 shadow-lg hover:shadow-yellow-500/20 transition"
          >
            <Plus size={20} />
            <span>Criar Curso</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {courses.map(course => {
          const hasAccess = user?.role === UserRole.ADMIN || allowedCourseIds.includes(course.id);
          
          return (
            <div key={course.id} className="bg-dark-surface border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition flex flex-col md:flex-row group">
                <div className="md:w-1/3 h-48 md:h-auto relative bg-gray-800 overflow-hidden">
                <img src={course.imageUrl} alt={course.title} className={`w-full h-full object-cover transition duration-500 ${hasAccess ? 'group-hover:scale-105' : 'grayscale'}`} />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center md:hidden">
                    {hasAccess ? <PlayCircle size={48} className="text-white opacity-80" /> : <Lock size={48} className="text-gray-400"/>}
                </div>
                </div>
                
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                <div className="flex items-center space-x-3 mb-2 text-xs font-bold text-yellow-500 uppercase tracking-wider">
                    <span className="bg-yellow-500/10 px-2 py-1 rounded">Marketing</span>
                    <span className="flex items-center"><Clock size={12} className="mr-1"/> {course.lessonCount} aulas</span>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-gray-400 mb-6 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                    <div className="w-full bg-gray-800 h-2 rounded-full mr-4 max-w-[200px]">
                        <div className={`h-2 rounded-full w-[${hasAccess ? '20%' : '0%'}] ${hasAccess ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                    </div>
                    
                    {hasAccess ? (
                        <button 
                            onClick={() => navigate(`/courses/${course.id}`)}
                            className="bg-white hover:bg-gray-200 text-black px-6 py-2.5 rounded-lg font-bold transition whitespace-nowrap"
                        >
                            Acessar Curso
                        </button>
                    ) : (
                        <button 
                            onClick={() => navigate('/chat')}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 px-6 py-2.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-2"
                        >
                            <Lock size={16} /> Solicitar Acesso
                        </button>
                    )}
                </div>
                </div>
            </div>
          );
        })}

        <div className="bg-gradient-to-br from-gray-900 to-black border border-dashed border-gray-700 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
           <Award size={48} className="text-gray-600 mb-4" />
           <h3 className="text-lg font-bold text-gray-400">Mais conteúdo em breve</h3>
        </div>
      </div>

      {/* Create Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-surface border border-gray-800 rounded-2xl w-full max-w-md p-6 relative animate-fade-in">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6">Criar Novo Curso</h3>
            
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 ml-1">Título do Curso</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 ml-1">Descrição Curta</label>
                <textarea 
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                  rows={3}
                  required
                />
              </div>

              <div className="bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg p-6 text-center text-sm text-gray-500">
                Imagem da Capa (Gerada automaticamente)
              </div>

              <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg mt-2">
                Criar Curso
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
