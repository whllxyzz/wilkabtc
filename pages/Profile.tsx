
import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <section className="bg-blue-600 py-20 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Tentang Kami</h1>
          <p className="text-xl text-blue-100">
            SMKN 2 Tembilahan: Membangun Kompetensi, Menginspirasi Masa Depan.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 space-y-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold text-blue-900 mb-6">Sejarah Singkat</h2>
              <div className="w-16 h-1 bg-blue-600 mb-6"></div>
              <p className="text-slate-600 leading-relaxed mb-4">
                Didirikan pada tahun 1990-an, SMKN 2 Tembilahan telah berkembang pesat menjadi institusi pendidikan kejuruan unggulan di Indragiri Hilir. Berawal dari beberapa jurusan teknik, kini kami menaungi ribuan siswa dengan program studi yang relevan dengan perkembangan industri.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Kami berkomitmen penuh untuk tidak hanya melahirkan tenaga kerja terampil, tetapi juga wirausahawan muda yang mandiri dan berkarakter kuat.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src="https://picsum.photos/800/600?education" 
                alt="School history" 
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>

          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-blue-900 mb-2">Visi & Misi</h2>
              <div className="w-16 h-1 bg-blue-600 mx-auto"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                    <i className="fa-solid fa-eye"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Visi</h3>
                </div>
                <p className="text-slate-700 italic text-lg leading-relaxed">
                  "Menjadi Sekolah Menengah Kejuruan yang unggul dalam prestasi, berkarakter mulia, dan berwawasan lingkungan menuju persaingan global."
                </p>
              </div>

              <div>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                    <i className="fa-solid fa-list-check"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Misi</h3>
                </div>
                <ul className="space-y-4 text-slate-600">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] mr-3 mt-1 flex-shrink-0">1</span>
                    Meningkatkan kualitas pembelajaran berbasis industri dan teknologi terkini.
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] mr-3 mt-1 flex-shrink-0">2</span>
                    Menanamkan nilai-nilai religius dan etika profesi kepada seluruh warga sekolah.
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] mr-3 mt-1 flex-shrink-0">3</span>
                    Menjalin kerjasama yang harmonis dengan DU/DI (Dunia Usaha & Dunia Industri).
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
