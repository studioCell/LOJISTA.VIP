import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Users, Image as ImageIcon, Headphones } from 'lucide-react';
import { useApp } from '../context';
import { UserRole } from '../types';

const Chat: React.FC = () => {
  const { user, communityMessages, privateMessages, sendCommunityMessage, sendPrivateMessage } = useApp();
  
  // Channels: 'community' | 'support' (for regular user) | specific userId (for admin)
  const [activeChannel, setActiveChannel] = useState<string>('community'); 
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === UserRole.ADMIN;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [communityMessages, privateMessages, activeChannel]);

  // For Admin: Get list of users who have messaged support
  const supportUsers = React.useMemo(() => {
     const users = new Map();
     privateMessages.forEach(msg => {
        // If msg channelId exists, it tracks the user conversation
        if (msg.channelId) {
            // We want the name of the OTHER person, not the admin
            const isMe = msg.senderId === user?.id;
            const otherName = isMe ? 'Usuário' : msg.senderName; 
            const otherAvatar = isMe ? 'https://picsum.photos/100' : msg.senderAvatar;
            
            // Just use the channelId (which is the userId) as the key
            if(!users.has(msg.channelId)) {
                users.set(msg.channelId, {
                    id: msg.channelId,
                    name: msg.senderName === 'Mateus Hugo (Admin)' ? 'Usuário' : msg.senderName, // Very rough fallback
                    avatar: msg.senderAvatar,
                    lastMessage: msg.text
                });
            } else {
                 // Update last message
                 users.set(msg.channelId, {
                    ...users.get(msg.channelId),
                    lastMessage: msg.text
                 });
            }
        }
     });
     
     // If I am admin, I need to see users even if I haven't replied yet, 
     // but the channelID logic covers it because channelId = userId.
     
     // Quick fix for Admin name showing up in list if admin sent first (unlikely in support, but possible)
     // Ideally we fetch user details from a user list, but we are mocking.
     // Let's rely on the mock data structure where channelId = userId.
     return Array.from(users.values());
  }, [privateMessages, user]);


  const handleSend = () => {
    if (inputText.trim() === '') return;
    
    if (activeChannel === 'community') {
        sendCommunityMessage(inputText);
    } else {
        // Sending Private Message
        // If I am User: target is ME (because channel ID for support is my ID)
        // If I am Admin: target is activeChannel (which is the User ID I am viewing)
        const targetId = isAdmin ? activeChannel : user?.id || '';
        if(targetId) {
            sendPrivateMessage(inputText, targetId);
        }
    }
    setInputText('');
  };

  const handleSendImage = () => {
      if (activeChannel === 'community') {
          sendCommunityMessage("Olhem essa foto!", `https://picsum.photos/400/300?random=${Date.now()}`);
      } else {
           const targetId = isAdmin ? activeChannel : user?.id || '';
           if(targetId) {
                sendPrivateMessage("Enviei um anexo.", targetId, `https://picsum.photos/400/300?random=${Date.now()}`);
           }
      }
  };

  // Determine which messages to show
  const displayMessages = activeChannel === 'community' 
    ? communityMessages 
    : privateMessages.filter(m => m.channelId === (isAdmin ? activeChannel : user?.id));

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-64px)] flex rounded-xl border border-gray-800 overflow-hidden bg-dark-surface">
      {/* Sidebar List */}
      <div className="w-20 md:w-80 border-r border-gray-800 flex flex-col bg-dark-surface">
         <div className="p-4 border-b border-gray-800 hidden md:block">
           <h2 className="font-bold text-white">Mensagens</h2>
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Community Channel */}
            <div 
                onClick={() => setActiveChannel('community')}
                className={`p-4 flex items-center space-x-3 cursor-pointer border-b border-gray-800/50 transition ${activeChannel === 'community' ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
            >
                 <div className="relative">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shrink-0">
                     <Users size={20} />
                   </div>
                 </div>
                 <div className="hidden md:block flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                       <h3 className="text-sm font-bold text-gray-200 truncate">Comunidade Lojista</h3>
                    </div>
                    <p className="text-xs text-gray-500 truncate">Grupo Oficial</p>
                 </div>
            </div>

            {/* Separator / Header */}
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 mt-4 text-xs font-bold text-gray-500 uppercase">
                <Headphones size={12} />
                <span>{isAdmin ? 'Atendimentos' : 'Suporte'}</span>
            </div>

            {/* Support Channels Logic */}
            {isAdmin ? (
                // ADMIN VIEW: List of Users
                <>
                    {supportUsers.map((u: any) => (
                        <div 
                            key={u.id}
                            onClick={() => setActiveChannel(u.id)}
                            className={`p-4 flex items-center space-x-3 cursor-pointer border-b border-gray-800/50 transition ${activeChannel === u.id ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
                        >
                             <div className="relative">
                               <img src={u.avatar} className="w-10 h-10 rounded-full bg-gray-700 object-cover" />
                               {/* Online indicator mock */}
                               <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-surface"></div>
                             </div>
                             <div className="hidden md:block flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                   <h3 className="text-sm font-bold text-gray-200 truncate">{u.name}</h3>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{u.lastMessage}</p>
                             </div>
                        </div>
                    ))}
                    {supportUsers.length === 0 && (
                        <div className="p-4 text-xs text-gray-600 text-center italic">
                            Nenhum chamado aberto.
                        </div>
                    )}
                </>
            ) : (
                // USER VIEW: Single Support Channel
                <div 
                    onClick={() => setActiveChannel('support')}
                    className={`p-4 flex items-center space-x-3 cursor-pointer border-b border-gray-800/50 transition ${activeChannel === 'support' ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
                >
                     <div className="relative">
                       <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black shrink-0">
                         <Headphones size={20} />
                       </div>
                     </div>
                     <div className="hidden md:block flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                           <h3 className="text-sm font-bold text-gray-200 truncate">Fale com o Admin</h3>
                        </div>
                        <p className="text-xs text-gray-500 truncate">Atendimento Privado</p>
                     </div>
                </div>
            )}
         </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-black/20 relative">
         {/* Chat Header */}
         <div className="p-4 border-b border-gray-800 flex items-center space-x-3 bg-dark-surface">
            {activeChannel === 'community' ? (
                <>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white"><Users size={16}/></div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Comunidade Lojista VIP</h3>
                        <p className="text-xs text-gray-400">{communityMessages.length} mensagens</p>
                    </div>
                </>
            ) : (
                // Private Header
                <>
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold">
                        {isAdmin ? <User size={16}/> : <Headphones size={16}/>}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">
                            {isAdmin 
                                ? supportUsers.find((u:any) => u.id === activeChannel)?.name || 'Atendimento' 
                                : 'Suporte Lojista VIP'
                            }
                        </h3>
                        <p className="text-xs text-green-500">
                             {isAdmin ? 'Visualizando conversa' : 'Online agora'}
                        </p>
                    </div>
                </>
            )}
         </div>

         {/* Messages List */}
         <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
            {displayMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                    <Headphones size={48} className="mb-2"/>
                    <p className="text-sm">Inicie a conversa...</p>
                </div>
            )}
            
            {displayMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                    {!msg.isMine && (
                        <img src={msg.senderAvatar || 'https://picsum.photos/50'} className="w-8 h-8 rounded-full mr-2 mt-1 bg-gray-700 object-cover" alt={msg.senderName}/>
                    )}
                    <div className={`max-w-[80%] md:max-w-[60%] flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                        {!msg.isMine && <span className="text-[10px] text-gray-500 mb-1 ml-1">{msg.senderName}</span>}
                        <div className={`p-3 rounded-xl text-sm ${msg.isMine ? 'bg-yellow-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none'}`}>
                            {msg.text}
                            {msg.imageUrl && (
                                <img src={msg.imageUrl} alt="Anexo" className="mt-2 rounded-lg w-full max-h-60 object-cover" />
                            )}
                        </div>
                        <span className="text-[9px] text-gray-600 mt-1">{msg.timestamp}</span>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
         </div>

         {/* Input Area */}
         <div className="p-4 bg-dark-surface border-t border-gray-800">
            <div className="flex items-center space-x-2">
               <button 
                onClick={handleSendImage}
                title="Enviar Foto (Simulação)"
                className="p-2.5 rounded-full bg-gray-800 text-gray-400 hover:text-yellow-400 transition"
               >
                   <ImageIcon size={20} />
               </button>
               <input 
                 type="text" 
                 placeholder={activeChannel === 'community' ? "Converse com a comunidade..." : "Escreva sua mensagem..."}
                 className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-full px-4 py-2.5 focus:outline-none focus:border-yellow-500 transition text-sm"
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               />
               <button 
                 onClick={handleSend}
                 className="bg-yellow-500 hover:bg-yellow-400 text-black p-2.5 rounded-full transition transform hover:scale-105"
               >
                 <Send size={18} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Chat;