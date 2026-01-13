
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import News from './pages/News';
import Gallery from './pages/Gallery';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';
import ChatRoom from './pages/ChatRoom';
import Teachers from './pages/Teachers';
import Agenda from './pages/Agenda';
import EskulPage from './pages/Eskul';
import AIChatbot from './components/AIChatbot';
import FeedbackWidget from './components/FeedbackWidget';
import { visitorService } from './services/supabaseService';

const App: React.FC = () => {
  useEffect(() => {
    const trackVisitor = async () => {
      if (sessionStorage.getItem('v_tracked')) return;
      let geoData = { ip: 'Hidden/Blocked', city: 'Unknown', country_name: 'Unknown' };
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const geoRes = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (geoRes.ok) {
          const data = await geoRes.json();
          geoData = { ip: data.ip || 'Unknown', city: data.city || 'Unknown', country_name: data.country_name || 'Unknown' };
        }
      } catch (err) {}

      try {
        let batteryInfo = 'N/A';
        if ('getBattery' in navigator) {
          const battery: any = await (navigator as any).getBattery();
          batteryInfo = `${Math.round(battery.level * 100)}%`;
        }
        
        const ua = navigator.userAgent;
        let device = 'Desktop';
        if (/android/i.test(ua)) device = 'Android Mobile';
        else if (/iPhone|iPad|iPod/i.test(ua)) device = 'iOS Mobile';
        else if (/Windows/i.test(ua)) device = 'Windows PC';
        else if (/Macintosh/i.test(ua)) device = 'Mac';
        
        // Simple Browser Detection
        let browser = 'Unknown';
        if (ua.indexOf("Chrome") > -1) browser = "Google Chrome";
        else if (ua.indexOf("Safari") > -1) browser = "Safari";
        else if (ua.indexOf("Firefox") > -1) browser = "Mozilla Firefox";
        else if (ua.indexOf("MSIE") > -1 || !!(document as any).documentMode) browser = "IE";
        
        // OS Detection
        let os = 'Unknown OS';
        if (ua.indexOf("Win") !== -1) os = "Windows";
        if (ua.indexOf("Mac") !== -1) os = "MacOS";
        if (ua.indexOf("X11") !== -1) os = "UNIX";
        if (ua.indexOf("Linux") !== -1) os = "Linux";
        if (/android/i.test(ua)) os = "Android";
        if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";

        await visitorService.logVisit({
          ip: geoData.ip,
          location: `${geoData.city}, ${geoData.country_name}`,
          device: device,
          browser: browser,
          os: os,
          battery: batteryInfo
        });
        sessionStorage.setItem('v_tracked', 'true');
      } catch (err) {}
    };
    trackVisitor();
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/news" element={<Layout><News /></Layout>} />
          <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/teachers" element={<Layout><Teachers /></Layout>} />
          <Route path="/agenda" element={<Layout><Agenda /></Layout>} />
          <Route path="/eskul" element={<Layout><EskulPage /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/chat" element={<Layout><ChatRoom /></Layout>} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/register" element={<Register />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
        <AIChatbot />
        <FeedbackWidget />
      </div>
    </Router>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </>
);

export default App;
