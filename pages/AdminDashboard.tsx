
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
  achievementService
} from '../services/supabaseService';
import { NewsItem, GalleryItem, Teacher, AgendaItem, Eskul, TelegramInbox, SiteSettings, Suggestion, Department, User, VisitorLog, Achievement } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<string>(''); 
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({ 
    title: '', content: '', image_url: '', 
    name: '', description: '', icon: 'fa-graduation-cap',
    nip: '', position: '', schedule: '',
    date: '', time: '', location: '',
    rank: '', category: '', year: ''
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
      const [vCount, n, g, t, a, e, i, sug, s, d, u, logs, ach] = await Promise.all([
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
        visitorService.getAll(),
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
      setVisitorLogs(logs);
      setAchievements(ach);
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  const menuItems = [
    { id: 'dashboard', icon: 'fa-gauge-high', label: 'Dashboard', roles: ['admin', 'user'] },
    { id: 'my_id', icon: 'fa-id-card', label: 'Kartu Pelajar', roles: ['admin', 'user'] },
    { id: 'news', icon: 'fa-newspaper', label: 'Berita', roles: ['admin', 'user'] },
    { id: 'achievements', icon: 'fa-trophy', label: 'Prestasi', roles: ['admin', 'user'] },
    { id: 'gallery', icon: 'fa-images', label: 'Galeri', roles: ['admin', 'user'] },
    { id: 'agenda', icon: 'fa-calendar-days', label: 'Agenda', roles: ['admin', 'user'] },
    { id: 'eskul', icon: 'fa-basketball', label: 'Eskul', roles: ['admin', 'user'] },
    { id: 'depts', icon: 'fa-building-columns', label: 'Jurusan', roles: ['admin'] },
    { id: 'teachers', icon: 'fa-chalkboard-user', label: 'Guru', roles: ['admin'] },
    { id: 'users', icon: 'fa-users-gear', label: 'Daftar Pengguna', roles: ['admin'] },
    { id: 'settings', icon: 'fa-gear', label: 'Pengaturan', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(currentUser?.role || ''));

  const selectTab = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
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
      setFormData({ title: '', content: '', image_url: '', name: '', description: '', icon: 'fa-graduation-cap', nip: '', position: '', schedule: '', date: '', time: '', location: '', rank: '', category: '', year: new Date().getFullYear().toString() });
      setPreviewUrl(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalImageUrl = formData.image_url;
      if (selectedFile) finalImageUrl = await galleryService.uploadImage(selectedFile);
      const payload = { ...formData, image_url: finalImageUrl };

      if (formType === 'achievements') await achievementService.save(payload);
      else if (formType === 'news') editingItem ? await newsService.update(editingItem.id, payload) : await newsService.create({ ...payload, author: currentUser?.name || 'User' });
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
    if (activeTab === 'achievements') await achievementService.delete(id);
    else if (activeTab === 'news') await newsService.delete(id);
    else if (activeTab === 'gallery') await galleryService.delete(id);
    else if (activeTab === 'agenda') await agendaService.delete(id);
    else if (activeTab === 'eskul') await eskulService.delete(id);
    else if (activeTab === 'teachers' && isAdmin) await teacherService.delete(id);
    else if (activeTab === 'depts' && isAdmin) await departmentService.delete(id);
    else if (activeTab === 'users' && isAdmin) await authService.deleteUser(id);
    loadAllData();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest text-xs">Loading Console...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Nav Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-[60]">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'}`}></i></button>
      </div>

      {isMobileMenuOpen && <div className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55]" onClick={() => setIsMobileMenuOpen(false)} />}

      <aside className={`w-64 bg-slate-900 text-white fixed h-full overflow-y-auto z-[56] transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:block'}`}>
        <div className="p-8">
           <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xs">S2</div>
              <h2 className="text-xl font-black tracking-tight">Console</h2>
           </div>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Digital Hub v2.0</p>
        </div>
        <nav className="mt-4 px-4 space-y-1.5">
            {filteredMenu.map(menu => (
                <button key={menu.id} onClick={() => selectTab(menu.id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === menu.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                    <div className="flex items-center gap-3"><i className={`fa-solid ${menu.icon} w-5`}></i>{menu.label}</div>
                </button>
            ))}
            <button onClick={() => { authService.logout(); navigate('/admin'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-900/20 mt-8"><i className="fa-solid fa-power-off w-5"></i> Logout</button>
        </nav>
      </aside>

      <main className="md:ml-64 flex-1 p-6 md:p-10 pt-24 md:pt-10">
        <header className="flex justify-between items-center mb-10">
           <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{activeTab.replace('_', ' ')}</h1>
           <div className="flex items-center gap-4">
               <div className="text-right"><p className="text-xs font-black text-slate-900 leading-none mb-1">{currentUser?.name}</p><span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-100 text-blue-600">{currentUser?.role}</span></div>
               <div className="w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 font-black shadow-sm">{currentUser?.name.charAt(0)}</div>
           </div>
        </header>

        {activeTab === 'dashboard' ? (
            <div className="animate-zoom-in grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Online Visitors</div>
                    <div className="text-5xl font-black text-slate-900">{stats.visitors}</div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Achievements</div>
                    <div className="text-5xl font-black text-amber-500">{achievements.length}</div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Platform Users</div>
                    <div className="text-5xl font-black text-blue-600">{users.length}</div>
                </div>
            </div>
        ) : activeTab === 'my_id' ? (
             <div className="flex flex-col items-center justify-center py-20 animate-zoom-in">
                {/* GLASS CARD */}
                <div className="w-full max-w-sm relative group">
                   <div className="absolute inset-0 bg-blue-600 rounded-[2.5rem] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                   <div className="relative bg-white/40 backdrop-blur-xl border border-white/40 p-10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10"><i className="fa-solid fa-id-card text-8xl"></i></div>
                      <div className="flex items-center gap-4 mb-10">
                         <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-sm">S2</div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 leading-none">Identity Card</p>
                            <p className="text-xs font-bold text-slate-900 tracking-tighter">SMKN 2 Tembilahan</p>
                         </div>
                      </div>
                      <div className="flex gap-6 items-start mb-10">
                         <div className="w-24 h-24 bg-white rounded-3xl border-4 border-white shadow-lg overflow-hidden shrink-0">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="w-full h-full object-cover" alt="User" />
                         </div>
                         <div className="min-w-0">
                            <h3 className="text-xl font-black text-slate-900 truncate mb-1">{currentUser?.name}</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Member Since {new Date(currentUser?.created_at || '').getFullYear()}</p>
                            <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">{currentUser?.role}</div>
                         </div>
                      </div>
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Student ID</p>
                            <p className="text-sm font-black text-slate-900 font-mono">#{currentUser?.student_id}</p>
                         </div>
                         <div className="w-14 h-14 bg-white p-1 rounded-xl shadow-sm"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${currentUser?.id}`} alt="QR" /></div>
                      </div>
                   </div>
                </div>
                <button className="mt-12 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all"><i className="fa-solid fa-download mr-2"></i> Simpan Kartu</button>
             </div>
        ) : activeTab === 'achievements' ? (
             <div className="space-y-8 animate-zoom-in">
                <div className="flex justify-end"><button onClick={() => handleOpenModal(null, 'achievements')} className="px-6 py-3 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-100">+ TAMBAH PRESTASI</button></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {achievements.map(ach => (
                     <div key={ach.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col group hover:shadow-2xl transition-all">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-xl mb-4"><i className="fa-solid fa-award"></i></div>
                        <h3 className="text-lg font-black text-slate-900 mb-1">{ach.title}</h3>
                        <p className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">{ach.rank} - {ach.category}</p>
                        <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-50">
                           <span className="text-[10px] font-black text-slate-300 uppercase">{ach.year}</span>
                           <button onClick={() => handleDelete(ach.id)} className="text-rose-400 hover:text-rose-600 transition-colors"><i className="fa-solid fa-trash-can"></i></button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
        ) : activeTab === 'users' && isAdmin ? (
             <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm animate-zoom-in">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                   <h3 className="text-xl font-black uppercase tracking-tight">Daftar Pengguna</h3>
                </div>
                <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="bg-slate-50"><th className="p-6 text-[10px] font-black uppercase text-slate-400">ID</th><th className="p-6 text-[10px] font-black uppercase text-slate-400">Nama</th><th className="p-6 text-[10px] font-black uppercase text-slate-400">Email</th><th className="p-6 text-[10px] font-black uppercase text-slate-400 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-slate-50">{users.map(u => (<tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-6 font-mono text-[10px] text-slate-400">#{u.student_id}</td>
                    <td className="p-6 font-bold text-xs">{u.name}</td>
                    <td className="p-6 font-bold text-xs text-slate-500">{u.email}</td>
                    <td className="p-6 text-right">{u.email !== 'wilka@smkn2.id' && <button onClick={() => handleDelete(u.id)} className="text-rose-400 hover:text-rose-600"><i className="fa-solid fa-trash-can"></i></button>}</td></tr>))}</tbody></table></div>
             </div>
        ) : (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-zoom-in">
               {(activeTab === 'news' ? news : activeTab === 'gallery' ? gallery : activeTab === 'teachers' ? teachers : activeTab === 'eskul' ? eskul : activeTab === 'agenda' ? agenda : departments).map((item: any) => (
                 <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col group hover:shadow-xl transition-all">
                   {item.image_url && <div className="h-44 overflow-hidden"><img src={item.image_url} className="w-full h-full object-cover" alt="Media" /></div>}
                   <div className="p-8 flex flex-col flex-1">
                     <h3 className="font-bold text-slate-900 mb-2">{item.title || item.name}</h3>
                     <div className="mt-auto flex gap-2 pt-4 border-t border-slate-50">
                       <button onClick={() => handleOpenModal(item)} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black hover:bg-blue-600 hover:text-white transition-all uppercase">EDIT</button>
                       <button onClick={() => handleDelete(item.id)} className="flex-1 py-3 bg-rose-50 text-rose-400 rounded-xl text-[9px] font-black hover:bg-rose-600 hover:text-white transition-all uppercase">HAPUS</button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[1000] flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
           <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-zoom-in max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
             <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-8 uppercase">Editor {formType}</h3>
             <form onSubmit={handleSave} className="space-y-5">
                {formType === 'achievements' ? (
                   <>
                    <input type="text" placeholder="Judul Prestasi" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm" required />
                    <div className="grid grid-cols-2 gap-4">
                       <input type="text" placeholder="Juara (Misal: Juara 1)" value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-xs" />
                       <input type="text" placeholder="Kategori (Misal: LKS)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-xs" />
                    </div>
                   </>
                ) : (
                  <>
                    <input type="text" placeholder="Judul / Nama" value={formData.title || formData.name} onChange={e => setFormData({...formData, title: e.target.value, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm" required />
                    <textarea placeholder="Isi / Deskripsi" rows={4} value={formData.content || formData.description} onChange={e => setFormData({...formData, content: e.target.value, description: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm" />
                  </>
                )}
                <div className="flex gap-4 pt-6">
                   <button type="submit" disabled={isSaving} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">{isSaving ? "MEMPROSES..." : "SIMPAN DATA"}</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
