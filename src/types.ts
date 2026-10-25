export type AspirationCategory = 'Saran' | 'Kritik' | 'Pertanyaan' | 'Lainnya';
export type AspirationStatus = 'Pending' | 'Approved' | 'Rejected';
export type SiteMode = 'aspiration' | 'evaluation';

export interface Aspiration {
  id: string;
  category: AspirationCategory;
  subject: string;
  message: string;
  isAnonymous: boolean;
  authorName?: string;
  status: AspirationStatus;
  createdAt: string;
  response?: string;
  activityTopic?: string; // Judul kegiatan / topik aspirasi, e.g. "Umum" or "Class Meeting 2026"
  submissionType?: SiteMode; // Apakah dikirim saat mode aspirasi atau mode evaluasi
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface SystemSocialLinks {
  instagram: string;
  tiktok: string;
  whatsapp: string;
  whatsappMessage?: string;
}

export interface SystemSettings {
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  isAspirationOpen: boolean;
  aspirationClosedMessage: string;
  siteMode: SiteMode; // 'aspiration' (Kotak Curhat) atau 'evaluation' (Kotak Evaluasi)
  activityTopic: string; // Judul / nama kegiatan aspirasi aktif, default "Umum"
  activityTopicDescription?: string; // Deskripsi singkat kegiatan jika ada
  socialLinks: SystemSocialLinks;
  updatedAt?: string;
  updatedBy?: string;
}
