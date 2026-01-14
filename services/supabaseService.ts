
import { 
  Photo, Track, Post, Document, AITool, 
  NewsItem, Department, SiteSettings, Achievement, 
  GalleryItem, Teacher, AgendaItem, Eskul, 
  TelegramInbox, Suggestion, User, ChatMessage 
} from '../types';

// Mock data to initialize the experience
const MOCK_PHOTOS: Photo[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', title: 'Mountain Mist', category: 'Nature', date: '2024-03-01' },
  { id: '2', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', title: 'Forest Path', category: 'Travel', date: '2024-02-15' },
];

const MOCK_TRACKS: Track[] = [
  { id: '1', title: 'Midnight City', artist: 'M83', url: '#', duration: '4:03', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17' },
  { id: '2', title: 'Starboy', artist: 'The Weeknd', url: '#', duration: '3:50', coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9' },
];

const MOCK_POSTS: Post[] = [
  { id: '1', title: 'The Future of AI Dashboards', content: 'Exploring how deep-integration will change personal productivity...', tags: ['Tech', 'Design'], createdAt: '2024-03-10' },
  { id: '2', title: 'Travel Log: Iceland', content: 'Seven days of ice and fire. The landscapes are beyond words...', tags: ['Travel', 'Photography'], createdAt: '2024-02-28' },
];

const MOCK_DOCS: Document[] = [
  { id: '1', name: 'Resume_2024.pdf', size: '1.2 MB', type: 'PDF', url: '#', uploadedAt: '2024-01-05' },
  { id: '2', name: 'Project_Proposal.pdf', size: '4.5 MB', type: 'PDF', url: '#', uploadedAt: '2024-03-02' },
];

const MOCK_AI: AITool[] = [
  { id: '1', name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'fa-robot', color: '#10a37f', description: 'Advanced conversational AI' },
  { id: '2', name: 'Claude', url: 'https://claude.ai', icon: 'fa-brain', color: '#d97757', description: 'Helpful and honest AI' },
  { id: '3', name: 'Midjourney', url: 'https://midjourney.com', icon: 'fa-palette', color: '#5865f2', description: 'Generative art engine' },
  { id: '4', name: 'Perplexity', url: 'https://perplexity.ai', icon: 'fa-search', color: '#20b2aa', description: 'Search-focused AI' },
];

// --- School Website Mock Data ---

const MOCK_NEWS: NewsItem[] = [
  { id: '1', title: 'Juara Umum LKS 2024', content: 'Siswa SMKN 2 Tembilahan berhasil meraih juara umum pada ajang Lomba Kompetensi Siswa tingkat kabupaten...', author: 'Admin Utama', image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644', created_at: new Date().toISOString() },
  { id: '2', title: 'Kunjungan Industri Jakarta', content: 'Sebanyak 100 siswa jurusan TKJ melakukan kunjungan industri ke beberapa startup teknologi ternama di Jakarta...', author: 'Humas', image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998', created_at: new Date().toISOString() },
];

const MOCK_SETTINGS: SiteSettings = {
  school_name: 'SMKN 2 Tembilahan',
  running_text: 'Selamat Datang di Portal Resmi SMKN 2 Tembilahan - PPDB Tahun Ajaran 2026/2027 Segera Dibuka!',
  hero_image_url: 'https://images.unsplash.com/photo-1523050335102-c325095014f3',
  sub_welcome_text: 'Mencetak generasi unggul yang kompeten, berkarakter, dan siap bersaing di dunia industri global.',
  telegram_bot_token: 'MOCK_TOKEN',
  telegram_channel_id: '@smkn2tembilahan_news'
};

const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'LKS Web Tech', rank: 'Juara 1', category: 'Nasional', year: '2023' },
  { id: '2', title: 'O2SN Basket', rank: 'Juara 2', category: 'Provinsi', year: '2024' },
];

const MOCK_STORAGE_FILES = [
  { id: '1', name: 'school_banner.jpg', url: 'https://images.unsplash.com/photo-1523050335102-c325095014f3', size: '2.4 MB', type: 'image/jpeg', created_at: '2024-03-01' },
  { id: '2', name: 'campus_life.jpg', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644', size: '1.8 MB', type: 'image/jpeg', created_at: '2024-03-05' },
  { id: '3', name: 'lab_computer.jpg', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998', size: '3.1 MB', type: 'image/jpeg', created_at: '2024-03-10' }
];

// --- Exported Services ---

export const personalDataService = {
  getPhotos: async (): Promise<Photo[]> => [...MOCK_PHOTOS],
  addPhoto: async (data: Omit<Photo, 'id' | 'date'>): Promise<Photo> => {
    const newPhoto = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      ...data
    };
    MOCK_PHOTOS.unshift(newPhoto);
    return newPhoto;
  },
  getTracks: async (): Promise<Track[]> => MOCK_TRACKS,
  getPosts: async (): Promise<Post[]> => MOCK_POSTS,
  getDocs: async (): Promise<Document[]> => MOCK_DOCS,
  getAITools: async (): Promise<AITool[]> => MOCK_AI,
};

export const newsService = {
  getAll: async (): Promise<NewsItem[]> => MOCK_NEWS,
  create: async (data: any) => ({ ...data, id: Math.random().toString() }),
  update: async (id: string, data: any) => ({ ...data, id }),
  delete: async (id: string) => true,
};

export const departmentService = {
  getAll: async (): Promise<Department[]> => [],
};

export const settingsService = {
  get: async (): Promise<SiteSettings> => MOCK_SETTINGS,
  update: async (data: SiteSettings) => data,
};

export const achievementService = {
  getAll: async (): Promise<Achievement[]> => MOCK_ACHIEVEMENTS,
};

export const galleryService = {
  getAll: async (): Promise<GalleryItem[]> => [],
  add: async (data: any) => ({ ...data, id: Math.random().toString() }),
  update: async (id: string, data: any) => ({ ...data, id }),
  delete: async (id: string) => true,
};

export const contactService = {
  send: async (data: any) => true,
};

export const authService = {
  login: async (email: string, pass: string) => true,
  register: async (name: string, email: string, pass: string) => true,
  logout: () => {},
  getCurrentUser: (): User | null => ({ id: '1', name: 'Wilka', email: 'wilka@smkn2.id', role: 'admin' }),
  getAllUsers: async (): Promise<User[]> => [{ id: '1', name: 'Wilka', email: 'wilka@smkn2.id', role: 'admin' }],
  deleteUser: async (id: string) => true,
};

export const visitorService = {
  getOnlineCount: async () => Math.floor(Math.random() * 50) + 1,
};

export const teacherService = {
  getAll: async (): Promise<Teacher[]> => [],
};

export const agendaService = {
  getAll: async (): Promise<AgendaItem[]> => [],
  save: async (data: any) => ({ ...data, id: Math.random().toString() }),
  update: async (id: string, data: any) => ({ ...data, id }),
  delete: async (id: string) => true,
};

export const eskulService = {
  getAll: async (): Promise<Eskul[]> => [],
  save: async (data: any) => ({ ...data, id: Math.random().toString() }),
  update: async (id: string, data: any) => ({ ...data, id }),
  delete: async (id: string) => true,
};

export const telegramService = {
  getInbox: async (): Promise<TelegramInbox[]> => [],
  deleteInboxItem: async (id: string) => true,
};

export const suggestionService = {
  getAll: async (): Promise<Suggestion[]> => [],
  delete: async (id: string) => true,
};

export const chatService = {
  getAll: async (): Promise<ChatMessage[]> => [],
  send: async (data: any): Promise<ChatMessage> => ({ ...data, id: Math.random().toString(), created_at: new Date().toISOString() }),
};

export const storageService = {
  upload: async (file: File) => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file), // Create blob URL for session usage
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type,
      created_at: new Date().toISOString()
    };
    MOCK_STORAGE_FILES.unshift(newFile);
    return newFile;
  },
  list: async () => {
    return [...MOCK_STORAGE_FILES];
  },
  delete: async (id: string) => {
    const idx = MOCK_STORAGE_FILES.findIndex(f => f.id === id);
    if (idx !== -1) MOCK_STORAGE_FILES.splice(idx, 1);
    return true;
  }
};

export const getSystemStatus = () => true;
