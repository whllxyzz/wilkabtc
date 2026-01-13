
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatService, authService, visitorService } from '../services/supabaseService';
import { ChatMessage, User } from '../types';

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/admin'); // Redirect ke login jika belum ada akun
      return;
    }
    setCurrentUser(user);
    loadInitialData();

    // Polling untuk update pesan & online count
    const interval = setInterval(() => {
      refreshData();
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadInitialData = async () => {
    try {
      const [msgs, count] = await Promise.all([
        chatService.getAll(),
        visitorService.getOnlineCount()
      ]);
      setMessages(msgs);
      setOnlineCount(count);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const [msgs, count] = await Promise.all([
        chatService.getAll(),
        visitorService.getOnlineCount()
      ]);
      setMessages(msgs);
      setOnlineCount(count);
    } catch (err) {}
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    const msgText = inputText.trim();
    setInputText('');

    try {
      const newMsg = await chatService.send({
        user_id: currentUser.id,
        user_name: currentUser.name,
        message: msgText
      });
      setMessages(prev => [...prev, newMsg]);
    } catch (err) {
      alert("Gagal mengirim pesan.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] pt-24 pb-12 flex flex-col px-4">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-[75vh]">
        {/* Chat Header */}
        <div className="bg-blue-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md shadow-inner">
              <i className="fa-solid fa-comments text-xl"></i>
            </div>
            <div>
              <h1 className="text-white font-black uppercase tracking-widest text-sm">S2 Community Chat</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                <span className="text-[10px] text-blue-100 font-bold uppercase tracking-tighter">{onlineCount} People Online</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block bg-blue-700/50 px-4 py-2 rounded-2xl border border-blue-500/30">
            <p className="text-[8px] text-blue-200 font-black uppercase tracking-widest leading-none mb-1">Authenticated As</p>
            <p className="text-white font-black text-xs">{currentUser?.name}</p>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-bold text-[10px] uppercase tracking-widest">Memasuki Ruang Obrolan...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
               <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                 <i className="fa-solid fa-wind text-3xl opacity-20"></i>
               </div>
               <p className="font-bold text-xs uppercase tracking-widest">Belum ada percakapan. Mulailah menyapa!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.user_id === currentUser?.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  {/* Nama User di Atas Bubble */}
                  <div className={`flex items-center gap-2 mb-1.5 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isOwn ? 'text-blue-600' : 'text-slate-500'}`}>
                      {msg.user_name}
                    </span>
                    <span className="text-[9px] font-bold text-slate-300">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {/* Bubble Chat */}
                  <div className={`max-w-[85%] px-6 py-3.5 rounded-3xl text-sm font-medium leading-relaxed shadow-sm transition-all hover:shadow-md ${
                    isOwn 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tulis pesan anda..."
            className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-slate-300"
          />
          <button 
            type="submit" 
            className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>
      
      <div className="max-w-4xl w-full mx-auto mt-6 flex flex-col sm:flex-row justify-between items-center px-4 gap-4">
        <div className="flex gap-4">
           <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
             <i className="fa-solid fa-circle-info text-blue-600 text-[10px]"></i>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public School Network</span>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">© 2026 • SMKN 2 TEMBILAHAN</span>
           <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">WilkaXyz Console</span>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
