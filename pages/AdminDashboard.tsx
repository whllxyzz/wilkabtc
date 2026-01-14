
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
  getSystemStatus
} from '../services/supabaseService';
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

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<string>(''); 
  const [editingItem, setEditingItem] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

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

    // Polling setiap 30 detik untuk memastikan data admin selalu paling update (Live Sync)
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
      const [vCount, n, g, i, sug, s, u, e, a] = await Promise.all([
        visitorService.getOnlineCount(),
        newsService.getAll(),
        galleryService.getAll(),
        telegramService.getInbox(),
        suggestionService.getAll(),
        settingsService.get(),
        authService.getAllUsers(),
        eskulService.getAll(),
        agendaService.getAll()
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
    { id: 'agenda', icon: 'fa-calendar-days', label: 'Agenda', roles: ['admin', 'user'] },
    { id: 'eskul', icon: 'fa-basketball', label: 'Eskul', roles: ['admin', 'user'] },
    { id: 'tele_inbox', icon: 'fa-telegram', label: 'Tele Inbox', roles: ['admin'], badge: teleInbox.length },
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await settingsService.update(settings);
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

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
      <div className="w-20 h-20 relative">
        <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-white text-[10px] font-black uppercase tracking-[0.5em] mt-8 animate-pulse">Syncing Hub...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
      
      {/* Toast Notification Perfect Edition */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[3000] px-10 py-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-zoom-in flex items-center gap-4 border ${toast.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-500 border-rose-400 text-white'}`}>
           <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} text-xl`}></i>
           <span className="font-black text-[11px] uppercase tracking-widest leading-none">{toast.message}</span>
        </div>
      )}

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar Navigation - The "Command Center" */}
      <aside className={`w-72 bg-slate-900 text-white fixed h-full z-[90] transition-transform duration-500 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:block'}`}>
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
                <span className={`block w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]' : 'bg-rose-400'}`}></span>
                {isOnline && <span className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-30"></span>}
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
                      <span className="bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-lg font-black min-w-[20px] text-center shadow-lg shadow-rose-900/40">{menu.badge}</span>
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
        
        {/* Floating Sync Status (Mobile) */}
        <div className="md:hidden fixed top-6 left-6 z-[70] flex items-center gap-3">
           <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
           <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">{isOnline ? 'Sync' : 'Local'}</span>
        </div>

        {/* Mobile Nav Trigger */}
        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden fixed top-6 right-6 z-[70] w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-900 border border-slate-100 active:scale-95 transition-transform">
           <i className="fa-solid fa-bars-staggered"></i>
        </button>

        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-16">
           <div className="animate-slide-up">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] mb-3">Management Workspace</p>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">{activeTab.replace('_', ' ')}</h1>
           </div>
           
           <div className="flex flex-wrap items-center gap-4 animate-slide-up [animation-delay:100ms]">
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
                       <i className={`fa-solid fa-arrow-right text-${s.color}-200 group-hover:text-${s.color}-600 group-hover:translate-x-2 transition-all`}></i>
                    </div>
                  </div>
                ))}
                
                <div className="col-span-full mt-8 animate-slide-up [animation-delay:200ms]">
                   <div className="bg-white rounded-[4rem] border border-slate-100 overflow-hidden shadow-sm">
                      <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                         <h4 className="font-black text-slate-900 text-sm uppercase tracking-[0.3em] flex items-center gap-4">
                           <div className="w-2 h-7 bg-blue-600 rounded-full"></div> System Activity Logs
                         </h4>
                         <button onClick={() => loadAllData()} className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                           <i className={`fa-solid fa-rotate ${loading ? 'animate-spin' : ''}`}></i>
                         </button>
                      </div>
                      <div className="p-20 text-center">
                         <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-100">
                           <i className="fa-solid fa-chart-simple text-3xl text-slate-200"></i>
                         </div>
                         <h5 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-2">Mengumpulkan Data Trafik</h5>
                         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">Sistem AI sedang menganalisa pola kunjungan. Log aktivitas terperinci akan muncul di sini segera.</p>
                      </div>
                   </div>
                </div>
            </div>
        ) : activeTab === 'settings' ? (
            <div className="bg-white p-12 md:p-20 rounded-[4.5rem] shadow-sm border border-slate-100 animate-slide-up max-w-5xl">
                <form onSubmit={handleSaveSettings} className="space-y-16">
                   <div className="flex justify-between items-center mb-12">
                      <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-5">
                        <div className="w-2 h-9 bg-blue-600 rounded-full"></div> Core Configuration
                      </h3>
                      <button type="submit" disabled={isSaving} className="px-12 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-blue-600 transition-all flex items-center justify-center gap-4 min-w-[300px] disabled:opacity-50">
                        {isSaving ? <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</> : <><i className="fa-solid fa-cloud-arrow-up"></i> Commit System Changes</>}
                      </button>
                   </div>
                   
                   <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-3">Official School Identity</label>
                        <input type="text" value={settings?.school_name} onChange={e => setSettings(settings ? {...settings, school_name: e.target.value} : null)} className="w-full px-10 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all shadow-inner" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-3">Announcements Text Runner</label>
                        <input type="text" value={settings?.running_text} onChange={e => setSettings(settings ? {...settings, running_text: e.target.value} : null)} className="w-full px-10 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all shadow-inner" />
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-3">Primary Visual Branded Asset (URL)</label>
                      <input type="text" value={settings?.hero_image_url} onChange={e => setSettings(settings ? {...settings, hero_image_url: e.target.value} : null)} className="w-full px-10 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all shadow-inner" />
                   </div>

                   <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -z-0"></div>
                      <div className="relative z-10">
                        <h4 className="text-xl font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                           <div className="w-2 h-7 bg-emerald-400 rounded-full"></div> Telegram Bot Infrastructure
                        </h4>
                        <div className="grid md:grid-cols-2 gap-10">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">Access Token Payload</label>
                              <input type="password" value={settings?.telegram_bot_token} onChange={e => setSettings(settings ? {...settings, telegram_bot_token: e.target.value} : null)} className="w-full px-10 py-6 bg-white/5 border border-white/10 rounded-[2rem] text-xs outline-none focus:ring-4 focus:ring-emerald-500/20 focus:bg-white/10 transition-all font-mono" placeholder="BOT_TOKEN_KEY" />
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">Target Admin Chat-ID</label>
                              <input type="text" value={settings?.telegram_chat_id} onChange={e => setSettings(settings ? {...settings, telegram_chat_id: e.target.value} : null)} className="w-full px-10 py-6 bg-white/5 border border-white/10 rounded-[2rem] text-xs outline-none focus:ring-4 focus:ring-emerald-500/20 focus:bg-white/10 transition-all font-mono" placeholder="CHAT_ID" />
                           </div>
                        </div>
                      </div>
                   </div>
                </form>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-slide-up">
               {(activeTab === 'news' ? news : activeTab === 'gallery' ? gallery : activeTab === 'agenda' ? agenda : eskul).length === 0 ? (
                 <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 group hover:border-blue-100 transition-all">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 group-hover:bg-blue-50 group-hover:text-blue-200 transition-all">
                       <i className="fa-solid fa-database text-3xl"></i>
                    </div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-[0.5em]">Database modul {activeTab} masih kosong.</p>
                 </div>
               ) : (activeTab === 'news' ? news : activeTab === 'gallery' ? gallery : activeTab === 'agenda' ? agenda : eskul).map((item: any) => (
                 <div key={item.id} className="bg-white rounded-[4rem] border border-slate-100 overflow-hidden shadow-sm flex flex-col group hover:shadow-2xl transition-all duration-700 hover:-translate-y-3">
                   {item.image_url && <div className="h-64 overflow-hidden relative border-b border-slate-50"><img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" alt="Asset" /></div>}
                   <div className="p-12 flex flex-col flex-1">
                     <h3 className="font-black text-slate-900 mb-4 leading-tight text-xl line-clamp-2 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{(item as any).title || (item as any).name}</h3>
                     <div className="flex items-center gap-3 mb-10">
                        <span className="w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]"></span>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{(item as any).schedule || (item as any).location || 'Verified Secure Data'}</p>
                     </div>
                     <div className="mt-auto flex gap-4">
                       <button onClick={() => handleOpenModal(item)} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest border border-slate-100 active:scale-95">Edit</button>
                       <button onClick={() => handleDelete(item.id)} className="w-14 h-14 bg-rose-50 text-rose-400 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all border border-rose-100 active:scale-95 shadow-sm shadow-rose-100"><i className="fa-solid fa-trash-can"></i></button>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
        )}
      </main>

      {/* The Perfect Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-2xl z-[2000] flex items-center justify-center p-6 animate-fade-in" onClick={() => setIsModalOpen(false)}>
           <div className="bg-white w-full max-w-3xl rounded-[4.5rem] p-12 md:p-16 shadow-[0_60px_120px_rgba(0,0,0,0.6)] animate-zoom-in max-h-[92vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
             
             <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90">
               <i className="fa-solid fa-xmark text-lg"></i>
             </button>

             <header className="mb-12">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-7 bg-blue-600 rounded-full"></div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.6em]">Core Data Editor</p>
               </div>
               <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Modify {formType} Hub</h3>
             </header>

             <form onSubmit={handleSave} className="space-y-10">
                <div className="grid md:grid-cols-5 gap-10">
                   <div className="md:col-span-3 space-y-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-3">Identification Label / Title</label>
                         <input type="text" placeholder="Masukkan judul..." value={formData.title || formData.name} onChange={e => setFormData({...formData, title: e.target.value, name: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all shadow-inner" required />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-3">Visual Resource Link (URL)</label>
                         <input type="text" placeholder="https://source.unsplash.com/example" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-xs outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all font-mono shadow-inner" />
                      </div>
                   </div>
                   <div className="md:col-span-2">
                      <div className="h-full bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center overflow-hidden relative group">
                        {formData.image_url ? (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-3 relative z-10">Cloud Asset Preview</p>
                            <img src={formData.image_url} className="w-full h-40 object-cover rounded-[1.5rem] shadow-2xl relative z-10 transition-transform group-hover:scale-105" alt="Live Preview" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Invalid+Image+Resource')} />
                          </div>
                        ) : (
                          <div className="p-8 opacity-20">
                            <i className="fa-regular fa-image text-5xl mb-4"></i>
                            <p className="text-[9px] font-black uppercase tracking-widest">Awaiting Image URL Payload</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-3">Expanded Metadata / Content</label>
                   <textarea placeholder="Isikan detail informasi di sini..." rows={6} value={formData.content || formData.description} onChange={e => setFormData({...formData, content: e.target.value, description: e.target.value})} className="w-full px-10 py-7 bg-slate-50 border border-slate-100 rounded-[3rem] text-sm outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all font-medium leading-relaxed shadow-inner" required />
                </div>

                {['agenda', 'eskul'].includes(formType) && (
                   <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-3">Date / Schedule Key</label>
                        <input type="text" placeholder="Setiap Senin / 12 Mei 2026" value={formData.schedule || formData.date} onChange={e => setFormData({...formData, schedule: e.target.value, date: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all shadow-inner" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-3">Location Node</label>
                        <input type="text" placeholder="Aula Utama / Lapangan" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all shadow-inner" />
                      </div>
                   </div>
                )}

                <div className="flex gap-4 pt-10 border-t border-slate-50">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-6 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Discard Edits</button>
                   <button type="submit" disabled={isSaving} className="flex-[2.5] py-6 bg-blue-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-[0_25px_60px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50">
                     {isSaving ? <><i className="fa-solid fa-spinner fa-spin text-lg"></i> System Synchronizing...</> : <><i className="fa-solid fa-cloud-check text-lg"></i> Commit To Public Hub</>}
                   </button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
