
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
  suggestionService,
  departmentService,
  achievementService,
  storageService,
  getSystemStatus
} from '../services/supabaseService';
import { generateNewsContent } from '../services/geminiService';
import { NewsItem, GalleryItem, Teacher, AgendaItem, Eskul, TelegramInbox, SiteSettings, Suggestion, Department, User, Achievement } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  // Data States
  const [stats, setStats] = useState({ visitors: 0, news: 0, gallery: 0 });
  const [news, setNews] = useState<NewsItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [teleInbox, setTeleInbox] = useState<TelegramInbox[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [eskul, setEskul] = useState<Eskul[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<string>(''); 
  const [editingItem, setEditingItem] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [openSection, setOpenSection] = useState<string>('identity');
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<any>({ 
    title: '', content: '', image_url: '', 
    name: '', description: '', icon: 'fa-graduation-cap',
    schedule: '', date: '', location: ''
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/admin');
      return;
    }
    setCurrentUser(user);
    setIsOnline(getSystemStatus());
    loadAllData();

    const interval = setInterval(() => loadAllData(false), 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAllData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [vCount, n, g, i, sug, s, u, e, a, m] = await Promise.all([
        visitorService.getOnlineCount(),
        newsService.getAll(),
        galleryService.getAll(),
        telegramService.getInbox(),
        suggestionService.getAll(),
        settingsService.get(),
        authService.getAllUsers(),
        eskulService.getAll(),
        agendaService.getAll(),
        storageService.list()
      ]);

      setStats({ visitors: vCount, news: n.length, gallery: g.length });
      setNews(n);
      setGallery(g);
      setTeleInbox(i);
      setSuggestions(sug);
      setSettings(s);
      setUsers(u);
      setEskul(e);
      setAgenda(a);
      setMediaFiles(m);
      setIsOnline(getSystemStatus());
    } catch (error) {
      console.error("Sync Error", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: 'fa-gauge-high', label: 'Dashboard', roles: ['admin', 'user'] },
    { id: 'news', icon: 'fa-newspaper', label: 'Berita', roles: ['admin', 'user'] },
    { id: 'gallery', icon: 'fa-images', label: 'Galeri', roles: ['admin', 'user'] },
    { id: 'media', icon: 'fa-photo-film', label: 'Media Library', roles: ['admin'] },
    { id: 'agenda', icon: 'fa-calendar-days', label: 'Agenda', roles: ['admin', 'user'] },
    { id: 'eskul', icon: 'fa-basketball', label: 'Eskul', roles: ['admin', 'user'] },
    { id: 'tele_inbox', icon: 'fa-telegram', label: 'Bot Inbox', roles: ['admin'], badge: teleInbox.length },
    { id: 'suggestions', icon: 'fa-box-archive', label: 'Kotak Saran', roles: ['admin'], badge: suggestions.length },
    { id: 'users', icon: 'fa-users-gear', label: 'Users', roles: ['admin'] },
    { id: 'settings', icon: 'fa-gear', label: 'Settings', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(currentUser?.role || ''));

  const handleOpenModal = (item: any = null, type: string | null = null) => {
    const targetType = type || activeTab;
    setFormType(targetType);
    setIsModalOpen(true);
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({ title: '', content: '', image_url: '', name: '', description: '', icon: 'fa-graduation-cap', schedule: '', date: '', location: '' });
    }
  };

  const handleFetchNews = async () => {
    setIsFetching(true);
    try {
      // Simulate fetching from an external source by generating content via AI
      const topic = "Inovasi Teknologi Pendidikan SMK Indonesia Terbaru";
      const content = await generateNewsContent(topic);
      
      const newItem = {
        title: "Global Tech: " + topic,
        content: content,
        author: "News Aggregator",
        image_url: "https://images.unsplash.com/photo-1504384308090-c54be3855833", 
        created_at: new Date().toISOString()
      };
      
      await newsService.create(newItem);
      loadAllData(false);
      showToast("Berita eksternal berhasil diambil!");
    } catch (err) {
      showToast("Gagal mengambil berita.", "error");
    } finally {
      setIsFetching(false);
    }
  };

  const handlePublishInboxItem = async (item: TelegramInbox) => {
    if(!confirm("Publikasikan pesan ini sebagai berita sekolah dan kirim ke Channel Telegram?")) return;
    setIsSaving(true);
    
    try {
        // 1. Create News Item
        const newNewsItem = {
            title: `Kiriman dari ${item.sender_name}`,
            content: item.message_text,
            author: item.sender_name,
            image_url: item.image_url || 'https://images.unsplash.com/photo-1557683316-973673baf926',
            created_at: new Date().toISOString()
        };
        await newsService.create(newNewsItem);

        // 2. Post to Telegram Channel (if configured)
        if (settings?.telegram_bot_token && settings?.telegram_channel_id) {
            const caption = `📢 <b>INFO TERBARU</b>\n\n${item.message_text}\n\n<i>Sumber: ${item.sender_name}</i>`;
            const endpoint = item.image_url 
                ? `https://api.telegram.org/bot${settings.telegram_bot_token}/sendPhoto`
                : `https://api.telegram.org/bot${settings.telegram_bot_token}/sendMessage`;

            const body = item.image_url 
                ? { chat_id: settings.telegram_channel_id, photo: item.image_url, caption: caption, parse_mode: 'HTML' }
                : { chat_id: settings.telegram_channel_id, text: caption, parse_mode: 'HTML' };

            await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' }
            });
            showToast("Berita dipublikasikan & dikirim ke Telegram!");
        } else {
            showToast("Berita dipublikasikan ke Website.");
        }

        // 3. Delete from Inbox
        await telegramService.deleteInboxItem(item.id);
        loadAllData(false);

    } catch (err) {
        showToast("Gagal memproses pesan", "error");
        console.error(err);
    } finally {
        setIsSaving(false);
    }
  };

  const handleHeroImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && settings) {
      const file = e.target.files[0];
      setHeroImageFile(file);
      // Create a temporary preview URL
      setSettings({ ...settings, hero_image_url: URL.createObjectURL(file) });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      let currentSettings = { ...settings };
      
      // Upload new hero image if selected
      if (heroImageFile) {
        const uploadedFile = await storageService.upload(heroImageFile);
        currentSettings.hero_image_url = uploadedFile.url;
      }

      await settingsService.update(currentSettings);
      setHeroImageFile(null); // Reset file selection
      showToast("Pengaturan diperbarui!");
    } catch (err) {
      showToast("Gagal memperbarui", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...formData };
      if (formType === 'news') editingItem ? await newsService.update(editingItem.id, payload) : await newsService.create({ ...payload, author: currentUser?.name || 'Admin' });
      else if (formType === 'gallery') editingItem ? await galleryService.update(editingItem.id, payload) : await galleryService.add({ ...payload, author: currentUser?.name || 'Admin' });
      else if (formType === 'agenda') editingItem ? await agendaService.update(editingItem.id, payload) : await agendaService.save(payload);
      else if (formType === 'eskul') editingItem ? await eskulService.update(editingItem.id, payload) : await eskulService.save(payload);
      
      setIsModalOpen(false);
      loadAllData(false);
      showToast("Data Berhasil Disimpan!");
    } catch (err) { showToast("Gagal menyimpan data", "error"); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string, type?: string) => {
    if (!confirm("Hapus data ini secara permanen?")) return;
    setIsSaving(true);
    const target = type || activeTab;
    try {
        if (target === 'news') await newsService.delete(id);
        else if (target === 'gallery') await galleryService.delete(id);
        else if (target === 'agenda') await agendaService.delete(id);
        else if (target === 'eskul') await eskulService.delete(id);
        else if (target === 'users') await authService.deleteUser(id);
        else if (target === 'tele_inbox') await telegramService.deleteInboxItem(id);
        else if (target === 'suggestions') await suggestionService.delete(id);
        loadAllData(false);
        showToast("Data telah dihapus");
    } catch(err) { showToast("Error menghapus data", "error"); }
    finally { setIsSaving(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        await storageService.upload(e.target.files[0]);
        showToast("Gambar berhasil diupload!");
        loadAllData(false);
      } catch (err) {
        showToast("Gagal mengupload gambar", "error");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleMediaDelete = async (id: string) => {
    if(!confirm("Hapus gambar ini?")) return;
    try {
      await storageService.delete(id);
      showToast("Gambar dihapus");
      loadAllData(false);
    } catch(err) {
      showToast("Gagal menghapus", "error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Link disalin!");
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
      <div className="w-20 h-20 relative animate-pulse">
        <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-white text-[10px] font-black uppercase tracking-[0.5em] mt-8 animate-pulse">Syncing Hub...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[3000] px-10 py-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-zoom-in flex items-center gap-4 border ${toast.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-500 border-rose-400 text-white'}`}>
           <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} text-xl`}></i>
           <span className="font-black text-[11px] uppercase tracking-widest leading-none">{toast.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`w-72 bg-slate-900 text-white fixed h-full z-[90] transition-transform duration-500 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:block border-r border-white/5'}`}>
        <div className="p-8 pb-4">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-2xl shadow-blue-900/50 transform -rotate-6 transition-transform hover:rotate-0 cursor-pointer">S2</div>
              <div>
                <h2 className="text-xl font-black tracking-tighter leading-none">CONSOLE</h2>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">v3.5 Final Edition</p>
              </div>
           </div>
           
           <div className={`px-5 py-5 rounded-[1.5rem] border flex items-center gap-4 transition-all duration-500 ${isOnline ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400' : 'bg-rose-950/30 border-rose-500/20 text-rose-400'}`}>
              <div className="relative">
                <span className={`block w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{isOnline ? 'Cloud Synchronized' : 'Offline Storage'}</p>
                <p className="text-[8px] font-bold opacity-60 truncate">Sistem Sinkronisasi Terpadu</p>
              </div>
           </div>
        </div>
        
        <nav className="mt-8 px-6 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
            <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Navigasi Utama</p>
            {filteredMenu.map(menu => (
                <button key={menu.id} onClick={() => { setActiveTab(menu.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black transition-all group ${activeTab === menu.id ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/50 scale-[1.02]' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
                    <div className="flex items-center gap-4">
                      <i className={`fa-solid ${menu.icon} text-base transition-transform group-hover:scale-110`}></i>
                      <span className="uppercase tracking-[0.2em]">{menu.label}</span>
                    </div>
                    {menu.badge ? (
                      <span className="bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-lg font-black min-w-[20px] text-center">{menu.badge}</span>
                    ) : null}
                </button>
            ))}
        </nav>

        <div className="absolute bottom-8 left-6 right-6">
           <button onClick={() => { authService.logout(); navigate('/admin'); }} className="w-full flex items-center justify-center gap-4 px-6 py-5 rounded-2xl text-[11px] font-black text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/10 transition-all group">
             <i className="fa-solid fa-power-off group-hover:rotate-90 transition-transform"></i>
             <span className="uppercase tracking-[0.2em]">Logout Session</span>
           </button>
        </div>
      </aside>

      <main className="md:ml-72 flex-1 p-6 md:p-16 pt-24 md:pt-16 max-w-full overflow-x-hidden relative">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-16">
           <div className="animate-slide-up">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] mb-3">Management Workspace</p>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">{activeTab.replace('_', ' ')}</h1>
           </div>
           
           <div className="flex flex-wrap items-center gap-4 animate-slide-up [animation-delay:100ms]">
              {activeTab === 'news' && (
                <button onClick={handleFetchNews} disabled={isFetching || isSaving} className="px-8 py-5 bg-emerald-500 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-200 hover:bg-emerald-600 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isFetching ? <i className="fa-solid fa-spinner animate-spin text-lg"></i> : <i className="fa-solid fa-globe text-lg"></i>}
                  {isFetching ? 'Fetching...' : 'Fetch External'}
                </button>
              )}

              {['news', 'gallery', 'agenda', 'eskul'].includes(activeTab) && (
                 <button onClick={() => handleOpenModal()} className="px-8 py-5 bg-blue-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3">
                   <i className="fa-solid fa-plus-circle text-lg"></i> Buat Konten Baru
                 </button>
               )}
               <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm pl-4 pr-8 group cursor-pointer hover:border-blue-200 transition-colors">
                  <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black group-hover:bg-blue-600 transition-colors">
                    {currentUser?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase leading-none mb-1">{currentUser?.name}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{currentUser?.role}</p>
                  </div>
               </div>
           </div>
        </header>

        {activeTab === 'dashboard' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
                {[
                  { label: 'Realtime Visitors', value: stats.visitors, icon: 'fa-users', color: 'blue' },
                  { label: 'Cloud Published News', value: stats.news, icon: 'fa-newspaper', color: 'indigo' },
                  { label: 'Pending Inbox', value: teleInbox.length, icon: 'fa-envelope-open-text', color: 'emerald' }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
                    <div className={`absolute top-0 right-0 w-40 h-40 bg-${s.color}-50 rounded-bl-full opacity-40 group-hover:scale-125 transition-transform duration-700`}></div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 relative z-10">{s.label}</p>
                    <div className={`text-7xl font-black text-slate-900 relative z-10 tracking-tighter group-hover:text-${s.color}-600 transition-colors`}>{s.value}</div>
                    <div className="mt-10 relative z-10 flex justify-between items-center">
                       <span className={`px-4 py-2 bg-${s.color}-50 text-${s.color}-600 rounded-xl text-[9px] font-black uppercase tracking-widest`}>
                         <i className={`fa-solid ${s.icon} mr-2`}></i> Synchronized
                       </span>
                    </div>
                  </div>
                ))}
            </div>
        ) : activeTab === 'media' ? (
            <div className="space-y-8 animate-slide-up">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900">Upload New Media</h3>
                        <p className="text-slate-500 text-xs font-bold mt-1">Supported: JPG, PNG, WEBP (Max 5MB)</p>
                    </div>
                    <label className={`cursor-pointer px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center gap-3 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                         {isUploading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
                         {isUploading ? 'Uploading...' : 'Select File'}
                         <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {mediaFiles.map((file) => (
                        <div key={file.id} className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                            <div className="aspect-square rounded-[1.5rem] overflow-hidden relative bg-slate-50 mb-4">
                                <img src={file.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={file.name} />
                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                    <button onClick={() => copyToClipboard(file.url)} className="w-10 h-10 bg-white text-slate-900 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg" title="Copy URL">
                                        <i className="fa-regular fa-copy"></i>
                                    </button>
                                    <button onClick={() => handleMediaDelete(file.id)} className="w-10 h-10 bg-white text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-lg" title="Delete">
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="px-2">
                                <h4 className="font-bold text-slate-900 text-xs truncate" title={file.name}>{file.name}</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{file.size}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ) : activeTab === 'tele_inbox' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
               {teleInbox.length === 0 ? (
                 <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
                    <p className="text-xs font-black text-slate-300 uppercase tracking-[0.5em]">Belum ada pesan dari bot Telegram.</p>
                 </div>
               ) : teleInbox.map((item) => (
                 <div key={item.id} className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden p-10 shadow-sm flex flex-col group hover:shadow-2xl transition-all duration-700">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><i className="fa-brands fa-telegram"></i></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">From: {item.sender_name}</p>
                   </div>
                   <p className="text-slate-800 font-bold text-sm mb-8 leading-relaxed italic">"{item.message_text}"</p>
                   
                   {/* Publish Button Area */}
                   <div className="mt-auto flex gap-4">
                       <button onClick={() => handlePublishInboxItem(item)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black hover:bg-blue-700 transition-all uppercase tracking-widest shadow-lg shadow-blue-200">
                            <i className="fa-solid fa-share-from-square mr-2"></i> Publish
                       </button>
                       <button onClick={() => handleDelete(item.id, 'tele_inbox')} className="w-14 h-14 bg-rose-50 text-rose-400 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all border border-rose-100">
                            <i className="fa-solid fa-trash-can"></i>
                       </button>
                   </div>
                 </div>
               ))}
            </div>
        ) : activeTab === 'settings' ? (
            <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-slate-100 animate-slide-up max-w-5xl mx-auto">
                <form onSubmit={handleSaveSettings}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h3>
                            <p className="text-slate-500 font-bold text-sm mt-2">Manage global configurations and integrations.</p>
                        </div>
                        <button type="submit" disabled={isSaving} className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Identity Section */}
                        <div className={`border border-slate-100 rounded-[2.5rem] overflow-hidden transition-all duration-300 ${openSection === 'identity' ? 'bg-slate-50 shadow-inner' : 'bg-white hover:bg-slate-50/50'}`}>
                            <button type="button" onClick={() => setOpenSection(openSection === 'identity' ? '' : 'identity')} className="w-full flex items-center justify-between p-8 text-left">
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-colors ${openSection === 'identity' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                        <i className="fa-solid fa-school"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg text-slate-900">School Identity</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Name, Hero Image, Welcome Text</p>
                                    </div>
                                </div>
                                <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${openSection === 'identity' ? 'rotate-180 text-blue-600' : 'text-slate-300'}`}></i>
                            </button>
                            {openSection === 'identity' && (
                                <div className="px-8 pb-10 pt-2 grid gap-8 animate-fade-in">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">School Name</label>
                                        <input type="text" value={settings?.school_name || ''} onChange={e => setSettings(settings ? {...settings, school_name: e.target.value} : null)} className="w-full px-8 py-5 bg-white border border-slate-200 rounded-[2rem] font-bold text-slate-700 outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Hero Image</label>
                                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                                            {settings?.hero_image_url && (
                                                <div className="mb-6 h-48 rounded-3xl overflow-hidden relative shadow-md">
                                                    <img src={settings.hero_image_url} alt="Hero Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex gap-4">
                                                 <input type="text" value={settings?.hero_image_url || ''} onChange={e => setSettings(settings ? {...settings, hero_image_url: e.target.value} : null)} className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none text-xs" placeholder="https://..." />
                                                 <label className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all cursor-pointer flex items-center gap-2">
                                                    <i className="fa-solid fa-cloud-arrow-up"></i> Upload
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleHeroImageSelect} />
                                                 </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Sub-Welcome Text</label>
                                        <textarea rows={3} value={settings?.sub_welcome_text || ''} onChange={e => setSettings(settings ? {...settings, sub_welcome_text: e.target.value} : null)} className="w-full px-8 py-5 bg-white border border-slate-200 rounded-[2rem] font-bold text-slate-700 outline-none focus:border-blue-500 transition-all resize-none" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className={`border border-slate-100 rounded-[2.5rem] overflow-hidden transition-all duration-300 ${openSection === 'content' ? 'bg-slate-50 shadow-inner' : 'bg-white hover:bg-slate-50/50'}`}>
                            <button type="button" onClick={() => setOpenSection(openSection === 'content' ? '' : 'content')} className="w-full flex items-center justify-between p-8 text-left">
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-colors ${openSection === 'content' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                        <i className="fa-solid fa-bullhorn"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg text-slate-900">Announcements</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Running Text & Alerts</p>
                                    </div>
                                </div>
                                <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${openSection === 'content' ? 'rotate-180 text-emerald-500' : 'text-slate-300'}`}></i>
                            </button>
                            {openSection === 'content' && (
                                <div className="px-8 pb-10 pt-2 animate-fade-in">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Running Text Banner</label>
                                        <input type="text" value={settings?.running_text || ''} onChange={e => setSettings(settings ? {...settings, running_text: e.target.value} : null)} className="w-full px-8 py-5 bg-white border border-slate-200 rounded-[2rem] font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* API Keys Section */}
                        <div className={`border border-slate-100 rounded-[2.5rem] overflow-hidden transition-all duration-300 ${openSection === 'api' ? 'bg-slate-50 shadow-inner' : 'bg-white hover:bg-slate-50/50'}`}>
                            <button type="button" onClick={() => setOpenSection(openSection === 'api' ? '' : 'api')} className="w-full flex items-center justify-between p-8 text-left">
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-colors ${openSection === 'api' ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                        <i className="fa-solid fa-key"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg text-slate-900">API Configuration</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Telegram Bot & Integrations</p>
                                    </div>
                                </div>
                                <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${openSection === 'api' ? 'rotate-180 text-slate-800' : 'text-slate-300'}`}></i>
                            </button>
                            {openSection === 'api' && (
                                <div className="px-8 pb-10 pt-2 animate-fade-in">
                                    
                                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200/50 mb-4">
                                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200/50">
                                           <div className="w-10 h-10 bg-white text-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                                             <i className="fa-brands fa-telegram text-xl"></i>
                                           </div>
                                           <div>
                                             <h5 className="font-black text-slate-800 uppercase tracking-wider text-sm">Bot Configuration</h5>
                                             <p className="text-[10px] font-bold text-slate-400">Setup Telegram Integration</p>
                                           </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Telegram Bot Token (HTTP API)</label>
                                                <div className="relative">
                                                    <input type="password" value={settings?.telegram_bot_token || ''} onChange={e => setSettings(settings ? {...settings, telegram_bot_token: e.target.value} : null)} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-600 transition-all tracking-widest text-xs" placeholder="123456:ABC..." />
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                                                        <i className="fa-solid fa-lock"></i>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold ml-2 leading-relaxed">
                                                    Token dari <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">@BotFather</a>. Diperlukan untuk menerima pesan (Inbox) dan mengirim notifikasi.
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Target Channel ID (Admin)</label>
                                                <div className="relative">
                                                    <input type="text" value={settings?.telegram_channel_id || ''} onChange={e => setSettings(settings ? {...settings, telegram_channel_id: e.target.value} : null)} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-600 transition-all text-xs" placeholder="@namachannel atau -100xxxxx" />
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                                                        <i className="fa-solid fa-bullhorn"></i>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold ml-2 leading-relaxed">
                                                    Channel tujuan untuk fitur 'Publish to Telegram'. <br/>
                                                    <span className="text-rose-500"><i className="fa-solid fa-triangle-exclamation"></i> Bot wajib dijadikan Administrator di channel ini.</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-slide-up">
               {(activeTab === 'news' ? news : activeTab === 'gallery' ? gallery : activeTab === 'agenda' ? agenda : eskul).map((item: any) => (
                 <div key={item.id} className="bg-white rounded-[4rem] border border-slate-100 overflow-hidden shadow-sm flex flex-col group hover:shadow-2xl transition-all duration-700 hover:-translate-y-3">
                   {item.image_url && <div className="h-64 overflow-hidden relative border-b border-slate-50"><img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" alt="Asset" /></div>}
                   <div className="p-12 flex flex-col flex-1">
                     <h3 className="font-black text-slate-900 mb-4 leading-tight text-xl line-clamp-2 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{(item as any).title || (item as any).name}</h3>
                     <div className="mt-auto flex gap-4">
                       <button onClick={() => handleOpenModal(item)} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest border border-slate-100">Edit</button>
                       <button onClick={() => handleDelete(item.id)} className="w-14 h-14 bg-rose-50 text-rose-400 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all border border-rose-100 shadow-sm shadow-rose-100"><i className="fa-solid fa-trash-can"></i></button>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
        )}
      </main>

      {/* Basic Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-2xl z-[2000] flex items-center justify-center p-6 animate-fade-in" onClick={() => setIsModalOpen(false)}>
           <div className="bg-white w-full max-w-3xl rounded-[4.5rem] p-12 md:p-16 shadow-[0_60px_120px_rgba(0,0,0,0.6)] animate-zoom-in max-h-[92vh] overflow-y-auto relative border border-white/5" onClick={(e) => e.stopPropagation()}>
             <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
               <i className="fa-solid fa-xmark text-lg"></i>
             </button>
             <header className="mb-12">
               <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Modify {formType} Hub</h3>
             </header>
             <form onSubmit={handleSave} className="space-y-10">
                <input type="text" placeholder="Judul..." value={formData.title || formData.name} onChange={e => setFormData({...formData, title: e.target.value, name: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 text-slate-900 rounded-[2rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-600/10 transition-all" required />
                <textarea placeholder="Konten..." rows={6} value={formData.content || formData.description} onChange={e => setFormData({...formData, content: e.target.value, description: e.target.value})} className="w-full px-10 py-7 bg-slate-50 border border-slate-100 text-slate-900 rounded-[3rem] text-sm outline-none focus:ring-4 focus:ring-blue-600/10 transition-all" required />
                <div className="flex gap-4 pt-10 border-t border-slate-50">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-6 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-[11px] uppercase tracking-widest">Discard</button>
                   <button type="submit" disabled={isSaving} className="flex-[2.5] py-6 bg-blue-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50">Save To Hub</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
