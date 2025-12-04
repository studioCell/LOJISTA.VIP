

import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { ArrowLeft, Play, CheckCircle, FileText, Download, PlusCircle, Video, Plus, X, Upload, Edit } from 'lucide-react';
import { UserRole, Lesson } from '../types';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { courses, user, addModule, addLesson, updateLesson } = useApp();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  // Local state for modals
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  
  // Edit State
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  
  const [targetModuleId, setTargetModuleId] = useState<string>('');
  
  // Form inputs
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  
  const videoInputRef = useRef<HTMLInputElement>(null);

  const course = courses.find(c => c.id === id);

  if (!course) return <div>Curso não encontrado</div>;

  // Initialize active state if needed (and only once/if not set)
  React.useEffect(() => {
    if (course.modules.length > 0 && !activeModule) {
      setActiveModule(course.modules[0].id);
      if(course.modules[0].lessons.length > 0) {
        setActiveLesson(course.modules[0].lessons[0].id);
      }
    }
  }, [course, activeModule]);

  const currentModule = course.modules.find(m => m.id === activeModule);
  const currentLesson = currentModule?.lessons.find(l => l.id === activeLesson);

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if(id) {
        addModule(id, newModuleTitle);
        setNewModuleTitle('');
        setIsModuleModalOpen(false);
    }
  };

  const handleOpenLessonModal = (moduleId: string) => {
    setTargetModuleId(moduleId);
    // Reset for ADD mode
    setIsEditingLesson(false);
    setEditingLessonId(null);
    setNewLessonTitle('');
    setNewLessonContent('');
    setVideoPreview(null);
    setIsLessonModalOpen(true);
  };

  const handleEditLesson = (e: React.MouseEvent, moduleId: string, lesson: Lesson) => {
    e.stopPropagation();
    setTargetModuleId(moduleId);
    setEditingLessonId(lesson.id);
    setNewLessonTitle(lesson.title);
    setNewLessonContent(lesson.content || '');
    setVideoPreview(lesson.videoUrl || null);
    setIsEditingLesson(true);
    setIsLessonModalOpen(true);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if(id && targetModuleId) {
        if (isEditingLesson && editingLessonId) {
            // EDIT EXISTING
            updateLesson(id, targetModuleId, editingLessonId, {
                title: newLessonTitle,
                content: newLessonContent,
                videoUrl: videoPreview || ''
            });
        } else {
            // CREATE NEW
            addLesson(id, targetModuleId, {
                id: Date.now().toString(),
                title: newLessonTitle,
                content: newLessonContent,
                videoUrl: videoPreview || '',
                completed: false
            });
        }
        
        // Cleanup
        setNewLessonTitle('');
        setNewLessonContent('');
        setVideoPreview(null);
        setIsEditingLesson(false);
        setEditingLessonId(null);
        setIsLessonModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative">
       <div className="flex justify-between items-center mb-4">
         <button onClick={() => navigate('/courses')} className="flex items-center space-x-2 text-gray-400 hover:text-white">
            <ArrowLeft size={18} />
            <span className="text-sm">Voltar para Cursos</span>
         </button>
         
         {user?.role === UserRole.ADMIN && (
            <div className="flex gap-2">
                 <button 
                    onClick={() => setIsModuleModalOpen(true)}
                    className="bg-gray-800 hover:bg-gray-700 text-yellow-500 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition"
                 >
                    <PlusCircle size={14} /> Novo Módulo
                 </button>
            </div>
         )}
       </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
         {/* Video Player Area */}
         <div className="flex-1 flex flex-col">
            <div className="bg-black aspect-video rounded-xl overflow-hidden shadow-2xl relative group border border-gray-800 flex items-center justify-center">
               {currentLesson ? (
                   currentLesson.videoUrl ? (
                     <video 
                       src={currentLesson.videoUrl} 
                       controls 
                       className="w-full h-full object-contain"
                       autoPlay
                     />
                   ) : (
                     <>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Play size={64} className="text-white opacity-50 group-hover:opacity-100 transition duration-300 scale-100 group-hover:scale-110 cursor-pointer" />
                        </div>
                        <img src={`https://picsum.photos/1200/800?blur=5&random=${currentLesson.id}`} className="w-full h-full object-cover opacity-30" />
                     </>
                   )
               ) : (
                   <div className="flex items-center justify-center h-full text-gray-500 flex-col p-6 text-center">
                       <Video size={48} className="mb-2 opacity-50" />
                       <p>Selecione uma aula na lista ao lado.</p>
                   </div>
               )}
            </div>

            <div className="mt-6">
               <h1 className="text-2xl font-bold text-white mb-2">{currentLesson?.title || course.title}</h1>
               <p className="text-gray-400 leading-relaxed mb-6">
                 {currentLesson?.content || course.description}
               </p>

               {currentLesson && (
                 <div className="bg-dark-surface border border-gray-800 rounded-xl p-4">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                      <FileText size={18} /> Materiais Complementares
                    </h3>
                    <div className="flex gap-3">
                       <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-sm px-4 py-2 rounded-lg transition text-gray-300">
                          <Download size={14} /> <span>Material de Apoio.pdf</span>
                       </button>
                    </div>
                 </div>
               )}
            </div>
         </div>

         {/* Sidebar Playlist */}
         <div className="w-full lg:w-96 bg-dark-surface border border-gray-800 rounded-xl overflow-hidden flex flex-col h-fit max-h-[calc(100vh-100px)]">
            <div className="p-4 border-b border-gray-800 bg-gray-900/50">
               <h3 className="font-bold text-white">Conteúdo do Curso</h3>
               <p className="text-xs text-gray-500 mt-1">{course.modules.length} Módulos</p>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {course.modules.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Nenhum módulo criado.
                </div>
              )}
              {course.modules.map(module => (
                <div key={module.id} className="border-b border-gray-800/50 last:border-0">
                  <div 
                    className="p-4 bg-gray-800/30 font-bold text-sm text-gray-300 flex justify-between items-center group"
                  >
                    <span>{module.title}</span>
                    {user?.role === UserRole.ADMIN && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenLessonModal(module.id); }}
                          className="text-yellow-500 opacity-0 group-hover:opacity-100 transition hover:bg-yellow-500/10 p-1 rounded"
                          title="Adicionar Aula"
                        >
                            <Plus size={14} />
                        </button>
                    )}
                  </div>
                  <div>
                    {module.lessons.map(lesson => (
                      <div 
                        key={lesson.id}
                        onClick={() => { setActiveModule(module.id); setActiveLesson(lesson.id); }}
                        className={`p-3 pl-6 flex items-center justify-between cursor-pointer transition hover:bg-gray-800 ${activeLesson === lesson.id ? 'bg-yellow-500/10 border-l-4 border-yellow-500' : 'border-l-4 border-transparent'}`}
                      >
                         <div className="flex items-start space-x-3">
                            <div className={`mt-0.5 ${lesson.completed ? 'text-green-500' : 'text-gray-600'}`}>
                                <CheckCircle size={16} />
                            </div>
                            <div>
                                <p className={`text-sm ${activeLesson === lesson.id ? 'text-yellow-400 font-medium' : 'text-gray-400'}`}>
                                    {lesson.title}
                                </p>
                                <span className="text-[10px] text-gray-600">
                                    {lesson.videoUrl ? 'Videoaula' : 'Texto'}
                                </span>
                            </div>
                         </div>

                         {user?.role === UserRole.ADMIN && (
                            <button 
                                onClick={(e) => handleEditLesson(e, module.id, lesson)}
                                className="text-gray-500 hover:text-yellow-500 transition p-2"
                                title="Editar Aula"
                            >
                                <Edit size={14} />
                            </button>
                         )}
                      </div>
                    ))}
                    {module.lessons.length === 0 && (
                        <div className="p-3 pl-6 text-xs text-gray-600 italic">Nenhuma aula neste módulo.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
         </div>
      </div>

      {/* Modal: Add Module */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-surface border border-gray-800 rounded-xl p-6 w-full max-w-sm relative animate-fade-in">
                <button onClick={() => setIsModuleModalOpen(false)} className="absolute top-4 right-4 text-gray-400"><X size={20}/></button>
                <h3 className="font-bold text-white mb-4">Novo Módulo</h3>
                <form onSubmit={handleAddModule}>
                    <input 
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-4 outline-none focus:border-yellow-500"
                        placeholder="Nome do Módulo (ex: Introdução)"
                        value={newModuleTitle}
                        onChange={e => setNewModuleTitle(e.target.value)}
                        required
                    />
                    <button className="w-full bg-yellow-500 text-black font-bold py-2 rounded">Adicionar</button>
                </form>
            </div>
        </div>
      )}

      {/* Modal: Add/Edit Lesson */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-surface border border-gray-800 rounded-xl p-6 w-full max-w-sm relative animate-fade-in">
                <button onClick={() => setIsLessonModalOpen(false)} className="absolute top-4 right-4 text-gray-400"><X size={20}/></button>
                <h3 className="font-bold text-white mb-4">{isEditingLesson ? 'Editar Aula' : 'Adicionar Nova Aula'}</h3>
                <form onSubmit={handleSaveLesson}>
                    <input 
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-3 outline-none focus:border-yellow-500"
                        placeholder="Título da Aula"
                        value={newLessonTitle}
                        onChange={e => setNewLessonTitle(e.target.value)}
                        required
                    />
                    
                    {/* Video Upload Area - highlighted for Admin */}
                    <input 
                       type="file" 
                       accept="video/*" 
                       ref={videoInputRef} 
                       className="hidden" 
                       onChange={handleVideoUpload} 
                    />
                    <div 
                       onClick={() => videoInputRef.current?.click()}
                       className={`border-2 border-dashed ${videoPreview ? 'border-green-500 bg-green-500/10' : 'border-yellow-500/50 bg-gray-900'} rounded-lg p-6 mb-4 cursor-pointer flex flex-col items-center justify-center text-sm text-gray-400 hover:border-yellow-500 transition group`}
                    >
                       {videoPreview ? (
                          <div className="flex flex-col items-center text-green-400 font-bold">
                             <CheckCircle size={24} className="mb-2" /> 
                             <span>Vídeo Carregado!</span>
                             <span className="text-xs text-gray-500 mt-1">Clique para substituir</span>
                          </div>
                       ) : (
                          <>
                             <Upload size={32} className="mb-2 text-yellow-500 group-hover:scale-110 transition" />
                             <span className="font-bold text-white">
                                {isEditingLesson ? 'Substituir Vídeo' : 'Importar Vídeo'}
                             </span>
                             <span className="text-xs mt-1">MP4, WebM (Máx 500MB)</span>
                          </>
                       )}
                    </div>

                    <textarea 
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-4 outline-none focus:border-yellow-500"
                        placeholder="Descrição ou conteúdo de texto..."
                        rows={3}
                        value={newLessonContent}
                        onChange={e => setNewLessonContent(e.target.value)}
                    />
                    <button className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition">
                        {isEditingLesson ? 'Salvar Alterações' : 'Salvar Aula'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
