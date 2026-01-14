
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_url: string;
  author: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  author: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  image_url: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  position: string; 
  image_url: string;
  created_at: string;
}

export interface Eskul {
  id: string;
  name: string;
  description: string;
  schedule: string; 
  image_url: string;
  created_at: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  created_at: string;
}

export interface Suggestion {
  id: string;
  name: string; 
  type: 'Saran Fitur' | 'Masukan Umum' | 'Pertanyaan';
  content: string;
  created_at: string;
}

export interface VisitorLog {
  id: string;
  ip: string;
  location: string;
  device: string;
  browser?: string;
  os?: string;
  battery: string;
  visited_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  student_id?: string;
  major?: string;
}

export interface Achievement {
  id: string;
  title: string;
  rank: string;
  category: string;
  year: string;
  image_url: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

// Fixed: Added missing ContactMessage interface
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export interface TelegramInbox {
  id: string;
  sender_name: string;
  message_text: string;
  image_url?: string;
  raw_data: any;
  status: 'pending' | 'posted_news' | 'posted_gallery' | 'rejected';
  created_at: string;
}

export interface SiteSettings {
  logo_url?: string;
  hero_image_url: string;
  school_name: string;
  welcome_text: string;
  sub_welcome_text: string;
  running_text?: string;
  telegram_bot_token?: string;
  telegram_chat_id?: string;
}
