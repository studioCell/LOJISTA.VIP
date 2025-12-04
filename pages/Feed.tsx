
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context';
import { Flame, MessageCircle, MoreHorizontal, Plus, X, Image as ImageIcon, Video, Store, Send, ChevronLeft, ChevronRight, Search, ShoppingCart } from 'lucide-react';
import { Offer, UserRole, Story } from '../types';

const OfferCard: React.FC<{ offer: Offer }> = ({ offer }) => {
  const { addHeat, addComment, user } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleHeat = () => {
    addHeat(offer.id);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if(commentText.trim()) {
        addComment(offer.id, commentText);
        setCommentText('');
    }
  };

  // Heat Calculation (Max 50 for full red bar)
  const heatLevel = Math.min(offer.likes, 50);
  const heatPercentage = (heatLevel / 50) * 100;
  
  // Color Transition for Thermometer
  const getThermometerColor = () => {
      if (heatPercentage < 33) return 'from-yellow-500 to-yellow-600';
      if (heatPercentage < 66) return 'from-orange-400 to-orange-600';
      return 'from-red-500 to-red-700 animate-pulse';
  };

  return (
    <div id={`offer-${offer.id}`} className="bg-dark-surface border border-gray-800 rounded-xl mb-6 overflow-hidden shadow-lg animate-fade-in scroll-mt-32">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-lg overflow-hidden border-2 border-yellow-300">
             {/* If supplier has an image, try to match it, otherwise initial */}
             {offer.supplierName[0]}
          </div>
          <div>
            <h3 className="font-bold text-gray-100 text-sm flex items-center gap-1">
                {offer.supplierName} 
            </h3>
            <p className="text-xs text-gray-500">{offer.category} • {offer.timestamp}</p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="relative aspect-video bg-gray-800 group">
        <img src={offer.mediaUrl} alt="Offer" className="w-full h-full object-cover" />
        
        {/* Thermometer Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800/80">
            <div 
                className={`h-full bg-gradient-to-r ${getThermometerColor()} transition-all duration-500 ease-out`} 
                style={{ width: `${heatPercentage}%` }}
            ></div>
        </div>
      </div>

      <div className="p-4">
         {/* Product Title Highlight */}
         {offer.productName && (
             <h2 className="text-xl font-extrabold text-white mb-1 uppercase tracking-tight">
                 {offer.productName}
             </h2>
         )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-6">
            <button 
                onClick={handleHeat}
                className={`flex items-center space-x-1 transition ${offer.likes > 20 ? 'text-red-500' : 'text-gray-400 hover:text-orange-500'}`}
            >
                <Flame size={28} className={offer.likes > 40 ? 'fill-red-500 animate-pulse' : (offer.likes > 0 ? 'fill-current' : '')} />
                <span className="font-bold text-sm">{offer.likes}º</span>
            </button>
            <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition"
            >
                <MessageCircle size={26} />
                <span className="text-sm">{offer.comments?.length || 0}</span>
            </button>
          </div>
          
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              {heatPercentage >= 100 ? <span className="text-red-500 animate-pulse">🔥 SUPER HOT</span> : <span>{offer.likes} Reações</span>}
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-4">
          {offer.description}
        </p>

        {/* Highlighted Footer for Supplier & Price */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 flex items-center justify-between mt-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <Store size={14} className="text-yellow-500"/>
                    <span>Vendido por: <strong className="text-white">{offer.supplierName}</strong></span>
                </div>
                {offer.price && (
                    <span className="text-lg font-bold text-green-400">{offer.price}</span>
                )}
            </div>
            <button 
              onClick={() => window.open(`https://wa.me/${offer.whatsapp}`, '_blank')}
              className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 px-3 rounded-lg transition flex items-center space-x-1"
            >
              <MessageCircle size={14} />
              <span>Chamar no WhatsApp</span>
            </button>
        </div>
        
        {/* Comments Section */}
        {showComments && (
            <div className="mt-4 pt-4 border-t border-gray-800 animate-fade-in">
                <div className="space-y-3 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                    {offer.comments && offer.comments.length > 0 ? (
                        offer.comments.map(comment => (
                            <div key={comment.id} className="flex space-x-2">
                                <img src={comment.userAvatar} className="w-6 h-6 rounded-full bg-gray-700" />
                                <div>
                                    <div className="bg-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300">
                                        <span className="font-bold text-white mr-1">{comment.userName}</span>
                                        {comment.text}
                                    </div>
                                    <span className="text-[10px] text-gray-600 ml-1">{comment.timestamp}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-500 text-center italic">Seja o primeiro a comentar!</p>
                    )}
                </div>
                
                <form onSubmit={handlePostComment} className="flex items-center space-x-2">
                    <input 
                        type="text" 
                        placeholder="Adicione um comentário..." 
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-3 py-1.5 text-xs text-white focus:border-yellow-500 outline-none"
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                    />
                    <button type="submit" className="text-yellow-500 hover:text-yellow-400">
                        <Send size={16} />
                    </button>
                </form>
            </div>
        )}
      </div>
    </div>
  );
};

const Feed: React.FC = () => {
  const { offers, user, addOffer, suppliers, stories, addStory } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storyInputRef = useRef<HTMLInputElement>(null);

  // Story Viewer State
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  // Form State
  const [productName, setProductName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- SEARCH LOGIC ---
  useEffect(() => {
    if (!searchQuery.trim()) {
        setSearchResults([]);
        setCurrentResultIndex(0);
        return;
    }
    // Filter offers where product name includes query
    const results = offers
        .filter(o => o.productName?.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(o => o.id);
    setSearchResults(results);
    setCurrentResultIndex(0);
    
    // Auto scroll to first result
    if (results.length > 0) {
        scrollToOffer(results[0]);
    }
  }, [searchQuery, offers]);

  const handleNextResult = () => {
      if (searchResults.length === 0) return;
      const nextIndex = (currentResultIndex + 1) % searchResults.length;
      setCurrentResultIndex(nextIndex);
      scrollToOffer(searchResults[nextIndex]);
  };

  const handlePrevResult = () => {
      if (searchResults.length === 0) return;
      const prevIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
      setCurrentResultIndex(prevIndex);
      scrollToOffer(searchResults[prevIndex]);
  };

  const handleStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('video') ? 'video' : 'image';
        addStory(url, type);
        alert('Status adicionado!');
    }
  };

  // --- STORY VIEWER LOGIC ---
  const currentStory = viewingStoryIndex !== null ? stories[viewingStoryIndex] : null;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (currentStory) {
        setProgress(0);
        // If it's a video, we wait for onEnded. If image, we set timer.
        if (currentStory.mediaType === 'image') {
            const duration = 5000; // 5 seconds
            const step = 100;
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        handleNextStory();
                        return 0;
                    }
                    return prev + (step / duration) * 100;
                });
            }, step);
        }
    }
    return () => clearInterval(interval);
  }, [currentStory]);

  const handleNextStory = () => {
      if (viewingStoryIndex !== null) {
          if (viewingStoryIndex < stories.length - 1) {
              setViewingStoryIndex(viewingStoryIndex + 1);
          } else {
              setViewingStoryIndex(null); // Close on end
          }
      }
  };

  const handlePrevStory = () => {
      if (viewingStoryIndex !== null) {
          if (viewingStoryIndex > 0) {
              setViewingStoryIndex(viewingStoryIndex - 1);
          } else {
              // Restart current or close? Let's just reset progress
              setProgress(0);
          }
      }
  };

  // Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
      if (touchStartX.current - touchEndX.current > 75) {
          // Swiped Left -> Next
          handleNextStory();
      }
      if (touchStartX.current - touchEndX.current < -75) {
          // Swiped Right -> Prev
          handlePrevStory();
      }
  };


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const supId = e.target.value;
      const supplier = suppliers.find(s => s.id === supId);
      if (supplier) {
          setSupplierName(supplier.name);
          setCategory(supplier.category);
          setWhatsapp(supplier.whatsapp);
      } else {
          setSupplierName('');
          setCategory('');
          setWhatsapp('');
      }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    addOffer({
      id: Date.now().toString(),
      supplierName: supplierName || user?.name || 'Admin',
      productName: productName,
      description: desc,
      mediaUrl: previewUrl || `https://picsum.photos/600/400?random=${Date.now()}`,
      price: price || undefined,
      likes: 0,
      comments: [],
      whatsapp: whatsapp || '5511999999999',
      category: category || 'Geral',
      timestamp: 'Agora mesmo'
    });
    setIsModalOpen(false);
    setProductName('');
    setDesc('');
    setPrice('');
    setCategory('');
    setWhatsapp('');
    setSupplierName('');
    setPreviewUrl(null);
  };

  // Scroll to offer function
  const scrollToOffer = (offerId: string) => {
      const element = document.getElementById(`offer-${offerId}`);
      if (element) {
          // Use scrollIntoView with center block to handle sticky headers better
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Optional: Add highlight flash effect
          element.classList.add('border-yellow-500');
          setTimeout(() => element.classList.remove('border-yellow-500'), 2000);
      }
  };

  return (
    <div className="max-w-xl mx-auto relative pb-20">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Feed de Ofertas</h2>
        
        {user?.role === UserRole.ADMIN && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold flex items-center space-x-2 text-sm transition"
          >
            <Plus size={18} />
            <span>Nova Oferta</span>
          </button>
        )}
      </div>

      {/* Stories / Status Updates */}
      <div className="flex space-x-4 overflow-x-auto pb-4 mb-2 no-scrollbar">
        {/* User's own story ADD */}
        <div className="flex flex-col items-center space-y-1 min-w-[70px]">
             <div 
                className="w-16 h-16 rounded-full p-[2px] bg-gray-700 border-2 border-dark flex items-center justify-center relative cursor-pointer hover:border-gray-500 transition"
                onClick={() => storyInputRef.current?.click()}
             >
                 <img src={user?.avatar || "https://picsum.photos/100"} className="w-full h-full rounded-full object-cover opacity-50" />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Plus size={24} className="text-white bg-blue-500 rounded-full p-1"/>
                 </div>
                 <input 
                    type="file" 
                    hidden 
                    ref={storyInputRef} 
                    accept="video/*,image/*"
                    onChange={handleStoryUpload}
                 />
             </div>
             <span className="text-[10px] text-gray-400">Seu Status</span>
        </div>

        {/* User Stories (Instagram Style - Gradient) */}
        {stories.map((story, index) => (
             <div key={story.id} className="flex flex-col items-center space-y-1 min-w-[70px]">
                <div 
                    onClick={() => setViewingStoryIndex(index)}
                    className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600 cursor-pointer hover:scale-105 transition animate-pulse"
                >
                <div className="w-full h-full rounded-full bg-dark border-2 border-dark overflow-hidden flex items-center justify-center">
                    {story.mediaType === 'video' ? (
                        <video src={story.mediaUrl} className="w-full h-full object-cover" muted />
                    ) : (
                        <img src={story.mediaUrl} className="w-full h-full object-cover" alt="Story" />
                    )}
                </div>
                </div>
                <span className="text-[10px] text-gray-400 truncate w-16 text-center">{story.userName}</span>
            </div>
        ))}

        {/* Admin Offers Stories (Yellow Ring) */}
        {offers.slice(0, 5).map((offer) => (
          <div key={offer.id} className="flex flex-col items-center space-y-1 min-w-[70px]">
            <div 
                onClick={() => scrollToOffer(offer.id)}
                className="w-16 h-16 rounded-full p-[2px] border-[3px] border-yellow-500 cursor-pointer hover:scale-105 transition animate-pulse"
            >
              <div className="w-full h-full rounded-full bg-dark border-2 border-dark overflow-hidden">
                <img src={offer.mediaUrl} className="w-full h-full object-cover" alt="Story" />
              </div>
            </div>
            <span className="text-[10px] text-gray-400 truncate w-16 text-center">{offer.supplierName}</span>
          </div>
        ))}
      </div>

      {/* Search Bar - Smart Search below Stories */}
      <div className="mb-6 relative z-20">
          <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                  type="text" 
                  placeholder="Procurar oferta pelo nome do produto..."
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-10 pr-12 py-3 focus:border-yellow-500 outline-none shadow-lg"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
              />
              
              {/* Navigation Arrows if matches found */}
              {searchResults.length > 0 && (
                  <div className="absolute right-2 top-1.5 flex bg-gray-700 rounded-lg p-0.5">
                      <button 
                        onClick={handlePrevResult}
                        className="p-1.5 hover:text-yellow-400 text-gray-300"
                      >
                          <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs text-gray-400 flex items-center px-1">
                          {currentResultIndex + 1}/{searchResults.length}
                      </span>
                      <button 
                        onClick={handleNextResult}
                        className="p-1.5 hover:text-yellow-400 text-gray-300"
                      >
                          <ChevronRight size={16} />
                      </button>
                  </div>
              )}
          </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {offers.map(offer => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
        {offers.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            Nenhuma oferta disponível no momento.
          </div>
        )}
      </div>

      {/* FULL SCREEN STORY VIEWER OVERLAY */}
      {viewingStoryIndex !== null && currentStory && (
          <div 
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
              {/* Progress Bar */}
              <div className="flex space-x-1 p-2 pt-4 absolute top-0 left-0 right-0 z-20 w-full max-w-md mx-auto">
                  {stories.map((_, idx) => (
                      <div key={idx} className="h-1 bg-gray-600 rounded-full flex-1 overflow-hidden">
                          {idx < viewingStoryIndex && <div className="h-full w-full bg-white"></div>}
                          {idx === viewingStoryIndex && <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>}
                      </div>
                  ))}
              </div>

              {/* Header Info */}
              <div className="absolute top-8 left-4 z-20 flex items-center space-x-3 w-full max-w-md mx-auto">
                  <img src={currentStory.userAvatar} className="w-10 h-10 rounded-full border border-gray-500" />
                  <div>
                      <p className="text-white font-bold text-sm shadow-black drop-shadow-md">{currentStory.userName}</p>
                      <p className="text-xs text-gray-300 shadow-black drop-shadow-md">{currentStory.timestamp}</p>
                  </div>
              </div>

              {/* Close Button */}
              <button 
                  onClick={() => setViewingStoryIndex(null)}
                  className="absolute top-8 right-4 z-30 text-white p-2 rounded-full bg-black/20"
              >
                  <X size={24} />
              </button>

              {/* Navigation Hit Areas (Invisible) */}
              <div className="absolute inset-y-0 left-0 w-1/4 z-10" onClick={handlePrevStory}></div>
              <div className="absolute inset-y-0 right-0 w-1/4 z-10" onClick={handleNextStory}></div>

              {/* Main Media Container with 9:16 Aspect Ratio */}
              <div className="relative w-full h-full max-w-md flex items-center justify-center bg-black">
                  <div className="w-full aspect-[9/16] relative bg-gray-900 overflow-hidden flex items-center justify-center">
                    {currentStory.mediaType === 'video' ? (
                        <video 
                            src={currentStory.mediaUrl} 
                            className="w-full h-full object-cover" 
                            autoPlay 
                            playsInline
                            onEnded={handleNextStory}
                        />
                    ) : (
                        <img src={currentStory.mediaUrl} className="w-full h-full object-cover" />
                    )}
                  </div>
              </div>

              {/* Footer Interaction (Optional) */}
              <div className="absolute bottom-4 left-0 right-0 p-4 z-20 flex items-center space-x-3 w-full max-w-md mx-auto">
                   <input type="text" placeholder="Responder story..." className="flex-1 bg-transparent border border-white/50 rounded-full px-4 py-2 text-white placeholder-white/70 focus:outline-none" />
                   <button className="text-white"><Send size={24} /></button>
              </div>
          </div>
      )}

      {/* Modal - Create Offer */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-surface border border-gray-800 rounded-2xl w-full max-w-md p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6">Criar Nova Oferta</h3>
            
            <form onSubmit={handlePublish} className="space-y-4">
              
              {/* Supplier Select */}
              <div>
                  <label className="text-xs text-gray-400 ml-1">Selecionar Fornecedor</label>
                  <select 
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                    onChange={handleSupplierChange}
                    required
                    defaultValue=""
                  >
                      <option value="" disabled>Escolha o fornecedor...</option>
                      {suppliers.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                      <option value="admin">Postar como Admin (Lojista VIP)</option>
                  </select>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`bg-gray-800 border-2 border-dashed ${previewUrl ? 'border-yellow-500 p-0' : 'border-gray-700 p-6'} rounded-xl h-48 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-yellow-500 transition relative overflow-hidden`}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                      <p className="text-white font-bold">Trocar Foto</p>
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-xs">Clique para carregar foto</span>
                  </>
                )}
              </div>

              {/* Product Name Input */}
              <div>
                <label className="text-xs text-gray-400 ml-1">Nome do Produto (Destaque)</label>
                <div className="relative">
                    <ShoppingCart className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input 
                    type="text" 
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-3 py-3 text-white focus:border-yellow-500 outline-none font-bold"
                    placeholder="Ex: Jaqueta Jeans Premium"
                    required
                    />
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 ml-1">Descrição</label>
                <textarea 
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                  rows={3}
                  placeholder="Descreva o produto..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-gray-400 ml-1">Preço</label>
                    <input 
                      type="text" 
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                      placeholder="R$ 0,00"
                    />
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 ml-1">Categoria (Automático)</label>
                    <input 
                      type="text" 
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                      placeholder="Categoria"
                      required
                    />
                 </div>
              </div>
              
              <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg mt-2">
                Publicar no Feed
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
