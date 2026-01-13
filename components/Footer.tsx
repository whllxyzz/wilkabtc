import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10 border-t-4 border-brand-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center font-bold text-lg">S2</div>
               <span className="font-bold text-xl tracking-tight">SMKN 2 Tembilahan</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sekolah Menengah Kejuruan Pusat Keunggulan yang berfokus pada pengembangan kompetensi teknis dan karakter profesional.
            </p>
            <div className="flex gap-4">
              {['facebook', 'instagram', 'twitter', 'youtube'].map((social) => (
                <a key={social} href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all">
                  <i className={`fa-brands fa-${social}`}></i>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Tautan Cepat</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#/" className="hover:text-brand-400 transition-colors">Beranda Utama</a></li>
              <li><a href="#/profile" className="hover:text-brand-400 transition-colors">Profil Sekolah</a></li>
              <li><a href="#/news" className="hover:text-brand-400 transition-colors">Berita Terkini</a></li>
              <li><a href="#/gallery" className="hover:text-brand-400 transition-colors">Galeri Kegiatan</a></li>
              <li><a href="#/contact" className="hover:text-brand-400 transition-colors">Hubungi Kami</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Program Keahlian</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><span className="hover:text-brand-400 cursor-pointer">Teknik Komputer & Jaringan</span></li>
              <li><span className="hover:text-brand-400 cursor-pointer">Akuntansi Keuangan Lembaga</span></li>
              <li><span className="hover:text-brand-400 cursor-pointer">Otomatisasi Tata Kelola Perkantoran</span></li>
              <li><span className="hover:text-brand-400 cursor-pointer">Tata Boga / Kuliner</span></li>
              <li><span className="hover:text-brand-400 cursor-pointer">Bisnis Daring Pemasaran</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Kantor Utama</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex gap-3">
                <i className="fa-solid fa-location-dot mt-1 text-brand-500"></i>
                <span>Jl. Pendidikan No. 45, Tembilahan, Indragiri Hilir, Riau, Indonesia</span>
              </li>
              <li className="flex gap-3">
                <i className="fa-solid fa-phone mt-1 text-brand-500"></i>
                <span>(0768) 21xxx / 0812-3456-xxxx</span>
              </li>
              <li className="flex gap-3">
                <i className="fa-solid fa-envelope mt-1 text-brand-500"></i>
                <span>info@smkn2tembilahan.sch.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">© 2026 SMKN 2 Tembilahan. All rights reserved.</p>
          <p className="text-slate-600 text-xs font-medium">Developed by WilkaXyz</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;