import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { newsService, departmentService, settingsService } from '../services/supabaseService';
import { NewsItem, Department, SiteSettings } from '../types';

const Home: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsData, deptData, settingsData] = await Promise.all([
          newsService.getAll(),
          departmentService.getAll(),
          settingsService.get()
        ]);
        setNews(newsData.slice(0, 3));
        setSiteSettings(settingsData);
        setDepartments(deptData.length > 0 ? deptData : [
          { id: '1', name: 'Teknik Jaringan', description: 'Infrastruktur IT Modern', icon: 'fa-network-wired', image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800', created_at: '' },
          { id: '2', name: 'Akuntansi', description: 'Manajemen Keuangan Digital', icon: 'fa-calculator', image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800', created_at: '' },
          { id: '3', name: 'Tata Boga', description: 'Seni Kuliner Profesional', icon: 'fa-utensils', image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800', created_at: '' }
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return null;

  return (
    <div className="flex flex-col min-h-screen pt-16">
      
      {/* Running Text Info Bar */}
      {siteSettings?.running_text && (
        <div className="bg-brand-50 text-brand-900 border-b border-brand-100 overflow-hidden relative z-10 h-10 flex items-center">
          <div className="bg-brand-600 text-white absolute left-0 z-20 h-full px-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-bell animate-swing"></i> INFO
          </div>
          <div className="whitespace-nowrap animate-marquee pl-32 text-xs font-bold tracking-wide">
            {siteSettings.running_text} &nbsp; • &nbsp; {siteSettings.running_text} &nbsp; • &nbsp; {siteSettings.running_text}
          </div>
        </div>
      )}

      {/* Hero Section - Clean White */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-600 text-[11px] font-bold uppercase tracking-widest mb-8 border border-brand-100">
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
                SMK Pusat Keunggulan
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                Masa Depan <span className="text-brand-600 relative inline-block">
                  Cerah
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
                </span> <br/>Dimulai Di Sini.
              </h1>
              <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                {siteSettings?.sub_welcome_text || 'Mencetak generasi unggul yang kompeten, berkarakter, dan siap bersaing di dunia industri global.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/contact" className="px-10 py-4 bg-brand-600 text-white rounded-full font-bold shadow-xl shadow-brand-200 hover:bg-brand-700 hover:-translate-y-1 transition-all">
                  Daftar Sekarang
                </Link>
                <Link to="/profile" className="px-10 py-4 bg-white text-brand-700 border border-brand-200 rounded-full font-bold hover:bg-brand-50 transition-all flex items-center justify-center gap-2">
                  <i className="fa-regular fa-circle-play"></i> Profil Sekolah
                </Link>
              </div>
            </div>
            
            <div className="relative lg:h-[600px] animate-slide-up" style={{animationDelay: '0.2s'}}>
               <div className="absolute top-0 right-0 w-3/4 h-full bg-brand-50 rounded-[3rem] -z-10 transform rotate-3"></div>
               <img 
                 src={siteSettings?.hero_image_url} 
                 className="w-full h-full object-cover rounded-[2.5rem] shadow-2xl shadow-slate-200 border-4 border-white" 
                 alt="Students"
                 onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200' }} 
               />
               
               {/* Float Card */}
               <div className="absolute -bottom-8 -left-4 bg-white p-6 rounded-2xl shadow-xl border border-slate-50 hidden md:block">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl">
                        <i className="fa-solid fa-user-graduate"></i>
                     </div>
                     <div>
                        <p className="text-sm text-slate-500 font-bold">Lulusan Terbaik</p>
                        <p className="text-2xl font-black text-slate-900">98%</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Blue Band */}
      <section className="bg-brand-900 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-brand-800/50">
            {[
              { label: 'Siswa Aktif', value: '1,200+' },
              { label: 'Guru & Staf', value: '85+' },
              { label: 'Mitra Industri', value: '50+' },
              { label: 'Prestasi', value: '120+' },
            ].map((stat, idx) => (
              <div key={idx} className="p-4">
                <div className="text-4xl lg:text-5xl font-black mb-2 tracking-tight">{stat.value}</div>
                <div className="text-brand-200 text-sm font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs / Majors */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-600 font-black text-xs uppercase tracking-[0.2em]">Program Keahlian</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-3 mb-6">Pilih Jalur Masa Depanmu</h2>
            <p className="text-slate-500 leading-relaxed">Kurikulum berbasis industri yang dirancang untuk memastikan setiap lulusan memiliki kompetensi yang dibutuhkan dunia kerja.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-white rounded-3xl p-2 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="h-48 overflow-hidden rounded-2xl relative">
                  <img src={dept.image_url} alt={dept.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-brand-600 shadow-md">
                    <i className={`fa-solid ${dept.icon}`}></i>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{dept.name}</h3>
                  <p className="text-sm text-slate-500 mb-6 line-clamp-2">{dept.description}</p>
                  <Link to="/departments" className="inline-flex items-center text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors">
                    Pelajari Selengkapnya <i className="fa-solid fa-arrow-right ml-2"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News & Updates */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Berita Terbaru</h2>
              <p className="text-slate-500">Kabar terkini dari lingkungan SMKN 2 Tembilahan.</p>
            </div>
            <Link to="/news" className="hidden md:flex px-6 py-3 bg-slate-50 text-slate-600 rounded-full font-bold text-sm hover:bg-slate-100 transition-colors">
              Lihat Semua Berita
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item) => (
              <article key={item.id} className="group cursor-pointer">
                <div className="rounded-2xl overflow-hidden mb-5 relative aspect-video">
                   <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div className="absolute bottom-4 left-4 bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                   </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2 leading-tight">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed mb-4">{item.content}</p>
                <span className="text-xs font-bold text-brand-600 uppercase tracking-widest group-hover:underline">Baca Selengkapnya</span>
              </article>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
             <Link to="/news" className="px-8 py-3 bg-slate-100 text-slate-700 rounded-full font-bold text-sm">Lihat Semua Berita</Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto bg-brand-600 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl shadow-brand-200">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
             <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Siap Bergabung?</h2>
             <p className="text-brand-100 text-lg mb-10 font-medium">Pendaftaran Peserta Didik Baru (PPDB) Tahun Ajaran 2026/2027 telah dibuka. Segera daftarkan dirimu.</p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact" className="px-8 py-4 bg-white text-brand-600 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">Hubungi Panitia</Link>
                <Link to="/profile" className="px-8 py-4 bg-brand-700 text-white border border-brand-500 rounded-full font-bold hover:bg-brand-800 transition-all">Info Persyaratan</Link>
             </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;