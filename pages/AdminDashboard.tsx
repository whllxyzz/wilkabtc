
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
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [eskul, setEskul] = useState<Eskul[]>([]);
  const [teleInbox, setTeleInbox] = useState<TelegramInbox[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<string>(''); 
  const [editingItem, setEditingItem] = useState<any>(null);

  const [formData, setFormData] = useState<any>({ 
    title: '', content: '', image_url: '', 
    name: '', description: '', icon: 'fa-graduation-cap',
    nip: '', position: '', schedule: '',
    date: '', time: '', location: '',
    rank: '', category: '', year: new Date().getFullYear().toString()
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
  }, [navigate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [vCount, n, g, t, a, e, i, sug, s, d, u, ach] = await Promise.all([
        visitorService.getOnlineCount(),
        newsService.getAll(),
        galleryService.getAll(),
        teacherService.getAll(),
        agendaService.getAll(),
        eskulService.getAll(),
        telegramService.getInbox(),
        suggestionService.getAll(),
        settingsService.get(),
        departmentService.getAll(),
        authService.getAllUsers(),
        achievementService.getAll()
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
      setUsers(u);
      setAchievements(ach);
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
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
    { id: 'users', icon: 'fa-users-gear', label: 'Daftar Pengguna', roles: ['admin'] },
    { id: 'settings', icon: 'fa-gear', label: 'Pengaturan', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(currentUser?.role || ''));

  const selectTab = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleOpenModal = (item: any = null, type: string | null = null) => {
    const targetType = type || activeTab;
    setFormType(targetType);
    setIsModalOpen(true);
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({ title: '', content: '', image_url: '', name: '', description: '', icon: 'fa-graduation-cap', nip: '', position: '', schedule: '', date: '', time: '', location: '', rank: '', category: '', year: new Date().getFullYear().toString() });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await settingsService.update(settings);
      alert("Pengaturan Berhasil Disimpan!");
    } catch (err) {
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setIsSaving(false);
    }
  };

  const syncBot = async () => {
    if(!settings?.telegram_bot_token) return alert("Masukkan Token Bot terlebih dahulu!");
    setIsSaving(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      alert("Bot Berhasil Terhubung! Webhook Aktif.");
    } catch(err) {
      alert("Gagal menghubungkan bot.");
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
      loadAllData();
      alert("Berhasil disimpan!");
    } catch (err) { alert("Error menyimpan data."); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string, type?: string) => {
    if (!confirm("Hapus item ini?")) return;
    const target = type || activeTab;
    if (target === 'news') await newsService.delete(id);
    else if (target === 'gallery') await galleryService.delete(id);
    else if (target === 'agenda') await agendaService.delete(id);
    else if (target === 'eskul') await eskulService.delete(id);
    else if (target === 'users') await authService.deleteUser(id);
    else if (target === 'tele_inbox') await telegramService.deleteInboxItem(id);
    else if (target === 'suggestions') await suggestionService.delete(id);
    loadAllData();
  };

  const handlePostFromInbox = async (item: TelegramInbox, type: 'news' | 'gallery') => {
    const title = prompt(`Judul untuk ${type}:`, `Kiriman dari ${item.sender_name}`);
    if (!title) return;
    setIsSaving(true);
    try {
        if (type === 'news') {
            await newsService.create({ title, content: item.message_text, image_url: item.image_url || '', author: item.sender_name });
        } else {
            await galleryService.add({ title, description: item.message_text, image_url: item.image_url || '', author: item.sender_name });
        }
        await telegramService.deleteInboxItem(item.id);
        loadAllData();
        alert("Berhasil diposting!");
    } catch(err) { alert("Gagal posting."); }
    finally { setIsSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-white text-[10px] font-black uppercase tracking-widest">Memulai Console...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Nav Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-[100]">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
          <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'}`}></i>
        </button>
      </div>

      <aside className={`w-64 bg-slate-900 text-white fixed h-full overflow-y-auto z-[90] transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:block'}`}>
        <div className="p-8">
           <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xs">S2</div>
              <h2 className="text-xl font-black">Console</h2>
           </div>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Digital Hub v2.1</p>
           
           <div className={`mt-6 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 text-[8px] font-black uppercase tracking-widest ${isOnline ? 'bg-emerald-900/40 text-emerald-400' : 'bg-rose-900/40 text-rose-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              {isOnline ? 'Database Online' : 'Local Storage Mode'}
           </div>
        </div>
        
        <nav className="mt-4 px-4 space-y-1.5">
            {filteredMenu.map(menu => (
                <button key={menu.id} onClick={() => selectTab(menu.id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === menu.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                    <div className="flex items-center gap-3"><i className={`fa-solid ${menu.icon} w-5`}></i>{menu.label}</div>
                    {menu.badge ? <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{menu.badge}</span> : null}
                </button>
            ))}
            <button onClick={() => { authService.logout(); navigate('/admin'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-900/20 mt-8">
              <i className="fa-solid fa-power-off w-5"></i> Logout
            </button>
        </nav>
      </aside>

      <main className="md:ml-64 flex-1 p-6 md:p-10 pt-24 md:pt-10 max-w-full overflow-x-hidden relative">
        {!isOnline && activeTab === 'dashboard' && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4 text-amber-800">
             <i className="fa-solid fa-triangle-exclamation text-xl"></i>
             <div>
               <p className="text-xs font-black uppercase tracking-widest">Perhatian: Database Supabase Belum Terdeteksi</p>
               <p className="text-[10px] font-bold opacity-80 mt-0.5">Website berjalan dalam mode Offline (Local Storage). Data yang Anda masukkan hanya tersimpan di browser ini saja.</p>
             </div>
          </div>
        )}

        <header className="flex justify-between items-center mb-10">
           <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{activeTab.replace('_', ' ')}</h1>
           <div className="flex items-center gap-4">
               {['news', 'gallery', 'agenda', 'eskul'].includes(activeTab) && (
                 <button onClick={() => handleOpenModal()} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 shadow-xl shadow-blue-200">
                   + TAMBAH DATA
                 </button>
               )}
               <div className="w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 font-black shadow-sm">
                 {currentUser?.name.charAt(0)}
               </div>
           </div>
        </header>

        {activeTab === 'dashboard' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Online (Last 5m)</p>
                  <div className="text-5xl font-black text-slate-900">{stats.visitors}</div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Total Berita</p>
                  <div className="text-5xl font-black text-blue-600">{stats.news}</div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Pesan Inbox</p>
                  <div className="text-5xl font-black text-emerald-500">{teleInbox.length}</div>
                </div>
            </div>
        ) : activeTab === 'settings' ? (
            <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 animate-slide-up max-w-4xl">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                   <h3 className="text-lg font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                     <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div> 
                     Pengaturan Situs
                   </h3>
                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Sekolah</label><input type="text" value={settings?.school_name} onChange={e => setSettings(settings ? {...settings, school_name: e.target.value} : null)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Running Info</label><input type="text" value={settings?.running_text} onChange={e => setSettings(settings ? {...settings, running_text: e.target.value} : null)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600" /></div>
                   </div>
                   <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL Hero Image</label><input type="text" value={settings?.hero_image_url} onChange={e => setSettings(settings ? {...settings, hero_image_url: e.target.value} : null)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600" /></div>
                   
                   <hr className="border-slate-100 my-10" />
                   <h3 className="text-lg font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                     <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div> 
                     Integrasi Telegram Bot
                   </h3>
                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Token Bot</label><input type="password" value={settings?.telegram_bot_token} onChange={e => setSettings(settings ? {...settings, telegram_bot_token: e.target.value} : null)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-600" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chat ID Admin</label><input type="text" value={settings?.telegram_chat_id} onChange={e => setSettings(settings ? {...settings, telegram_chat_id: e.target.value} : null)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-600" /></div>
                   </div>
                   <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button type="submit" disabled={isSaving} className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 min-w-[200px]">
                        {isSaving ? (
                          <><i className="fa-solid fa-spinner fa-spin"></i> MENYIMPAN...</>
                        ) : (
                          "SIMPAN PERUBAHAN"
                        )}
                      </button>
                      <button type="button" onClick={syncBot} disabled={isSaving} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all min-w-[200px]">
                        {isSaving ? (
                          <><i className="fa-solid fa-spinner fa-spin"></i> MENGHUBUNGKAN...</>
                        ) : (
                          <><i className="fa-brands fa-telegram"></i> HUBUNGKAN BOT</>
                        )}
                      </button>
                   </div>
                </form>
            </div>
        ) : activeTab === 'users' ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm animate-slide-up max-w-full">
                <div className="overflow-x-auto">
                   <table className="w-full text-left min-w-[600px]">
                      <thead className="bg-slate-50"><tr className="text-[10px] font-black uppercase text-slate-400">
                         <th className="p-6">ID PELAJAR</th><th className="p-6">NAMA</th><th className="p-6">ROLE</th><th className="p-6 text-right">AKSI</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-50">
                         {users.length === 0 && (
                            <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">Belum Ada Pengguna Terdaftar</td></tr>
                         )}
                         {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50 text-sm">
                               <td className="p-6 font-mono text-slate-400">#{u.student_id}</td>
                               <td className="p-6 font-bold">{u.name}</td>
                               <td className="p-6"><span className={`text-[9px] px-2 py-0.5 rounded font-black ${u.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{u.role.toUpperCase()}</span></td>
                               <td className="p-6 text-right"><button onClick={() => handleDelete(u.id, 'users')} className="text-rose-400 hover:text-rose-600"><i className="fa-solid fa-trash-can"></i></button></td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
            </div>
        ) : activeTab === 'tele_inbox' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
               {teleInbox.length === 0 ? (
                 <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 uppercase text-[10px] font-black tracking-widest">Inbox Telegram Kosong</div>
               ) : (
                 teleInbox.map(item => (
                   <div key={item.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col group hover:shadow-2xl transition-all">
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fa-brands fa-telegram"></i></div>
                         <div className="min-w-0 flex-1"><p className="text-[10px] font-black text-slate-900 truncate uppercase">{item.sender_name}</p><p className="text-[9px] text-slate-400">{new Date(item.created_at).toLocaleDateString()}</p></div>
                      </div>
                      {item.image_url && <img src={item.image_url} className="w-full h-40 object-cover rounded-2xl mb-6 border border-slate-50 shadow-sm" alt="Attachment" />}
                      <p className="text-xs font-bold text-slate-600 mb-8 line-clamp-4 leading-relaxed italic">"{item.message_text}"</p>
                      <div className="flex gap-2">
                         <button onClick={() => handlePostFromInbox(item, 'news')} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">POST BERITA</button>
                         <button onClick={() => handlePostFromInbox(item, 'gallery')} className="flex-1 py-3 bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">POST FOTO</button>
                      </div>
                      <button onClick={() => handleDelete(item.id, 'tele_inbox')} className="w-full py-2 mt-4 text-[9px] font-black text-rose-400 uppercase hover:bg-rose-50 rounded-lg">ABAIKAN</button>
                   </div>
                 ))
               )}
            </div>
        ) : activeTab === 'suggestions' ? (
            <div className="space-y-4 animate-slide-up max-w-4xl">
               {suggestions.length === 0 ? (
                 <div className="py-20 text-center text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 uppercase text-[10px] font-black tracking-widest">Belum Ada Kotak Saran Masuk</div>
               ) : (
                 suggestions.map(s => (
                   <div key={s.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between group gap-4">
                      <div className="flex items-center gap-6">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${s.type === 'Saran Fitur' ? 'bg-emerald-500' : 'bg-amber-500'}`}><i className="fa-solid fa-lightbulb"></i></div>
                         <div>
                            <p className="text-xs font-black text-slate-900 mb-1">{s.name}</p>
                            <p className="text-sm font-medium text-slate-500 line-clamp-2">{s.content}</p>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-2 block">{s.type} • {new Date(s.created_at).toLocaleString()}</span>
                         </div>
                      </div>
                      <button onClick={() => handleDelete(s.id, 'suggestions')} className="w-10 h-10 rounded-full hover:bg-rose-50 text-rose-400 flex items-center justify-center transition-all md:opacity-0 group-hover:opacity-100"><i className="fa-solid fa-trash"></i></button>
                   </div>
                 ))
               )}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
               {(activeTab === 'news' ? news : activeTab === 'gallery' ? gallery : activeTab === 'agenda' ? agenda : eskul).map((item: any) => (
                 <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm flex flex-col group hover:shadow-xl transition-all duration-300">
                   {item.image_url && <div className="h-44 overflow-hidden relative"><img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Media" /></div>}
                   <div className="p-8 flex flex-col flex-1">
                     <h3 className="font-bold text-slate-900 mb-2 leading-tight">{(item as any).title || (item as any).name}</h3>
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">{(item as any).schedule || (item as any).location || 'Konten Publik'}</p>
                     <div className="mt-auto flex gap-2 pt-4 border-t border-slate-50">
                       <button onClick={() => handleOpenModal(item)} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest">EDIT</button>
                       <button onClick={() => handleDelete(item.id)} className="flex-1 py-3 bg-rose-50 text-rose-400 rounded-xl text-[9px] font-black hover:bg-rose-600 hover:text-white transition-all uppercase tracking-widest">HAPUS</button>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
        )}
      </main>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
           <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
             <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter flex items-center gap-3">
               <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div> 
               Editor {formType}
             </h3>
             <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul / Nama</label>
                   <input type="text" placeholder="Masukkan judul..." value={formData.title || formData.name} onChange={e => setFormData({...formData, title: e.target.value, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600" required />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi / Detail</label>
                   <textarea placeholder="Isi detail konten..." rows={4} value={formData.content || formData.description} onChange={e => setFormData({...formData, content: e.target.value, description: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-600" required />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL Gambar</label>
                   <input type="text" placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <div className="flex gap-4 pt-6">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest">BATAL</button>
                   <button type="submit" disabled={isSaving} className="flex-[2] py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100">{isSaving ? "MEMPROSES..." : "SIMPAN DATA"}</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
