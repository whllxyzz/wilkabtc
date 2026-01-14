
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import News from './pages/News';
import Gallery from './pages/Gallery';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import Teachers from './pages/Teachers';
import Agenda from './pages/Agenda';
import Eskul from './pages/Eskul';
import MajorMatcher from './pages/MajorMatcher';
import ChatRoom from './pages/ChatRoom';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

// Layout wrapper for public pages to include Navbar and Footer area
const PublicLayout = () => {
  const location = useLocation();
  // Auto scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-medium text-sm">
            &copy; {new Date().getFullYear()} SMKN 2 Tembilahan. All rights reserved.
          </p>
          <p className="text-xs mt-2 opacity-50">Developed for Educational Purpose</p>
        </div>
      </footer>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="news" element={<News />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="profile" element={<Profile />} />
          <Route path="contact" element={<Contact />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="eskul" element={<Eskul />} />
          <Route path="matcher" element={<MajorMatcher />} />
          <Route path="chat" element={<ChatRoom />} />
        </Route>

        {/* Admin Routes (No Navbar) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/register" element={<Register />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
