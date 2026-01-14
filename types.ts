
// Existing types for Personal Hub
export interface Photo {
  id: string;
  url: string;
  title: string;
  category: string;
  date: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: string;
  coverUrl: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface AITool {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  description: string;
}

export interface AppState {
  photos: Photo[];
  tracks: Track[];
  posts: Post[];
  documents: Document[];
  aiTools: AITool[];
}

// New types for School Website
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  author: string;
  image_url: string;
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

export interface SiteSettings {
  school_name: string;
  running_text: string;
  hero_image_url: string;
  sub_welcome_text: string;
  telegram_bot_token: string;
  telegram_channel_id: string;
}

export interface Achievement {
  id: string;
  title: string;
  rank: string;
  category: string;
  year: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  name: string;
  position: string;
  image_url: string;
  nip?: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export interface Eskul {
  id: string;
  name: string;
  image_url: string;
  schedule: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface TelegramInbox {
  id: string;
  sender_name: string;
  message_text: string;
  image_url: string | null;
  status: string;
  created_at: string;
}

export interface Suggestion {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}
