
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  authService, 
  visitorService, 
  newsService, 
  galleryService, 
  teacherService, 
  agendaService, 
  eskulService, 
  telegramService, 
  settingsService,
  suggestionService
} from '../services/supabaseService';
import { NewsItem, GalleryItem, Teacher, AgendaItem, Eskul, TelegramInbox, SiteSettings, Suggestion } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [stats, setStats] = useState({ visitors: 0, news: 0, gallery: 0 });
  const [news, setNews] = useState<NewsItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [eskul, setEskul] = useState<Eskul[]>([]);
  const [teleInbox, setTeleInbox] = useState<TelegramInbox[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // UI States for Settings
  const [showToken, setShowToken] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadAllData();
  }, [navigate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [vCount, n, g, t, a, e, i, sug, s] = await Promise.all([
        visitorService.getOnlineCount(),
        newsService.getAll(),
        galleryService.getAll(),
        teacherService.getAll(),
        agendaService.getAll(),
        eskulService.getAll(),
        telegramService.getInbox(),
        suggestionService.getAll(),
        settingsService.get()
      ]);

      setStats({ visitors: vCount, news: n.length, gallery: g.length });
      setNews(n);
      setGallery(g);
      setTeachers(t);
      setAgenda(a);
      setEskul(e);
      setTeleInbox(i);
      setSuggestions(sug);
      setSettings(s);
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeleInbox = async () => {
     const inbox = await telegramService.getInbox();
     setTeleInbox(inbox);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/admin');
  };

  // --- Handlers for Settings ---
  const handleSaveSettings = async () => {
    if(!settings) return;
    setIsSaving(true);
    try {
        await settingsService.update(settings);
        alert("Pengaturan berhasil disimpan!");
    } catch(e) {
        alert("Gagal menyimpan pengaturan.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleConnectBot = async () => {
      if (!settings?.telegram_bot_token) {
          alert("Token Bot belum diisi!");
          return;
      }
      
      setIsConnecting(true);
      try {
          const domain = window.location.origin;
          const webhookUrl = `${domain}/api/bot`;
          const apiUri = `https://api.telegram.org/bot${settings.telegram_bot_token}/setWebhook?url=${webhookUrl}`;
          
          const res = await fetch(apiUri);
          const data = await res.json();
          
          if (data.ok) {
              await settingsService.update(settings);
              // Coba kirim pesan tes
              await telegramService.sendNotification("<b>✅ S2 CONSOLE CONNECTED!</b>\n\nSistem admin telah berhasil terhubung dengan Bot Telegram ini.");
              alert("KONEKSI BERHASIL! Bot telah dihubungkan.");
          } else {
              alert("Gagal menghubungkan: " + data.description);
          }
      } catch (err) {
          alert("Kesalahan koneksi ke API Telegram.");
      } finally {
          setIsConnecting(false);
      }
  };

  // --- Handlers for Inbox/Content ---

  const handlePublishToAll = async (item: TelegramInbox) => {
    if(!confirm("Posting ke Berita & Galeri?")) return;
    
    // 1. Add to News
    await newsService.create({
        title: `Kiriman dari ${item.sender_name}`,
        content: item.message_text,
        author: item.sender_name,
        image_url: item.image_url || 'https://via.placeholder.com/800x600?text=No+Image'
    });

    // 2. Add to Gallery if image exists
    if(item.image_url) {
        await galleryService.add({
            title: item.message_text.substring(0, 50),
            image_url: item.image_url,
            author: item.sender_name
        });
    }

    // 3. Update status or delete
    await telegramService.deleteInboxItem(item.id);
    loadAllData();
    alert("Berhasil dipublikasikan!");
  };

  const handlePostFromInbox = async (item: TelegramInbox, type: 'news' | 'gallery') => {
    if (type === 'news') {
        const title = prompt("Judul Berita:", `Update dari ${item.sender_name}`);
        if(!title) return;
        
        await newsService.create({
            title,
            content: item.message_text,
            author: item.sender_name,
            image_url: item.image_url || 'https://via.placeholder.com/800x600?text=News'
        });
    } else {
        if(!item.image_url) {
            alert("Tidak ada gambar untuk galeri.");
            return;
        }
        await galleryService.add({
            title: item.message_text.substring(0, 50) || `Galeri oleh ${item.sender_name}`,
            image_url: item.image_url,
            author: item.sender_name
        });
    }
    
    await telegramService.deleteInboxItem(item.id);
    loadAllData();
    alert(`Berhasil diposting ke ${type}!`);
  };

  const handleDeleteSuggestion = async (id: string) => {
    if(confirm("Hapus masukan ini?")) {
      await suggestionService.delete(id);
      loadAllData();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white fixed h-full overflow-y-auto hidden md:block z-50">
        <div className="p-6">
           <h2 className="text-2xl font-black mb-1">Admin Panel</h2>
           <p className="text-[10px] text-slate-400 uppercase tracking-widest">SMKN 2 Tembilahan</p>
        </div>
        <nav className="mt-6 px-4 space-y-2">
            {[
                { id: 'dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
                { id: 'news', icon: 'fa-newspaper', label: 'Berita' },
                { id: 'gallery', icon: 'fa-images', label: 'Galeri' },
                { id: 'teachers', icon: 'fa-chalkboard-user', label: 'Guru' },
                { id: 'agenda', icon: 'fa-calendar-days', label: 'Agenda' },
                { id: 'eskul', icon: 'fa-basketball', label: 'Eskul' },
                { id: 'tele_inbox', icon: 'fa-telegram', label: 'Inbox Telegram', badge: teleInbox.length },
                { id: 'suggestions', icon: 'fa-box-open', label: 'Kotak Saran', badge: suggestions.length },
                { id: 'settings', icon: 'fa-gear', label: 'Pengaturan' },
            ].map(menu => (
                <button 
                    key={menu.id}
                    onClick={() => setActiveTab(menu.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === menu.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <div className="flex items-center gap-3">
                        <i className={`fa-solid ${menu.icon} w-5`}></i>
                        {menu.label}
                    </div>
                    {menu.badge ? <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{menu.badge}</span> : null}
                </button>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-900/20 mt-8">
                <i className="fa-solid fa-right-from-bracket w-5"></i> Logout
            </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 flex-1 p-8 pt-24 md:pt-8">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{activeTab.replace('_', ' ')}</h1>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-900">{authService.getCurrentUser()?.name}</p>
                    <p className="text-xs text-slate-500">{authService.getCurrentUser()?.role}</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">
                    {authService.getCurrentUser()?.name.charAt(0)}
                </div>
            </div>
        </header>

        {activeTab === 'dashboard' ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-zoom-in">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-users text-6xl text-slate-900"></i>
                    </div>
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Pengunjung</div>
                    <div className="text-4xl font-black text-slate-900">{stats.visitors}</div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-newspaper text-6xl text-blue-600"></i>
                    </div>
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Artikel Berita</div>
                    <div className="text-4xl font-black text-blue-600">{stats.news}</div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-images text-6xl text-purple-600"></i>
                    </div>
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Foto Galeri</div>
                    <div className="text-4xl font-black text-purple-600">{stats.gallery}</div>
                </div>
             </div>
        ) : activeTab === 'settings' ? (
             <div className="max-w-4xl mx-auto space-y-8 animate-zoom-in">
                <div className="bg-white p-8 sm:p-12 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
                   {/* Header */}
                   <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center text-2xl shadow-xl shadow-blue-200"><i className="fa-solid fa-robot"></i></div>
                      <div>
                         <h3 className="text-2xl font-black tracking-tighter text-slate-900">Bot Configuration</h3>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: {settings?.telegram_bot_token ? <span className="text-emerald-500">Ready to Connect</span> : <span className="text-rose-500">Not Configured</span>}</p>
                      </div>
                   </div>
                   
                   {/* Form */}
                   <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telegram Bot Token</label>
                           <div className="relative">
                                <input 
                                    type={showToken ? "text" : "password"} 
                                    value={settings?.telegram_bot_token || ''} 
                                    onChange={e => setSettings({...settings!, telegram_bot_token: e.target.value})} 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
                                    placeholder="123456789:ABCdefGHIjkl..."
                                />
                                <button 
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                                >
                                    <i className={`fa-solid ${showToken ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                           </div>
                           <p className="text-[10px] text-slate-400 ml-1 leading-relaxed">
                               Dapatkan token ini dengan membuat bot baru di <b>@BotFather</b> pada Telegram. Token diperlukan agar website bisa mengirim notifikasi.
                           </p>
                       </div>
                       <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Chat ID</label>
                           <input 
                                type="text" 
                                value={settings?.telegram_chat_id || ''} 
                                onChange={e => setSettings({...settings!, telegram_chat_id: e.target.value})} 
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
                                placeholder="Misal: 123456789"
                            />
                            <p className="text-[10px] text-slate-400 ml-1 leading-relaxed">
                               ID chat admin atau channel tempat bot akan mengirim laporan. Gunakan <b>@userinfobot</b> untuk mengetahui ID Anda.
                           </p>
                       </div>
                   </div>

                   {/* Actions */}
                   <div className="flex flex-col sm:flex-row gap-4">
                      <button onClick={handleSaveSettings} disabled={isSaving} className="flex-1 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-70">
                        {isSaving ? "MENYIMPAN..." : "SIMPAN KONFIGURASI"}
                      </button>
                      <button onClick={handleConnectBot} disabled={isConnecting || !settings?.telegram_bot_token} className="flex-[2] py-6 bg-blue-600 text-white rounded-[2rem] font-black text-sm tracking-widest shadow-2xl hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                          {isConnecting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <i className="fa-brands fa-telegram text-lg"></i>}
                          {isConnecting ? "MENGHUBUNGKAN..." : "TEST & HUBUNGKAN BOT"}
                      </button>
                   </div>
                </div>

                {/* Additional General Settings Block */}
                <div className="bg-white p-8 sm:p-12 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center text-xl"><i className="fa-solid fa-bullhorn"></i></div>
                        <h3 className="text-xl font-black text-slate-900">Pengaturan Umum</h3>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Running Text (Info Bar)</label>
                        <input type="text" value={settings?.running_text || ''} onChange={e => setSettings({...settings!, running_text: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs focus:border-blue-600 outline-none" placeholder="Info terbaru..." />
                     </div>
                     <button onClick={handleSaveSettings} className="w-full py-4 bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200">Update Info Umum</button>
                </div>
             </div>
        ) : activeTab === 'suggestions' ? (
            <div className="grid md:grid-cols-2 gap-6 animate-zoom-in">
              {suggestions.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 mx-auto text-slate-300 text-2xl">
                      <i className="fa-solid fa-box-open"></i>
                   </div>
                   <p className="font-bold text-slate-400">Belum ada saran masuk.</p>
                </div>
              ) : (
                suggestions.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 inline-block ${
                             item.type === 'Saran Fitur' ? 'bg-emerald-100 text-emerald-600' :
                             item.type === 'Pertanyaan' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                           }`}>
                             {item.type}
                           </span>
                           <h4 className="font-bold text-slate-900">{item.name || 'Anonim'}</h4>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                     </div>
                     <p className="text-sm text-slate-600 mb-6 flex-grow leading-relaxed bg-slate-50 p-4 rounded-xl">"{item.content}"</p>
                     <button onClick={() => handleDeleteSuggestion(item.id)} className="w-full py-3 bg-white border border-rose-200 text-rose-500 rounded-xl font-bold text-xs hover:bg-rose-50 transition-all">
                        <i className="fa-solid fa-trash-can mr-2"></i> Hapus
                     </button>
                  </div>
                ))
              )}
            </div>
        ) : activeTab === 'tele_inbox' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-zoom-in">
              {teleInbox.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <i className="fa-solid fa-inbox text-slate-300 text-3xl"></i>
                   </div>
                   <h3 className="text-lg font-black text-slate-900 mb-2">Inbox Kosong?</h3>
                   <p className="font-medium text-xs text-slate-400 max-w-sm mx-auto">Pastikan bot Telegram sudah aktif dan mengirim pesan.</p>
                </div>
              ) : (
                teleInbox.map(item => (
                  <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col hover:shadow-xl transition-all">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><i className="fa-brands fa-telegram"></i></div>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{item.sender_name}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                     
                     {item.image_url ? (
                        <div className="relative h-48 mb-6 rounded-2xl overflow-hidden group bg-slate-100 border border-slate-100">
                            <img 
                              src={item.image_url} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                              alt="Attachment" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                (e.target as HTMLImageElement).nextElementSibling?.classList.add('flex');
                              }}
                            />
                            {/* Placeholder for Broken Image / Loading Error */}
                            <div className="hidden absolute inset-0 flex-col items-center justify-center text-slate-400 bg-slate-100 h-full w-full">
                               <i className="fa-solid fa-image-slash text-3xl mb-2"></i>
                               <span className="text-[10px] font-black uppercase tracking-widest">Preview Unavailable</span>
                            </div>

                            {/* Hover Overlay */}
                            <a 
                              href={item.image_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                            >
                               <div className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-xl text-xs font-black uppercase tracking-widest border border-white/30 hover:bg-white/40 transition-colors flex items-center gap-2 cursor-pointer">
                                  <i className="fa-solid fa-expand"></i> Lihat Foto
                               </div>
                            </a>
                        </div>
                     ) : (
                        (item.raw_data?.message?.photo || item.raw_data?.message?.document) && (
                           <div className="h-48 mb-6 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
                              <i className="fa-regular fa-images text-3xl mb-2"></i>
                              <span className="text-[10px] font-black uppercase tracking-widest">Lampiran Media</span>
                           </div>
                        )
                     )}

                     <p className="text-sm font-bold text-slate-700 mb-6 line-clamp-4 flex-grow">"{item.message_text}"</p>
                     
                     <div className="mt-auto space-y-2">
                        <button onClick={() => handlePublishToAll(item)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Post to All</button>
                        <div className="flex gap-2">
                            <button onClick={() => handlePostFromInbox(item, 'news')} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Berita</button>
                            <button onClick={() => handlePostFromInbox(item, 'gallery')} className="flex-1 py-3 bg-sky-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all">Galeri</button>
                        </div>
                        <button onClick={() => telegramService.deleteInboxItem(item.id).then(loadTeleInbox)} className="w-full py-2 text-rose-500 font-bold text-[10px] uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all">Hapus Pesan</button>
                     </div>
                  </div>
                ))
              )}
            </div>
        ) : (
            <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100 animate-zoom-in">
                <i className="fa-solid fa-person-digging text-4xl text-slate-300 mb-6"></i>
                <h3 className="text-xl font-black text-slate-900 mb-2">Fitur {activeTab}</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm">Modul manajemen ini sedang dalam tahap pengembangan. Silakan gunakan menu lain.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
