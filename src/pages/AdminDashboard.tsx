
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
import { NewsItem, GalleryItem, Teacher, AgendaItem, Eskul, TelegramInbox, SiteSettings, Suggestion, Department } from '../types';

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
  const [departments, setDepartments] = useState<Department[]>([]);

  // UI States
  const [showToken, setShowToken] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<string>(''); 
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    title: '', content: '', image_url: '', 
    name: '', description: '', icon: 'fa-graduation-cap',
    nip: '', position: '', schedule: '',
    date: '', time: '', location: ''
  });

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

  const handleLogout = () => {
    if(confirm("Apakah Anda yakin ingin keluar?")) {
      authService.logout();
      navigate('/admin');
    }
  };

  const handleOpenModal = (item: any = null, type: string | null = null) => {
    setSelectedFile(null);
    const targetType = type || activeTab;
    setFormType(targetType);

    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        content: item.content || '',
        image_url: item.image_url || '',
        name: item.name || '',
        description: item.description || '',
        icon: item.icon || 'fa-graduation-cap',
        nip: item.nip || '',
        position: item.position || '',
        schedule: item.schedule || '',
        date: item.date || '',
        time: item.time || '',
        location: item.location || ''
      });
      setPreviewUrl(item.image_url || null);
    } else {
      setEditingItem(null);
      setFormData({ 
        title: '', content: '', image_url: '', 
        name: '', description: '', icon: 'fa-graduation-cap',
        nip: '', position: '', schedule: '',
        date: '', time: '', location: ''
      });
      setPreviewUrl(null);
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData({ ...formData, image_url: '' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalImageUrl = formData.image_url;
      if (selectedFile) {
        finalImageUrl = await galleryService.uploadImage(selectedFile);
      }

      const payload: any = { ...formData, image_url: finalImageUrl };

      if (formType === 'news') {
        if (editingItem) await newsService.update(editingItem.id, payload);
        else await newsService.create({ ...payload, author: 'Admin' });
      } else if (formType === 'gallery') {
        if (editingItem) await galleryService.update(editingItem.id, payload);
        else await galleryService.add({ ...payload, author: 'Admin' });
      } else if (formType === 'teachers') {
        if (editingItem) await teacherService.update(editingItem.id, payload);
        else await teacherService.save(payload);
      } else if (formType === 'eskul') {
        if (editingItem) await eskulService.update(editingItem.id, payload);
        else await eskulService.save(payload);
      } else if (formType === 'agenda') {
        if (editingItem) await agendaService.update(editingItem.id, payload);
        else await agendaService.save(payload);
      } else if (formType === 'depts') {
        if (editingItem) await departmentService.update(editingItem.id, payload);
        else await departmentService.save(payload);
      }

      setIsModalOpen(false);
      loadAllData();
      alert("Berhasil disimpan!");
    } catch (err) {
      alert("Gagal menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if(!confirm("Yakin ingin menghapus item ini?")) return;
    try {
      if(activeTab === 'news') await newsService.delete(id);
      else if(activeTab === 'gallery') await galleryService.delete(id);
      else if(activeTab === 'teachers') await teacherService.delete(id);
      else if(activeTab === 'eskul') await eskulService.delete(id);
      else if(activeTab === 'agenda') await agendaService.delete(id);
      else if(activeTab === 'depts') await departmentService.delete(id);
      loadAllData();
    } catch (err) { alert("Gagal menghapus."); }
  };

  const handlePostFromInbox = async (item: TelegramInbox, type: 'news' | 'gallery') => {
    const title = prompt(`Judul untuk ${type}:`, `Kiriman dari ${item.sender_name}`);
    if (!title) return;
    
    if (type === 'news') {
      await newsService.create({ title, content: item.message_text, image_url: item.image_url || '', author: item.sender_name });
    } else {
      await galleryService.add({ title, description: item.message_text, image_url: item.image_url || '', author: item.sender_name });
    }
    await telegramService.deleteInboxItem(item.id);
    loadAllData();
    alert("Berhasil diposting!");
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Wilka Console Loading...</p>
    </div>
  );

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
            {[
                { id: 'dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
                { id: 'news', icon: 'fa-newspaper', label: 'Berita' },
                { id: 'gallery', icon: 'fa-images', label: 'Galeri' },
                { id: 'depts', icon: 'fa-building-columns', label: 'Jurusan' },
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
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === menu.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
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
               {['news', 'gallery', 'teachers', 'eskul', 'agenda', 'depts'].includes(activeTab) && (
                  <button onClick={() => handleOpenModal()} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                    + TAMBAH DATA
                  </button>
               )}
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-slate-900">{authService.getCurrentUser()?.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">System Administrator</p>
                </div>
                <div className="w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 font-black shadow-sm">
                    {authService.getCurrentUser()?.name.charAt(0)}
                </div>
            </div>
        </header>

        {activeTab === 'dashboard' ? (
             <div className="animate-zoom-in space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-users text-7xl text-slate-900"></i>
                        </div>
                        <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Live Visitors</div>
                        <div className="text-5xl font-black text-slate-900">{stats.visitors}</div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-newspaper text-7xl text-blue-600"></i>
                        </div>
                        <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Total Articles</div>
                        <div className="text-5xl font-black text-blue-600">{stats.news}</div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-images text-7xl text-purple-600"></i>
                        </div>
                        <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Gallery Photos</div>
                        <div className="text-5xl font-black text-purple-600">{stats.gallery}</div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Quick Action Center */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                           <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                           Aksi Cepat
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleOpenModal(null, 'news')} className="p-8 rounded-3xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all border border-blue-100 flex flex-col items-center gap-3 group">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-xl"><i className="fa-solid fa-pen-nib"></i></div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Update Berita</span>
                            </button>
                            <button onClick={() => handleOpenModal(null, 'gallery')} className="p-8 rounded-3xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all border border-purple-100 flex flex-col items-center gap-3 group">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-xl"><i className="fa-solid fa-camera-retro"></i></div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Koleksi Foto</span>
                            </button>
                            <button onClick={() => handleOpenModal(null, 'agenda')} className="p-8 rounded-3xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 flex flex-col items-center gap-3 group">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-xl"><i className="fa-solid fa-calendar-day"></i></div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Buat Agenda</span>
                            </button>
                            <button onClick={() => setActiveTab('settings')} className="p-8 rounded-3xl bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all border border-slate-200 flex flex-col items-center gap-3 group">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-xl"><i className="fa-solid fa-gear"></i></div>
                                <span className="text-[10px] font-black uppercase tracking-widest">System Set</span>
                            </button>
                        </div>
                    </div>

                    {/* Live Activity Feed */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                               <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                               Aktivitas Terbaru
                            </h3>
                            <button onClick={() => setActiveTab('tele_inbox')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all">Lihat Inbox</button>
                        </div>
                        <div className="space-y-4 flex-grow">
                            {([...teleInbox.slice(0, 3), ...suggestions.slice(0, 2)]).length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10">
                                   <i className="fa-solid fa-bell-slash text-4xl mb-4 opacity-20"></i>
                                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">Belum Ada Notifikasi</p>
                                </div>
                            ) : (
                                [...teleInbox.slice(0, 3).map(i => ({...i, type: 'telegram'})), ...suggestions.slice(0, 2).map(s => ({...s, type: 'suggestion'}))]
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                .map((item: any, idx) => (
                                    <div key={idx} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${item.type === 'telegram' ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'}`}>
                                            <i className={`fa-solid ${item.type === 'telegram' ? 'fa-telegram' : 'fa-lightbulb'}`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-xs font-black text-slate-900 truncate">{item.sender_name || item.name || 'Anonymous'}</p>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter shrink-0 ml-2">{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 line-clamp-1 font-medium italic opacity-80">"{item.message_text || item.content}"</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
             </div>
        ) : activeTab === 'tele_inbox' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-zoom-in">
              {teleInbox.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200 text-4xl"><i className="fa-solid fa-inbox"></i></div>
                   <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tighter">Inbox Kosong</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bot Telegram belum menerima pesan baru</p>
                </div>
              ) : (
                teleInbox.map(item => (
                  <div key={item.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col hover:shadow-2xl transition-all">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100"><i className="fa-brands fa-telegram"></i></div>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.sender_name}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                     </div>
                     
                     {item.image_url && (
                        <div className="h-48 mb-6 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                            <img src={item.image_url} className="w-full h-full object-cover" alt="Telegram Attachment" />
                        </div>
                     )}

                     <p className="text-xs font-bold text-slate-700 mb-8 leading-relaxed line-clamp-6 flex-grow">"{item.message_text}"</p>
                     
                     <div className="space-y-2">
                        <div className="flex gap-2">
                            <button onClick={() => handlePostFromInbox(item, 'news')} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all">POST BERITA</button>
                            <button onClick={() => handlePostFromInbox(item, 'gallery')} className="flex-1 py-3 bg-indigo-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 transition-all">POST GALERI</button>
                        </div>
                        <button onClick={() => telegramService.deleteInboxItem(item.id).then(loadAllData)} className="w-full py-2.5 text-rose-500 font-bold text-[9px] uppercase tracking-widest hover:bg-rose-50 rounded-xl">ABAIKAN PESAN</button>
                     </div>
                  </div>
                ))
              )}
            </div>
        ) : (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-zoom-in">
               {(activeTab === 'news' ? news : activeTab === 'gallery' ? gallery : activeTab === 'teachers' ? teachers : activeTab === 'eskul' ? eskul : activeTab === 'agenda' ? agenda : departments).map(item => (
                 <div key={item.id} className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col group hover:shadow-2xl transition-all duration-500">
                   {/* Card Visuals */}
                   {['news', 'gallery', 'teachers', 'eskul', 'depts'].includes(activeTab) && (item as any).image_url ? (
                      <div className="h-48 overflow-hidden relative">
                         <img src={(item as any).image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Thumbnail" />
                         {activeTab === 'teachers' && <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>}
                      </div>
                   ) : activeTab === 'agenda' ? (
                      <div className="p-8 pb-0">
                         <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex flex-col items-center justify-center font-black shadow-lg shadow-indigo-100">
                            <span className="text-xl leading-none">{new Date((item as AgendaItem).date).getDate()}</span>
                            <span className="text-[9px] uppercase">{new Date((item as AgendaItem).date).toLocaleString('id-ID', { month: 'short' })}</span>
                         </div>
                      </div>
                   ) : null}
                   
                   <div className="p-8 flex flex-col flex-1">
                     <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 leading-tight">{(item as any).title || (item as any).name}</h3>
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">
                        {(item as any).position || (item as any).schedule || (item as any).location || 'Konten Aktif'}
                     </p>
                     
                     <div className="mt-auto flex gap-2 pt-4 border-t border-slate-50">
                       <button onClick={() => handleOpenModal(item)} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest">EDIT</button>
                       <button onClick={() => handleDeleteItem(item.id)} className="flex-1 py-3 bg-rose-50 text-rose-400 rounded-xl text-[9px] font-black hover:bg-rose-600 hover:text-white transition-all uppercase tracking-widest">HAPUS</button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
        )}

      </main>

      {/* Modal Editor System */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[1000] flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-zoom-in max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
             <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-800 rounded-full hover:bg-rose-600 hover:text-white transition-all shadow-md"><i className="fa-solid fa-xmark"></i></button>

             <div className="flex items-center gap-4 mb-10">
               <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
               <div>
                 <h3 className="text-2xl font-black tracking-tight text-slate-900">System Editor</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Modul: {formType.replace('_', ' ')}</p>
               </div>
             </div>

             <form onSubmit={handleSave} className="space-y-5">
                {/* Dynamic Form Fields */}
                {['news', 'gallery', 'agenda'].includes(formType) && (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Utama</label>
                      <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" required />
                   </div>
                )}

                {['teachers', 'eskul', 'depts'].includes(formType) && (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap / Program</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" required />
                   </div>
                )}

                {formType === 'news' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konten Berita</label>
                    <textarea rows={4} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm" required />
                  </div>
                )}

                {['teachers', 'gallery', 'eskul', 'depts', 'agenda'].includes(formType) && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi / Keterangan</label>
                    <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm" required />
                  </div>
                )}

                {formType === 'teachers' && (
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIP</label>
                        <input type="text" value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jabatan</label>
                        <input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm" required />
                     </div>
                  </div>
                )}

                {formType === 'agenda' && (
                  <div className="grid grid-cols-3 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
                        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold" required />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jam</label>
                        <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold" required />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lokasi</label>
                        <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold" required />
                     </div>
                  </div>
                )}

                {formType !== 'agenda' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Media Visual</label>
                    <div onClick={() => document.getElementById('fileUpload')?.click()} className="w-full min-h-[140px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-all group overflow-hidden relative">
                      {previewUrl ? (
                        <img src={previewUrl} className="w-full h-full object-cover absolute inset-0 opacity-70 group-hover:opacity-100 transition-opacity" alt="Preview" />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400">
                           <i className="fa-solid fa-cloud-arrow-up text-2xl mb-2"></i>
                           <p className="text-[9px] font-black uppercase tracking-widest">Klik untuk upload gambar</p>
                        </div>
                      )}
                    </div>
                    <input type="file" id="fileUpload" onChange={handleFileChange} className="hidden" accept="image/*" />
                    <input type="text" placeholder="Atau paste URL gambar..." value={formData.image_url} onChange={e => {setFormData({...formData, image_url: e.target.value}); setPreviewUrl(e.target.value || null);}} className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 outline-none" />
                  </div>
                )}
                
                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black text-[10px] tracking-widest hover:bg-rose-600 hover:text-white transition-all uppercase">Batal</button>
                   <button type="submit" disabled={isSaving} className="flex-[2] py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-[10px] tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 uppercase flex items-center justify-center gap-2">
                     {isSaving ? "Sedang Memproses..." : "Simpan Perubahan"}
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
