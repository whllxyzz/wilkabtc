
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
  departmentService
} from '../services/supabaseService';
import { NewsItem, GalleryItem, Teacher, AgendaItem, Eskul, TelegramInbox, SiteSettings, Suggestion, Department, User } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
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
  const [departments, setDepartments] = useState<Department[]>([]);

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<string>(''); 
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Settings Upload States
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({ 
    title: '', content: '', image_url: '', 
    name: '', description: '', icon: 'fa-graduation-cap',
    nip: '', position: '', schedule: '',
    date: '', time: '', location: ''
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/admin');
      return;
    }
    setCurrentUser(user);
    loadAllData();
  }, [navigate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [vCount, n, g, t, a, e, i, sug, s, d] = await Promise.all([
        visitorService.getOnlineCount(),
        newsService.getAll(),
        galleryService.getAll(),
        teacherService.getAll(),
        agendaService.getAll(),
        eskulService.getAll(),
        telegramService.getInbox(),
        suggestionService.getAll(),
        settingsService.get(),
        departmentService.getAll()
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
      setDepartments(d);
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  const menuItems = [
    { id: 'dashboard', icon: 'fa-gauge-high', label: 'Dashboard', roles: ['admin', 'user'] },
    { id: 'news', icon: 'fa-newspaper', label: 'Berita', roles: ['admin', 'user'] },
    { id: 'gallery', icon: 'fa-images', label: 'Galeri', roles: ['admin', 'user'] },
    { id: 'agenda', icon: 'fa-calendar-days', label: 'Agenda', roles: ['admin', 'user'] },
    { id: 'eskul', icon: 'fa-basketball', label: 'Eskul', roles: ['admin', 'user'] },
    { id: 'depts', icon: 'fa-building-columns', label: 'Jurusan', roles: ['admin'] },
    { id: 'teachers', icon: 'fa-chalkboard-user', label: 'Guru', roles: ['admin'] },
    { id: 'tele_inbox', icon: 'fa-telegram', label: 'Inbox Bot', badge: teleInbox.length, roles: ['admin'] },
    { id: 'suggestions', icon: 'fa-box-open', label: 'Kotak Saran', badge: suggestions.length, roles: ['admin'] },
    { id: 'settings', icon: 'fa-gear', label: 'Pengaturan', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(currentUser?.role || ''));

  const handleLogout = () => {
    if(confirm("Keluar dari panel?")) {
      authService.logout();
      navigate('/admin');
    }
  };

  const handleOpenModal = (item: any = null, type: string | null = null) => {
    const targetType = type || activeTab;
    setFormType(targetType);
    setIsModalOpen(true);
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
      setPreviewUrl(item.image_url);
    } else {
      setEditingItem(null);
      setFormData({ title: '', content: '', image_url: '', name: '', description: '', icon: 'fa-graduation-cap', nip: '', position: '', schedule: '', date: '', time: '', location: '' });
      setPreviewUrl(null);
    }
  };

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHeroFile(file);
      setHeroPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      let updatedSettings = { ...settings };
      if (heroFile) {
        const uploadedUrl = await galleryService.uploadImage(heroFile);
        updatedSettings.hero_image_url = uploadedUrl;
      }
      await settingsService.update(updatedSettings);
      setSettings(updatedSettings);
      setHeroFile(null);
      setHeroPreview(null);
      alert("Pengaturan website berhasil diperbarui!");
    } catch (err) {
      alert("Gagal memperbarui pengaturan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalImageUrl = formData.image_url;
      if (selectedFile) finalImageUrl = await galleryService.uploadImage(selectedFile);
      const payload = { ...formData, image_url: finalImageUrl };

      if (formType === 'news') editingItem ? await newsService.update(editingItem.id, payload) : await newsService.create({ ...payload, author: currentUser?.name || 'User' });
      else if (formType === 'gallery') editingItem ? await galleryService.update(editingItem.id, payload) : await galleryService.add({ ...payload, author: currentUser?.name || 'User' });
      else if (formType === 'agenda') editingItem ? await agendaService.update(editingItem.id, payload) : await agendaService.save(payload);
      else if (formType === 'eskul') editingItem ? await eskulService.update(editingItem.id, payload) : await eskulService.save(payload);
      else if (formType === 'teachers' && isAdmin) editingItem ? await teacherService.update(editingItem.id, payload) : await teacherService.save(payload);
      else if (formType === 'depts' && isAdmin) editingItem ? await departmentService.update(editingItem.id, payload) : await departmentService.save(payload);

      setIsModalOpen(false);
      loadAllData();
      alert("Berhasil disimpan!");
    } catch (err) { alert("Error menyimpan data."); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus item ini?")) return;
    if (activeTab === 'news') await newsService.delete(id);
    else if (activeTab === 'gallery') await galleryService.delete(id);
    else if (activeTab === 'agenda') await agendaService.delete(id);
    else if (activeTab === 'eskul') await eskulService.delete(id);
    else if (activeTab === 'teachers' && isAdmin) await teacherService.delete(id);
    else if (activeTab === 'depts' && isAdmin) await departmentService.delete(id);
    loadAllData();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest text-xs">Loading Console...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white fixed h-full overflow-y-auto hidden md:block z-50">
        <div className="p-8">
           <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xs">S2</div>
              <h2 className="text-xl font-black">Console</h2>
           </div>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">SMKN 2 Tembilahan</p>
        </div>
        <nav className="mt-4 px-4 space-y-1.5">
            {filteredMenu.map(menu => (
                <button 
                    key={menu.id}
                    onClick={() => setActiveTab(menu.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === menu.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                    <div className="flex items-center gap-3">
                        <i className={`fa-solid ${menu.icon} w-5`}></i>
                        {menu.label}
                    </div>
                    {menu.badge ? <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{menu.badge}</span> : null}
                </button>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-900/20 mt-8">
                <i className="fa-solid fa-power-off w-5"></i> Logout
            </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 flex-1 p-6 md:p-10 pt-24 md:pt-10">
        <header className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
               <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{activeTab.replace('_', ' ')}</h1>
               {['news', 'gallery', 'agenda', 'eskul'].includes(activeTab) || (isAdmin && ['teachers', 'depts'].includes(activeTab)) ? (
                  <button onClick={() => handleOpenModal()} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg">
                    + TAMBAH DATA
                  </button>
               ) : null}
            </div>
            
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-xs font-black text-slate-900 leading-none mb-1">{currentUser?.name}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isAdmin ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                       {currentUser?.role}
                    </span>
                </div>
                <div className="w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 font-black shadow-sm">
                    {currentUser?.name.charAt(0)}
                </div>
            </div>
        </header>

        {/* Tab Logic */}
        {!filteredMenu.find(m => m.id === activeTab) ? (
            <div className="bg-white p-20 rounded-[3rem] text-center border border-slate-200">
               <i className="fa-solid fa-lock text-4xl text-rose-500 mb-6"></i>
               <h3 className="text-xl font-black text-slate-900">Akses Ditolak</h3>
               <p className="text-slate-500 text-sm mt-2">Anda tidak memiliki izin untuk mengakses fitur ini.</p>
               <button onClick={() => setActiveTab('dashboard')} className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest">Kembali ke Dashboard</button>
            </div>
        ) : activeTab === 'dashboard' ? (
            <div className="animate-zoom-in grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Online Visitors</div>
                    <div className="text-5xl font-black text-slate-900">{stats.visitors}</div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Articles</div>
                    <div className="text-5xl font-black text-blue-600">{stats.news}</div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Media Gallery</div>
                    <div className="text-5xl font-black text-purple-600">{stats.gallery}</div>
                </div>
                
                {isAdmin && (
                  <div className="md:col-span-3 bg-blue-600 p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 mt-4">
                     <div className="max-w-md">
                        <h3 className="text-2xl font-black mb-2">Halo Super Admin!</h3>
                        <p className="text-blue-100 text-sm opacity-80">Anda memiliki kendali penuh atas infrastruktur website. Gunakan Bot Telegram untuk monitoring real-time.</p>
                     </div>
                     <button onClick={() => setActiveTab('tele_inbox')} className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">Buka Konsol Bot</button>
                  </div>
                )}
            </div>
        ) : activeTab === 'settings' && isAdmin ? (
            <div className="max-w-4xl mx-auto space-y-8 animate-zoom-in pb-20">
                {/* School Information Card */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                   <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div> Informasi Dasar Sekolah
                   </h3>
                   <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Sekolah</label>
                           <input type="text" value={settings?.school_name || ''} onChange={e => setSettings({...settings!, school_name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" />
                       </div>
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo URL</label>
                           <input type="text" value={settings?.logo_url || ''} onChange={e => setSettings({...settings!, logo_url: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" placeholder="https://..." />
                       </div>
                   </div>
                </div>

                {/* Hero Content Card */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                   <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div> Konten Tampilan Hero
                   </h3>
                   <div className="space-y-6">
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hero Image (Upload)</label>
                           <div className="flex flex-col md:flex-row gap-6 items-start">
                              <div className="flex-1 w-full">
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-200 border-dashed rounded-3xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden relative">
                                  {heroPreview || settings?.hero_image_url ? (
                                    <img src={heroPreview || settings?.hero_image_url} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Hero Preview" />
                                  ) : null}
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10 text-slate-500">
                                    <i className="fa-solid fa-cloud-arrow-up text-2xl mb-2"></i>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Ganti Gambar Hero</p>
                                  </div>
                                  <input type="file" className="hidden" accept="image/*" onChange={handleHeroFileChange} />
                                </label>
                              </div>
                              <div className="flex-1 w-full space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Manual Hero Image URL</label>
                                <input type="text" value={settings?.hero_image_url || ''} onChange={e => { setSettings({...settings!, hero_image_url: e.target.value}); setHeroPreview(null); }} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" />
                              </div>
                           </div>
                       </div>
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Welcome Text (H1)</label>
                           <input type="text" value={settings?.welcome_text || ''} onChange={e => setSettings({...settings!, welcome_text: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" />
                       </div>
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sub Welcome Text</label>
                           <textarea rows={3} value={settings?.sub_welcome_text || ''} onChange={e => setSettings({...settings!, sub_welcome_text: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" />
                       </div>
                   </div>
                </div>

                {/* Features Card */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                   <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div> Fitur & Pengumuman
                   </h3>
                   <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Running Text (Teks Berjalan)</label>
                       <textarea rows={2} value={settings?.running_text || ''} onChange={e => setSettings({...settings!, running_text: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" placeholder="Ketik pengumuman singkat di sini..." />
                   </div>
                </div>

                {/* Telegram Bot Card */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                   <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div> Integrasi Bot Telegram
                   </h3>
                   <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bot Token</label>
                           <input type="password" value={settings?.telegram_bot_token || ''} onChange={e => setSettings({...settings!, telegram_bot_token: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" />
                       </div>
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Chat ID</label>
                           <input type="text" value={settings?.telegram_chat_id || ''} onChange={e => setSettings({...settings!, telegram_chat_id: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" />
                       </div>
                   </div>
                </div>

                <div className="sticky bottom-8 left-0 right-0">
                    <button 
                        onClick={handleSaveSettings} 
                        disabled={isSaving}
                        className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all disabled:opacity-50"
                    >
                        {isSaving ? "MEMPROSES PERUBAHAN..." : "SIMPAN SEMUA PENGATURAN"}
                    </button>
                </div>
            </div>
        ) : activeTab === 'tele_inbox' && isAdmin ? (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-zoom-in">
                {teleInbox.length === 0 ? <p className="col-span-full text-center py-20 text-slate-400 font-bold">Inbox Telegram Kosong</p> : 
                  teleInbox.map(item => (
                    <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col">
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black text-blue-600 uppercase">{item.sender_name}</span>
                          <span className="text-[9px] text-slate-400">{new Date(item.created_at).toLocaleTimeString()}</span>
                       </div>
                       <p className="text-xs font-bold text-slate-700 mb-6 flex-grow italic">"{item.message_text}"</p>
                       <div className="flex gap-2">
                          <button onClick={() => { newsService.create({ title: 'Update Bot', content: item.message_text, image_url: item.image_url || '', author: item.sender_name }); telegramService.deleteInboxItem(item.id); loadAllData(); }} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase">Publish News</button>
                          <button onClick={() => { telegramService.deleteInboxItem(item.id); loadAllData(); }} className="px-4 py-3 bg-slate-100 text-slate-400 rounded-xl"><i className="fa-solid fa-trash"></i></button>
                       </div>
                    </div>
                  ))
                }
             </div>
        ) : activeTab === 'suggestions' && isAdmin ? (
             <div className="grid md:grid-cols-2 gap-6 animate-zoom-in">
                {suggestions.map(s => (
                  <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-slate-200">
                     <div className="flex justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{s.type}</span>
                        <button onClick={async () => { await suggestionService.delete(s.id); loadAllData(); }} className="text-rose-400 hover:text-rose-600"><i className="fa-solid fa-trash-can"></i></button>
                     </div>
                     <p className="text-sm font-medium text-slate-700 mb-4">"{s.content}"</p>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Dari: {s.name}</p>
                  </div>
                ))}
             </div>
        ) : (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-zoom-in">
               {(activeTab === 'news' ? news : activeTab === 'gallery' ? gallery : activeTab === 'teachers' ? teachers : activeTab === 'eskul' ? eskul : activeTab === 'agenda' ? agenda : departments).map((item: any) => (
                 <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col group hover:shadow-xl transition-all">
                   {item.image_url && <div className="h-44 overflow-hidden"><img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Media" /></div>}
                   <div className="p-8 flex flex-col flex-1">
                     <h3 className="font-bold text-slate-900 mb-2 line-clamp-1">{item.title || item.name}</h3>
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 opacity-60">
                        {item.position || item.schedule || item.location || 'Aktif'}
                     </p>
                     <div className="mt-auto flex gap-2">
                       <button onClick={() => handleOpenModal(item)} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black hover:bg-blue-600 hover:text-white transition-all uppercase">EDIT</button>
                       <button onClick={() => handleDelete(item.id)} className="flex-1 py-3 bg-rose-50 text-rose-400 rounded-xl text-[9px] font-black hover:bg-rose-600 hover:text-white transition-all uppercase">HAPUS</button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
        )}
      </main>

      {/* Shared Modal Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[1000] flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-zoom-in max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
             <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-rose-600"><i className="fa-solid fa-xmark text-xl"></i></button>

             <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-8 uppercase">Editor {formType}</h3>

             <form onSubmit={handleSave} className="space-y-5">
                {['news', 'gallery', 'agenda'].includes(formType) && (
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul / Title</label>
                      <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" required />
                   </div>
                )}

                {['teachers', 'eskul', 'depts'].includes(formType) && (
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama / Program</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" required />
                   </div>
                )}

                {(formType === 'news' || formType === 'agenda' || formType === 'eskul' || formType === 'depts') && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi / Isi</label>
                    <textarea rows={4} value={formData.content || formData.description} onChange={e => setFormData({...formData, content: e.target.value, description: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm" required />
                  </div>
                )}

                {formType === 'agenda' && (
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
                        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs" required />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Lokasi</label>
                        <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs" required />
                     </div>
                  </div>
                )}

                {formType !== 'agenda' && (
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Media Visual (URL)</label>
                    <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs" placeholder="https://..." />
                  </div>
                )}
                
                <div className="flex gap-4 pt-6">
                   <button type="submit" disabled={isSaving} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs tracking-widest shadow-xl hover:bg-blue-700 disabled:opacity-50 uppercase">
                     {isSaving ? "MEMPROSES..." : "SIMPAN DATA"}
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
