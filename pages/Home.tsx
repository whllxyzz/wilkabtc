
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { newsService, departmentService, settingsService, achievementService } from '../services/supabaseService';
import { NewsItem, Department, SiteSettings, Achievement } from '../types';

const Home: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsData, deptData, settingsData, achvData] = await Promise.all([
          newsService.getAll(),
          departmentService.getAll(),
          settingsService.get(),
          achievementService.getAll()
        ]);
        setNews(newsData.slice(0, 3));
        setSiteSettings(settingsData);
        setAchievements(achvData.slice(0, 4));
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
    <div className="flex flex-col min-h-screen pt-16 bg-white">
      
      {/* Running Text Info Bar */}
      {siteSettings?.running_text && (
        <div className="bg-brand-50 text-brand-900 border-b border-brand-100 overflow-hidden relative z-10 h-10 flex items-center">
          <div className="bg-brand-600 text-white absolute left-0 z-20 h-full px-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-bell animate-swing"></i> INFO
          </div>
          <div className="whitespace-nowrap animate-marquee pl-32 text-xs font-bold tracking-wide">
            {siteSettings.running_text} &nbsp; • &nbsp; {siteSettings.running_text}
          </div>
        </div>
      )}

      {/* Hero Section */}
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
                <Link to="/matcher" className="px-10 py-4 bg-brand-600 text-white rounded-full font-bold shadow-xl shadow-brand-200 hover:bg-brand-700 hover:-translate-y-1 transition-all flex items-center gap-2">
                  <i className="fa-solid fa-magic"></i> Cek Jurusan AI
                </Link>
                <Link to="/contact" className="px-10 py-4 bg-white text-brand-700 border border-brand-200 rounded-full font-bold hover:bg-brand-50 transition-all flex items-center justify-center gap-2">
                  PPDB 2026/2027
                </Link>
              </div>
            </div>
            
            <div className="relative lg:h-[600px] animate-slide-up">
               <div className="absolute top-0 right-0 w-3/4 h-full bg-brand-50 rounded-[3rem] -z-10 transform rotate-3"></div>
               <img src={siteSettings?.hero_image_url} className="w-full h-full object-cover rounded-[2.5rem] shadow-2xl border-4 border-white" alt="Students" />
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Spotlight */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-end mb-16">
             <div>
                <span className="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Our Pride</span>
                <h2 className="text-4xl font-black tracking-tight">Prestasi & Kebanggaan</h2>
             </div>
             <p className="text-slate-400 text-sm max-w-xs text-right hidden md:block">SMKN 2 Tembilahan konsisten mencetak juara di berbagai ajang kompetisi.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {achievements.map((ach) => (
              <div key={ach.id} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur hover:bg-white/10 transition-all group">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-xl shadow-blue-900/40 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-trophy"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">{ach.title}</h3>
                <p className="text-blue-400 font-black text-[10px] uppercase tracking-widest">{ach.rank} - {ach.category}</p>
                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center opacity-60">
                   <span className="text-[10px] font-bold">{ach.year}</span>
                   <i className="fa-solid fa-medal"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-600 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center lg:divide-x divide-white/20">
            {[
              { label: 'Siswa Aktif', value: '1,200+' },
              { label: 'Guru & Staf', value: '85+' },
              { label: 'Mitra Industri', value: '50+' },
              { label: 'Prestasi', value: '120+' },
            ].map((stat, idx) => (
              <div key={idx} className="p-4">
                <div className="text-4xl lg:text-5xl font-black mb-2 tracking-tight">{stat.value}</div>
                <div className="text-white/60 text-[10px] font-black uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Major Matcher Callout */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-blue-100 flex flex-col md:flex-row items-center gap-10">
              <div className="w-40 h-40 bg-blue-600 text-white rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl shadow-blue-200 shrink-0">
                 <i className="fa-solid fa-robot"></i>
              </div>
              <div className="text-left">
                 <h2 className="text-3xl font-black text-slate-900 mb-4">Bingung Pilih Jurusan?</h2>
                 <p className="text-slate-500 font-medium mb-8">Gunakan teknologi AI kami untuk membantu kamu menemukan potensi diri yang tersembunyi.</p>
                 <Link to="/matcher" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all">Coba AI Matcher Sekarang</Link>
              </div>
           </div>
        </div>
      </section>

      {/* Programs / Majors */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-600 font-black text-xs uppercase tracking-[0.2em]">Program Keahlian</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-3 mb-6 tracking-tight">Pilih Jalur Masa Depanmu</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-slate-50 rounded-3xl p-2 shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100">
                <div className="h-48 overflow-hidden rounded-2xl relative">
                  <img src={dept.image_url} alt={dept.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-brand-600 shadow-md">
                    <i className={`fa-solid ${dept.icon}`}></i>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-black text-slate-900 mb-2">{dept.name}</h3>
                  <p className="text-xs font-bold text-slate-500 mb-6 line-clamp-2">{dept.description}</p>
                  <Link to="/profile" className="inline-flex items-center text-xs font-black text-brand-600 hover:text-brand-800 transition-colors uppercase tracking-widest">
                    Detail Program <i className="fa-solid fa-arrow-right ml-2"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
