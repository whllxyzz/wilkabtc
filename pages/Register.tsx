
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/supabaseService';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await authService.register(name, email, password);
    if (success) {
      alert('Registrasi berhasil! Silakan login.');
      navigate('/admin');
    } else {
      setError('Email sudah terdaftar atau terjadi kesalahan.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-xl mb-6">
            <i className="fa-solid fa-user-plus"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900">Daftar Akun</h1>
          <p className="text-slate-500 mt-2">Bergabung dengan SMKN 2 Tembilahan</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-center font-bold">
              <i className="fa-solid fa-circle-exclamation mr-3"></i> {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all" placeholder="Nama Anda" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all" placeholder="email@contoh.id" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all" placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-70">
              {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'DAFTAR SEKARANG'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">Sudah punya akun? <Link to="/admin" className="text-blue-600 font-bold hover:underline">Masuk di sini</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
