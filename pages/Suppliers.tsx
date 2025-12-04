
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context';
import { Search, ShieldCheck, MapPin, ChevronRight, Plus, X, Upload, Lock, Clock, Edit, Star, Trash2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRole, Supplier } from '../types';

const COMMON_CITIES = ['Brás - SP', 'Bom Retiro - SP', 'Goiânia - GO', 'Fortaleza - CE', 'Santa Cruz do Capibaribe - PE', 'Monte Sião - MG', 'Outros'];

const Suppliers: React.FC = () => {
  const { suppliers, user, addSupplier, updateSupplier } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const extraPhotosRef = useRef<HTMLInputElement>(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formCat, setFormCat] = useState('Moda');
  const [formCity, setFormCity] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formZap, setFormZap] = useState('');
  const [formLogo, setFormLogo] = useState<string | null>(null);
  const [formVerified, setFormVerified] = useState(false);
  const [formAddress, setFormAddress] = useState('');
  const [formMapsUrl, setFormMapsUrl] = useState('');
  const [formCnpj, setFormCnpj] = useState('');
  const [formRating, setFormRating] = useState('5.0');
  const [formImages, setFormImages] = useState<string[]>([]);

  // Derive Filters
  const availableCategories = Array.from(new Set(suppliers.map(s => s.category))).sort();
  const availableCities = Array.from(new Set(suppliers.map(s => s.city || 'Outros'))).sort();

  // --- ACCESS CONTROL LOGIC ---
  const isExpired = user && user.subscriptionDueDate ? new Date(user.subscriptionDueDate) < new Date() : false;
  const hasPlan = user && (user.role === UserRole.ADMIN || (user.subscriptionDueDate && !isExpired));
  const allowedSupplierIds = user?.allowedSuppliers || [];
  
  const accessibleSuppliers = user?.role === UserRole.ADMIN 
    ? suppliers 
    : suppliers.filter(s => allowedSupplierIds.includes(s.id));

  if (user && user.role !== UserRole.ADMIN && (!hasPlan || isExpired)) {
    return (
        <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            <div className="w-24 h-24 bg-red-900/30 rounded-full flex items-center justify-center mb-6 border border-red-500/50">
                <Clock size={48} className="text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Plano Expirado</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
                Sua assinatura venceu em {user.subscriptionDueDate ? new Date(user.subscriptionDueDate).toLocaleDateString() : 'data desconhecida'}. 
                Renove agora para recuperar o acesso aos fornecedores exclusivos.
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

  const filteredSuppliers = accessibleSuppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCityFilter ? (s.city === selectedCityFilter || (!s.city && selectedCityFilter === 'Outros')) : true;
    const matchesCategory = selectedCategoryFilter ? s.category === selectedCategoryFilter : true;
    
    return matchesSearch && matchesCity && matchesCategory;
  });

  const handleOpenAdd = () => {
      setIsEditing(false);
      setEditingId(null);
      setFormName('');
      setFormCat('Moda');
      setFormCity('Brás - SP');
      setFormBio('');
      setFormZap('');
      setFormLogo(null);
      setFormVerified(false);
      setFormAddress('');
      setFormMapsUrl('');
      setFormCnpj('');
      setFormRating('5.0');
      setFormImages([]);
      setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, s: Supplier) => {
      e.stopPropagation();
      setIsEditing(true);
      setEditingId(s.id);
      setFormName(s.name);
      setFormCat(s.category);
      setFormCity(s.city || 'Outros');
      setFormBio(s.bio);
      setFormZap(s.whatsapp);
      setFormLogo(s.imageUrl);
      setFormVerified(s.isVerified);
      setFormAddress(s.address || '');
      setFormMapsUrl(s.mapsUrl || '');
      setFormCnpj(s.cnpj || '');
      setFormRating(s.rating.toString());
      setFormImages(s.images || []);
      setIsModalOpen(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormLogo(url);
    }
  };

  const handleExtraPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormImages([...formImages, url]);
    }
  };

  const handleRemovePhoto = (index: number) => {
      setFormImages(formImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const supplierData = {
        name: formName,
        category: formCat,
        city: formCity,
        imageUrl: formLogo || `https://picsum.photos/200/200?random=${Date.now()}`,
        rating: parseFloat(formRating) || 5.0,
        isVerified: formVerified,
        whatsapp: formZap,
        bio: formBio,
        address: formVerified ? formAddress : '',
        mapsUrl: formVerified ? formMapsUrl : '',
        cnpj: formCnpj,
        images: formImages
    };

    if (isEditing && editingId) {
        updateSupplier(editingId, supplierData);
    } else {
        addSupplier({
            id: Date.now().toString(),
            ...supplierData,
            whatsapp: formZap || '5511999999999',
            images: formImages.length > 0 ? formImages : [`https://picsum.photos/400/400?random=${Date.now()}`]
        });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col mb-8 gap-4">
        <div>
           <h2 className="text-3xl font-bold text-white">Fornecedores</h2>
           <p className="text-gray-400">
                {user?.role === UserRole.ADMIN 
                    ? "Gerencie sua lista de parceiros." 
                    : `Você tem acesso a ${accessibleSuppliers.length} fornecedores.`
                }
           </p>
        </div>
        
        {/* Filters Bar */}
        <div className="bg-dark-surface border border-gray-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                <input
                type="text"
                placeholder="Buscar fornecedor por nome..."
                className="w-full bg-gray-900 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex w-full md:w-auto gap-2">
                <div className="relative w-full md:w-48">
                    <Filter className="absolute left-3 top-3 text-gray-500" size={14} />
                    <select
                        value={selectedCategoryFilter}
                        onChange={e => setSelectedCategoryFilter(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white pl-9 pr-8 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500 appearance-none text-sm"
                    >
                        <option value="">Todas Categorias</option>
                        {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                
                <div className="relative w-full md:w-48">
                    <MapPin className="absolute left-3 top-3 text-gray-500" size={14} />
                    <select
                        value={selectedCityFilter}
                        onChange={e => setSelectedCityFilter(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white pl-9 pr-8 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500 appearance-none text-sm"
                    >
                        <option value="">Todas Cidades</option>
                        {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                </div>
            </div>

            {user?.role === UserRole.ADMIN && (
                <button 
                onClick={handleOpenAdd}
                className="bg-yellow-500 hover:bg-yellow-400 text-black p-2.5 rounded-lg font-bold flex items-center justify-center transition shadow-lg shadow-yellow-500/10 whitespace-nowrap"
                title="Adicionar Fornecedor"
                >
                <Plus size={20} /> <span className="md:hidden ml-2">Novo</span>
                </button>
            )}
        </div>
      </div>

      {filteredSuppliers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map(supplier => (
            <div 
                key={supplier.id}
                onClick={() => navigate(`/suppliers/${supplier.id}`)}
                className="bg-dark-surface border border-gray-800 rounded-xl p-6 hover:border-yellow-500/50 transition cursor-pointer group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-bl-full -mr-10 -mt-10 transition group-hover:bg-yellow-500/20"></div>

                <div className="flex items-start justify-between mb-4 relative z-10">
                    <img src={supplier.imageUrl} alt={supplier.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-700 group-hover:border-yellow-500 transition" />
                    <div className="flex gap-2">
                        {user?.role === UserRole.ADMIN && (
                            <button 
                                onClick={(e) => handleOpenEdit(e, supplier)}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-1.5 rounded-md transition"
                                title="Editar"
                            >
                                <Edit size={14} />
                            </button>
                        )}
                        {supplier.isVerified && (
                            <div className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 h-fit">
                                <ShieldCheck size={12} />
                                <span>Verificado</span>
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-yellow-400 transition">{supplier.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{supplier.category}</p>

                <div className="flex items-center text-xs text-gray-400 space-x-1 mb-4">
                <MapPin size={12} />
                <span>{supplier.city || 'Localização não informada'}</span>
                <span className="mx-1">•</span>
                <span className="text-yellow-500">★ {supplier.rating}</span>
                </div>

                <button className="w-full bg-gray-800 group-hover:bg-gray-700 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center">
                Ver Detalhes
                </button>
            </div>
            ))}
        </div>
      ) : (
          <div className="text-center py-20 bg-dark-surface border border-gray-800 rounded-2xl border-dashed">
              <Lock size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhum Fornecedor Encontrado</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                  Ajuste os filtros ou verifique suas permissões de acesso.
              </p>
          </div>
      )}

      {/* Add/Edit Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-surface border border-gray-800 rounded-2xl w-full max-w-lg p-6 relative animate-fade-in overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6">
                {isEditing ? 'Editar Fornecedor' : 'Cadastrar Fornecedor'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleLogoUpload} 
                   hidden 
                   accept="image/*"
                 />
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border-2 border-dashed border-gray-600 cursor-pointer hover:border-yellow-500 overflow-hidden relative"
                 >
                    {formLogo ? (
                        <img src={formLogo} className="w-full h-full object-cover" />
                    ) : (
                        <Upload size={24} className="text-gray-400" />
                    )}
                 </div>
                 <div className="text-sm text-gray-500">
                    <p className="font-bold text-gray-300">Logo da Loja</p>
                    <p className="text-xs">Clique na imagem para alterar</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs text-gray-400 ml-1">Nome da Loja</label>
                   <input 
                     type="text" 
                     value={formName}
                     onChange={e => setFormName(e.target.value)}
                     className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                     required
                   />
                </div>
                <div>
                   <label className="text-xs text-gray-400 ml-1">Categoria</label>
                   <select 
                     value={formCat}
                     onChange={e => setFormCat(e.target.value)}
                     className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                   >
                       <option value="Moda">Moda</option>
                       <option value="Eletrônicos">Eletrônicos</option>
                       <option value="Acessórios">Acessórios</option>
                       <option value="Variedades">Variedades</option>
                       <option value="Infantil">Infantil</option>
                   </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 ml-1">Cidade / Região</label>
                <select 
                    value={formCity}
                    onChange={e => setFormCity(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                >
                    {COMMON_CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 ml-1">Biografia / Descrição</label>
                <textarea 
                  value={formBio}
                  onChange={e => setFormBio(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 ml-1">WhatsApp</label>
                <input 
                  type="text" 
                  value={formZap}
                  onChange={e => setFormZap(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                />
              </div>
              
              <div>
                  <label className="text-xs text-gray-400 ml-1">CNPJ (Opcional)</label>
                  <input 
                    type="text" 
                    value={formCnpj}
                    onChange={e => setFormCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                  />
              </div>

              {/* Verified Section */}
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                          <ShieldCheck size={16} className={formVerified ? "text-blue-500" : "text-gray-500"}/>
                          Fornecedor Verificado?
                      </span>
                      <div 
                        onClick={() => setFormVerified(!formVerified)}
                        className={`w-10 h-6 rounded-full p-1 cursor-pointer transition ${formVerified ? 'bg-blue-600' : 'bg-gray-600'}`}
                      >
                          <div className={`w-4 h-4 bg-white rounded-full transition transform ${formVerified ? 'translate-x-4' : ''}`}></div>
                      </div>
                  </div>

                  {formVerified && (
                      <div className="space-y-3 mt-3 animate-fade-in">
                          <div>
                            <label className="text-xs text-gray-400 ml-1">Endereço Completo</label>
                            <input 
                                type="text" 
                                value={formAddress}
                                onChange={e => setFormAddress(e.target.value)}
                                placeholder="Rua X, 123 - Bairro, Cidade - UF"
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 ml-1">Link do Google Maps</label>
                            <input 
                                type="text" 
                                value={formMapsUrl}
                                onChange={e => setFormMapsUrl(e.target.value)}
                                placeholder="https://maps.google.com/..."
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 ml-1">Avaliação (1.0 - 5.0)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                max="5"
                                min="1"
                                value={formRating}
                                onChange={e => setFormRating(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                            />
                          </div>
                      </div>
                  )}
              </div>

              {/* Photos Management */}
              <div>
                  <div className="flex justify-between items-center mb-2">
                     <label className="text-xs text-gray-400 ml-1">Galeria de Fotos</label>
                     <button 
                        type="button"
                        onClick={() => extraPhotosRef.current?.click()}
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded flex items-center gap-1"
                     >
                         <Plus size={12}/> Adicionar Foto
                     </button>
                     <input type="file" ref={extraPhotosRef} onChange={handleExtraPhotoUpload} hidden accept="image/*"/>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                      {formImages.map((img, idx) => (
                          <div key={idx} className="aspect-square bg-gray-800 rounded-lg overflow-hidden relative group">
                              <img src={img} className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => handleRemovePhoto(idx)}
                                className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                              >
                                  <Trash2 size={12} />
                              </button>
                          </div>
                      ))}
                      {formImages.length === 0 && (
                          <div className="col-span-4 text-center py-4 text-xs text-gray-500 bg-gray-900 rounded-lg border border-dashed border-gray-700">
                              Nenhuma foto adicionada
                          </div>
                      )}
                  </div>
              </div>

              <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg mt-2">
                {isEditing ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
