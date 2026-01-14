
import { NewsItem, GalleryItem, VisitorLog, User, Department, ChatMessage, SiteSettings, TelegramInbox, ContactMessage, Teacher, Eskul, AgendaItem, Suggestion, Achievement } from '../types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const DEFAULT_TELEGRAM_TOKEN = '8580733262:AAHGt66q8woKi6hnOHxqdZ285fb65kXuzP0';
const DEFAULT_TELEGRAM_CHAT_ID = '7577331454';

// Inisialisasi Supabase dengan pengecekan ketat
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'undefined' && SUPABASE_URL !== '') 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

const LOCAL_STORAGE_KEYS = {
  NEWS: 'smkn2_news',
  GALLERY: 'smkn2_gallery',
  DEPARTMENTS: 'smkn2_departments',
  TEACHERS: 'smkn2_teachers',
  ESKUL: 'smkn2_eskul',
  AGENDA: 'smkn2_agenda',
  SUGGESTIONS: 'smkn2_suggestions',
  VISITORS: 'smkn2_visitors',
  USERS: 'smkn2_users',
  CHATS: 'smkn2_chats',
  CONTACTS: 'smkn2_contacts',
  AUTH_SESSION: 'smkn2_session',
  SETTINGS: 'smkn2_settings',
  TELE_INBOX: 'smkn2_tele_inbox',
  ACHIEVEMENTS: 'smkn2_achievements'
};

const mockService = {
  get: (key: string) => JSON.parse(localStorage.getItem(key) || '[]'),
  set: (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data)),
  getObj: (key: string) => JSON.parse(localStorage.getItem(key) || '{}'),
};

export const getSystemStatus = () => !!supabase;

export const visitorService = {
  getAll: async (): Promise<VisitorLog[]> => {
    if (supabase) { 
      const { data, error } = await supabase.from('visitors').select('*').order('visited_at', { ascending: false }); 
      if (!error) return data || [];
    }
    return mockService.get(LOCAL_STORAGE_KEYS.VISITORS);
  },
  getOnlineCount: async (): Promise<number> => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    if (supabase) { 
      const { count } = await supabase.from('visitors').select('*', { count: 'exact', head: true }).gt('visited_at', fiveMinutesAgo); 
      return count || 1; 
    }
    const all = mockService.get(LOCAL_STORAGE_KEYS.VISITORS);
    const active = all.filter((v: any) => new Date(v.visited_at).getTime() > new Date(fiveMinutesAgo).getTime());
    return Math.max(1, active.length);
  },
  logVisit: async (log: Omit<VisitorLog, 'id' | 'visited_at'>): Promise<void> => {
    const newLog = { ...log, id: Math.random().toString(36).substr(2, 9), visited_at: new Date().toISOString() };
    if (supabase) { 
        const { error } = await supabase.from('visitors').insert([newLog]); 
        if (!error) return; 
    }
    const all = mockService.get(LOCAL_STORAGE_KEYS.VISITORS);
    mockService.set(LOCAL_STORAGE_KEYS.VISITORS, [newLog, ...all].slice(0, 100));
  }
};

export const newsService = {
  getAll: async (): Promise<NewsItem[]> => {
    if (supabase) { 
      const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false }); 
      return data || []; 
    }
    return mockService.get(LOCAL_STORAGE_KEYS.NEWS);
  },
  create: async (news: Omit<NewsItem, 'id' | 'created_at'>): Promise<NewsItem> => {
    const newItem = { ...news, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
    if (supabase) { await supabase.from('news').insert([newItem]); return newItem; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.NEWS);
    mockService.set(LOCAL_STORAGE_KEYS.NEWS, [newItem, ...all]);
    return newItem;
  },
  update: async (id: string, updates: Partial<NewsItem>): Promise<void> => {
    if (supabase) { await supabase.from('news').update(updates).eq('id', id); return; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.NEWS);
    const updated = all.map((item: any) => item.id === id ? { ...item, ...updates } : item);
    mockService.set(LOCAL_STORAGE_KEYS.NEWS, updated);
  },
  delete: async (id: string): Promise<void> => {
    if (supabase) { await supabase.from('news').delete().eq('id', id); return; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.NEWS);
    mockService.set(LOCAL_STORAGE_KEYS.NEWS, all.filter((item: any) => item.id !== id));
  }
};

export const telegramService = {
  getInbox: async (): Promise<TelegramInbox[]> => {
    if (supabase) {
      const { data } = await supabase.from('telegram_inbox').select('*').order('created_at', { ascending: false });
      return data || [];
    }
    return mockService.get(LOCAL_STORAGE_KEYS.TELE_INBOX);
  },
  deleteInboxItem: async (id: string) => {
    if (supabase) { await supabase.from('telegram_inbox').delete().eq('id', id); return; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.TELE_INBOX);
    mockService.set(LOCAL_STORAGE_KEYS.TELE_INBOX, all.filter((i: any) => i.id !== id));
  }
};

export const authService = {
  getAllUsers: async (): Promise<User[]> => {
    if (supabase) {
      const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (data) return data;
    }
    return mockService.get(LOCAL_STORAGE_KEYS.USERS);
  },
  // Added: Missing register method for pages/Register.tsx
  register: async (name: string, email: string, password: string): Promise<boolean> => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password, // Note: In production, never store passwords in plain text.
      role: 'user' as const,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { error } = await supabase.from('users').insert([newUser]);
      return !error;
    }

    const users = mockService.get(LOCAL_STORAGE_KEYS.USERS);
    if (users.some((u: any) => u.email === email)) return false;
    
    mockService.set(LOCAL_STORAGE_KEYS.USERS, [...users, newUser]);
    return true;
  },
  login: async (email: string, password: string): Promise<boolean> => {
    if (email === 'wilka' && password === 'wilka') {
      const adminSession: User = { id: 'admin-1', name: 'WilkaXyz', email: 'wilka@smkn2.id', role: 'admin', created_at: new Date().toISOString(), student_id: 'SUPER-ADMIN' };
      mockService.set(LOCAL_STORAGE_KEYS.AUTH_SESSION, adminSession);
      return true;
    }
    const users = await authService.getAllUsers() as any[];
    const user = users.find((u: any) => (u.email === email || u.name === email) && u.password === password);
    if (user) {
      const { password: _p, ...sessionData } = user;
      mockService.set(LOCAL_STORAGE_KEYS.AUTH_SESSION, sessionData);
      return true;
    }
    return false;
  },
  logout: async () => { localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_SESSION); },
  getCurrentUser: (): User | null => mockService.get(LOCAL_STORAGE_KEYS.AUTH_SESSION) || null,
  isAuthenticated: (): boolean => !!localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_SESSION),
  deleteUser: async (id: string): Promise<void> => {
    if (supabase) await supabase.from('users').delete().eq('id', id);
    const users = mockService.get(LOCAL_STORAGE_KEYS.USERS);
    mockService.set(LOCAL_STORAGE_KEYS.USERS, users.filter((u: any) => u.id !== id));
  }
};

export const settingsService = {
  get: async (): Promise<SiteSettings> => {
    const defaults: SiteSettings = {
      school_name: 'SMKN 2 Tembilahan',
      welcome_text: 'Membangun Keahlian, Mengukir Masa Depan.',
      sub_welcome_text: 'SMKN 2 Tembilahan berkomitmen menghadirkan pendidikan vokasi berkualitas.',
      hero_image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop',
      telegram_bot_token: DEFAULT_TELEGRAM_TOKEN,
      telegram_chat_id: DEFAULT_TELEGRAM_CHAT_ID
    };
    if (supabase) {
      const { data } = await supabase.from('settings').select('*').single();
      if (data) return data;
    }
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    return stored ? JSON.parse(stored) : defaults;
  },
  update: async (settings: Partial<SiteSettings>): Promise<void> => {
    if (supabase) { await supabase.from('settings').upsert({ id: 1, ...settings }); return; }
    const current = await settingsService.get();
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify({ ...current, ...settings }));
  }
};

export const galleryService = {
  getAll: async (): Promise<GalleryItem[]> => {
    if (supabase) { const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false }); return data || []; }
    return mockService.get(LOCAL_STORAGE_KEYS.GALLERY);
  },
  add: async (item: Omit<GalleryItem, 'id' | 'created_at'>): Promise<GalleryItem> => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
    if (supabase) { await supabase.from('gallery').insert([newItem]); return newItem; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.GALLERY);
    mockService.set(LOCAL_STORAGE_KEYS.GALLERY, [newItem, ...all]);
    return newItem;
  },
  update: async (id: string, updates: Partial<GalleryItem>): Promise<void> => {
    if (supabase) { await supabase.from('gallery').update(updates).eq('id', id); return; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.GALLERY);
    const updated = all.map((item: any) => item.id === id ? { ...item, ...updates } : item);
    mockService.set(LOCAL_STORAGE_KEYS.GALLERY, updated);
  },
  delete: async (id: string): Promise<void> => {
    if (supabase) { await supabase.from('gallery').delete().eq('id', id); return; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.GALLERY);
    mockService.set(LOCAL_STORAGE_KEYS.GALLERY, all.filter((i: any) => i.id !== id));
  }
};

export const eskulService = {
  getAll: async (): Promise<Eskul[]> => {
    if (supabase) { const { data } = await supabase.from('eskul').select('*').order('name', { ascending: true }); return data || []; }
    return mockService.get(LOCAL_STORAGE_KEYS.ESKUL);
  },
  save: async (item: Omit<Eskul, 'id' | 'created_at'>): Promise<Eskul> => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
    if (supabase) { await supabase.from('eskul').insert([newItem]); return newItem; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.ESKUL);
    mockService.set(LOCAL_STORAGE_KEYS.ESKUL, [newItem, ...all]);
    return newItem;
  },
  update: async (id: string, updates: Partial<Eskul>): Promise<void> => {
    if (supabase) { await supabase.from('eskul').update(updates).eq('id', id); return; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.ESKUL);
    const updated = all.map((i: any) => i.id === id ? { ...i, ...updates } : i);
    mockService.set(LOCAL_STORAGE_KEYS.ESKUL, updated);
  },
  delete: async (id: string): Promise<void> => {
    if (supabase) { await supabase.from('eskul').delete().eq('id', id); return; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.ESKUL);
    mockService.set(LOCAL_STORAGE_KEYS.ESKUL, all.filter((i: any) => i.id !== id));
  }
};

export const agendaService = {
  getAll: async (): Promise<AgendaItem[]> => {
    if (supabase) { const { data } = await supabase.from('agenda').select('*').order('date', { ascending: true }); return data || []; }
    return mockService.get(LOCAL_STORAGE_KEYS.AGENDA);
  },
  save: async (item: Omit<AgendaItem, 'id' | 'created_at'>): Promise<AgendaItem> => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
    if (supabase) { await supabase.from('agenda').insert([newItem]); return newItem; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.AGENDA);
    mockService.set(LOCAL_STORAGE_KEYS.AGENDA, [newItem, ...all]);
    return newItem;
  },
  update: async (id: string, updates: Partial<AgendaItem>): Promise<void> => {
    if (supabase) { await supabase.from('agenda').update(updates).eq('id', id); return; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.AGENDA);
    const updated = all.map((i: any) => i.id === id ? { ...i, ...updates } : i);
    mockService.set(LOCAL_STORAGE_KEYS.AGENDA, updated);
  },
  delete: async (id: string): Promise<void> => {
    if (supabase) { await supabase.from('agenda').delete().eq('id', id); return; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.AGENDA);
    mockService.set(LOCAL_STORAGE_KEYS.AGENDA, all.filter((i: any) => i.id !== id));
  }
};

export const suggestionService = {
  getAll: async (): Promise<Suggestion[]> => {
    if (supabase) { const { data } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false }); return data || []; }
    return mockService.get(LOCAL_STORAGE_KEYS.SUGGESTIONS);
  },
  submit: async (item: Omit<Suggestion, 'id' | 'created_at'>): Promise<void> => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
    if (supabase) { await supabase.from('suggestions').insert([newItem]); return; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.SUGGESTIONS);
    mockService.set(LOCAL_STORAGE_KEYS.SUGGESTIONS, [newItem, ...all]);
  },
  delete: async (id: string): Promise<void> => {
    if (supabase) { await supabase.from('suggestions').delete().eq('id', id); return; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.SUGGESTIONS);
    mockService.set(LOCAL_STORAGE_KEYS.SUGGESTIONS, all.filter((i: any) => i.id !== id));
  }
};

export const teacherService = {
  getAll: async (): Promise<Teacher[]> => {
    if (supabase) { const { data } = await supabase.from('teachers').select('*').order('name', { ascending: true }); return data || []; }
    return mockService.get(LOCAL_STORAGE_KEYS.TEACHERS);
  },
  save: async (item: Omit<Teacher, 'id' | 'created_at'>): Promise<Teacher> => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
    if (supabase) { await supabase.from('teachers').insert([newItem]); return newItem; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.TEACHERS);
    mockService.set(LOCAL_STORAGE_KEYS.TEACHERS, [newItem, ...all]);
    return newItem;
  }
};

export const achievementService = {
  getAll: async (): Promise<Achievement[]> => {
    if (supabase) { const { data } = await supabase.from('achievements').select('*').order('created_at', { ascending: false }); return data || []; }
    return mockService.get(LOCAL_STORAGE_KEYS.ACHIEVEMENTS);
  },
  save: async (item: Omit<Achievement, 'id' | 'created_at'>): Promise<Achievement> => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
    if (supabase) { await supabase.from('achievements').insert([newItem]); return newItem; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.ACHIEVEMENTS);
    mockService.set(LOCAL_STORAGE_KEYS.ACHIEVEMENTS, [newItem, ...all]);
    return newItem;
  }
};

export const departmentService = {
  getAll: async (): Promise<Department[]> => {
    if (supabase) { const { data } = await supabase.from('departments').select('*').order('name', { ascending: true }); return data || []; }
    return mockService.get(LOCAL_STORAGE_KEYS.DEPARTMENTS);
  },
  save: async (dept: Omit<Department, 'id' | 'created_at'>): Promise<Department> => {
    const newItem = { ...dept, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
    if (supabase) { await supabase.from('departments').insert([newItem]); return newItem; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.DEPARTMENTS);
    mockService.set(LOCAL_STORAGE_KEYS.DEPARTMENTS, [newItem, ...all]);
    return newItem;
  }
};

export const chatService = {
  getAll: async (): Promise<ChatMessage[]> => {
    if (supabase) { const { data } = await supabase.from('chats').select('*').order('created_at', { ascending: true }); return data || []; }
    return mockService.get(LOCAL_STORAGE_KEYS.CHATS).slice(-50); 
  },
  send: async (msg: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage> => {
    const newItem = { ...msg, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
    if (supabase) { await supabase.from('chats').insert([newItem]); return newItem; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.CHATS);
    mockService.set(LOCAL_STORAGE_KEYS.CHATS, [...all, newItem]);
    return newItem;
  }
};

export const contactService = {
  send: async (msg: Omit<ContactMessage, 'id' | 'created_at'>): Promise<void> => {
    const newItem = { ...msg, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
    if (supabase) { await supabase.from('contacts').insert([newItem]); return; }
    const all = mockService.get(LOCAL_STORAGE_KEYS.CONTACTS);
    mockService.set(LOCAL_STORAGE_KEYS.CONTACTS, [newItem, ...all]);
  }
};
