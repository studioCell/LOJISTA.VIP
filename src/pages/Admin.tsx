
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context';
import { UserRole, User } from '../types';
import { Plus, Trash2, TrendingUp, Users, DollarSign, Package, Image as ImageIcon, Lock, Unlock, Search, CheckSquare, Square, X, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Admin: React.FC = () => {
  const { user, allUsers, offers, deleteOffer, addOffer, updateUserAccess, suppliers, courses, onlineCount } = useApp();
  const [activeTab, setActiveTab] = useState<'dash' | 'offers' | 'users'>('dash');
  const [userSearch, setUserSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Access Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [accessDueDate, setAccessDueDate] = useState('');
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Simple Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return <div className="text-center p-10">Acesso Negado</div>;
  }

  // Active Subscribers Calculation (Has Valid Date > Now)
  const activeSubscribersCount = allUsers.filter(u => {
      if (!u.subscriptionDueDate) return false;
      return new Date(u.subscriptionDueDate) >= new Date();
  }).length;

  // Mock Form State for New Offer
  const [newOfferText, setNewOfferText] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 800 * 1024) {
          alert("Imagem muito grande (Máx 800kb)");
          return;
      }
      const url = await fileToBase64(file);
      setPreviewUrl(url);
    }
  };
  
  const handlePostOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    await addOffer({
      id: '', // DB Generated
      supplierName: user?.name || 'Oferta do Admin',
      description: newOfferText,
      mediaUrl: previewUrl || `https://picsum.photos/600/400?random=${Date.now()}`,
      price: 'R$ 99,90',
      likes: 0,
      comments: [],
      whatsapp: '5511999999999',
      category: 'Geral',
      timestamp: '' // Context handles this
    });
    setNewOfferText('');
    setPreviewUrl(null);
    alert('Oferta publicada!');
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const openAccessModal = (u: User) => {
      setEditingUser(u);
      setAccessDueDate(u.subscriptionDueDate || '');
      setSelectedSuppliers(u.allowedSuppliers || []);
      setSelectedCourses(u.allowedCourses || []);
  };

  const closeAccessModal = () => {
      setEditingUser(null);
  };

  const saveAccess = () => {
      if (editingUser) {
          updateUserAccess(editingUser.id, accessDueDate, selectedSuppliers, selectedCourses);
          closeAccessModal();
      }
  };

  const toggleSupplierSelect = (id: string) => {
      if (selectedSuppliers.includes(id)) {
          setSelectedSuppliers(selectedSuppliers.filter(sid => sid !== id));
      } else {
          setSelectedSuppliers([...selectedSuppliers, id]);
      }
  };

  const toggleCourseSelect = (id: string) => {
      if (selectedCourses.includes(id)) {
          setSelectedCourses(selectedCourses.filter(cid => cid !== id));
      } else {
          setSelectedCourses([...selectedCourses, id]);
      }
  };

  const data = [
    { name: 'Seg', uv: 400 },
    { name: 'Ter', uv: 300 },
    { name: 'Qua', uv: 200 },
    { name: 'Qui', uv: 278 },
    { name: 'Sex', uv: 189 },
    { name: 'Sab', uv: 239 },
    { name: 'Dom', uv: 349 },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6">Painel Administrativo</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div 
          onClick={() => setActiveTab('users')}
          className="bg-dark-surface border border-gray-800 p-4 rounded-xl cursor-pointer hover:border-yellow-500 transition group"
        >
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-gray-500 text-xs uppercase font-bold group-hover:text-yellow-500">Total Usuários</p>
                 <h3 className="text-2xl font-bold text-white">{allUsers.length}</h3>
              </div>
              <Users className="text-blue-500 group-hover:scale-110 transition" size={20} />
           </div>
        </div>
        <div className="bg-dark-surface border border-gray-800 p-4 rounded-xl">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-gray-500 text-xs uppercase font-bold">Assinantes Ativos</p>
                 <h3 className="text-2xl font-bold text-white text-green-400">{activeSubscribersCount}</h3>
              </div>
              <DollarSign className="text-green-500" size={20} />
           </div>
        </div>
        <div className="bg-dark-surface border border-gray-800 p-4 rounded-xl">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-gray-500 text-xs uppercase font-bold">Ofertas Ativas</p>
                 <h3 className="text-2xl font-bold text-white">{offers.length}</h3>
              </div>
              <Package className="text-yellow-500" size={20} />
           </div>
        </div>
        <div className="bg-dark-surface border border-gray-800 p-4 rounded-xl">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-gray-500 text-xs uppercase font-bold">Usuários Online</p>
                 <h3 className="text-2xl font-bold text-white animate-pulse">{onlineCount}</h3>
              </div>
              <TrendingUp className="text-purple-500" size={20} />
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg w-fit mb-6">
        <button 
          onClick={() => setActiveTab('dash')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'dash' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}
        >
          Visão Geral
        </button>
        <button 
           onClick={() => setActiveTab('offers')}
           className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'offers' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}
        >
          Gerenciar Ofertas
        </button>
        <button 
           onClick={() => setActiveTab('users')}
           className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'users' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}
        >
          Gestão de Usuários
        </button>
      </div>

      {activeTab === 'dash' && (
        <div className="bg-dark-surface border border-gray-800 p-6 rounded-xl">
           <h3 className="text-lg font-bold text-white mb-4">Acessos da Semana</h3>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data}>
                 <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#FACC15' }}
                 />
                 <Bar dataKey="uv" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#FACC15" />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-dark-surface border border-gray-800 rounded-xl overflow-hidden">
           <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Usuários Cadastrados</h3>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar usuário..."
                  className="bg-gray-900 border border-gray-700 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-yellow-500"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
                   <tr>
                     <th className="px-6 py-4">Usuário</th>
                     <th className="px-6 py-4">E-mail</th>
                     <th className="px-6 py-4">Status da Assinatura</th>
                     <th className="px-6 py-4 text-center">Ações</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                   {filteredUsers.map(u => {
                      const isExpired = u.subscriptionDueDate ? new Date(u.subscriptionDueDate) < new Date() : true;
                      const hasDate = !!u.subscriptionDueDate;
                      return (
                        <tr key={u.id} className="hover:bg-gray-800/50 transition">
                            <td className="px-6 py-4 flex items-center space-x-3">
                                <img src={u.avatar} className="w-8 h-8 rounded-full bg-gray-700" />
                                <span className={`font-medium ${u.role === UserRole.ADMIN ? 'text-yellow-400' : 'text-gray-200'}`}>
                                    {u.name} {u.role === UserRole.ADMIN && '(ADM)'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-400 text-sm">{u.email}</td>
                            <td className="px-6 py-4 text-sm">
                                {u.role === UserRole.ADMIN ? (
                                    <span className="text-yellow-500">Acesso Vitalício</span>
                                ) : hasDate ? (
                                    isExpired ? (
                                        <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded-md text-xs font-bold">Vencido {new Date(u.subscriptionDueDate || '').toLocaleDateString()}</span>
                                    ) : (
                                        <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-md text-xs font-bold">Ativo até {new Date(u.subscriptionDueDate || '').toLocaleDateString()}</span>
                                    )
                                ) : (
                                    <span className="text-gray-500 italic">Sem plano</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {u.role !== UserRole.ADMIN && (
                                    <button 
                                        onClick={() => openAccessModal(u)}
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto"
                                    >
                                        <Lock size={14} /> Gerenciar Acesso
                                    </button>
                                )}
                            </td>
                        </tr>
                      );
                   })}
                </tbody>
             </table>
           </div>
        </div>
      )}

      {/* Access Management Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-surface border border-gray-800 rounded-2xl w-full max-w-3xl p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
                <button onClick={closeAccessModal} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                <h3 className="text-xl font-bold text-white mb-6">Gerenciar Acesso: <span className="text-yellow-500">{editingUser.name}</span></h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Expiry Date */}
                    <div className="col-span-1 md:col-span-2 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                        <label className="text-sm text-gray-400 mb-2 block font-bold flex items-center gap-2">
                             <Calendar size={16} /> Data de Vencimento da Assinatura
                        </label>
                        <input 
                            type="date"
                            className="bg-gray-800 border border-gray-700 text-white rounded-lg p-3 w-full focus:border-yellow-500 outline-none"
                            value={accessDueDate}
                            onChange={(e) => setAccessDueDate(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Se a data for anterior a hoje, o usuário perderá o acesso automaticamente.
                        </p>
                    </div>

                    {/* Suppliers List */}
                    <div>
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2 border-b border-gray-800 pb-2">
                            <Package size={16} /> Fornecedores Liberados
                        </h4>
                        <div className="bg-gray-900 rounded-xl p-2 max-h-60 overflow-y-auto custom-scrollbar border border-gray-800">
                            {suppliers.map(s => (
                                <div 
                                    key={s.id} 
                                    onClick={() => toggleSupplierSelect(s.id)}
                                    className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition mb-1 ${selectedSuppliers.includes(s.id) ? 'bg-yellow-500/10 border border-yellow-500/50' : 'hover:bg-gray-800'}`}
                                >
                                    {selectedSuppliers.includes(s.id) ? 
                                        <CheckSquare className="text-yellow-500" size={20}/> : 
                                        <Square className="text-gray-600" size={20}/>
                                    }
                                    <span className={selectedSuppliers.includes(s.id) ? 'text-white font-medium' : 'text-gray-400'}>{s.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Courses List */}
                    <div>
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2 border-b border-gray-800 pb-2">
                            <Lock size={16} /> Cursos Liberados
                        </h4>
                        <div className="bg-gray-900 rounded-xl p-2 max-h-60 overflow-y-auto custom-scrollbar border border-gray-800">
                            {courses.map(c => (
                                <div 
                                    key={c.id} 
                                    onClick={() => toggleCourseSelect(c.id)}
                                    className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition mb-1 ${selectedCourses.includes(c.id) ? 'bg-yellow-500/10 border border-yellow-500/50' : 'hover:bg-gray-800'}`}
                                >
                                    {selectedCourses.includes(c.id) ? 
                                        <CheckSquare className="text-yellow-500" size={20}/> : 
                                        <Square className="text-gray-600" size={20}/>
                                    }
                                    <span className={selectedCourses.includes(c.id) ? 'text-white font-medium' : 'text-gray-400'}>{c.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={closeAccessModal} className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 font-bold">Cancelar</button>
                    <button onClick={saveAccess} className="px-6 py-3 rounded-xl bg-yellow-500 text-black font-bold hover:bg-yellow-400">Salvar Alterações</button>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'offers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Create Offer */}
           <div className="bg-dark-surface border border-gray-800 p-6 rounded-xl h-fit">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Plus size={20} className="text-yellow-500" /> Nova Oferta Rápida
              </h3>
              <form onSubmit={handlePostOffer} className="space-y-4">
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    onChange={handleImageUpload} 
                    accept="image/*"
                 />
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`bg-gray-900 border border-dashed ${previewUrl ? 'border-yellow-500 p-0' : 'border-gray-700 p-8'} rounded-lg text-center text-gray-500 text-sm cursor-pointer hover:border-yellow-500 transition relative overflow-hidden h-40 flex items-center justify-center`}
                 >
                    {previewUrl ? (
                         <img src={previewUrl} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center">
                            <ImageIcon size={24} className="mb-2"/>
                            <p>Clique para adicionar foto</p>
                        </div>
                    )}
                 </div>
                 
                 <div>
                   <label className="block text-xs text-gray-400 mb-1">Descrição</label>
                   <textarea 
                     className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-yellow-500 outline-none"
                     rows={4}
                     placeholder="Escreva sobre o produto..."
                     value={newOfferText}
                     onChange={(e) => setNewOfferText(e.target.value)}
                     required
                   ></textarea>
                 </div>
                 <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg transition">
                   Publicar Agora
                 </button>
              </form>
           </div>

           {/* List Offers */}
           <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Ofertas Recentes</h3>
              {offers.map(offer => (
                <div key={offer.id} className="bg-gray-900 border border-gray-800 p-4 rounded-lg flex items-center space-x-4">
                   <img src={offer.mediaUrl} className="w-16 h-16 rounded object-cover" />
                   <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{offer.supplierName}</p>
                      <p className="text-xs text-gray-500 truncate">{offer.description}</p>
                   </div>
                   <button 
                     onClick={() => deleteOffer(offer.id)}
                     className="text-red-500 hover:bg-red-500/10 p-2 rounded transition"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
