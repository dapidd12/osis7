import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Aspiration, Announcement, SystemSettings } from '../types';

export const defaultSettings: SystemSettings = {
  isMaintenanceMode: false,
  maintenanceMessage: 'Website Kotak Curhat OSIS sedang dalam pemeliharaan berkala untuk peningkatan kualitas layanan. Silakan kembali beberapa saat lagi.',
  isAspirationOpen: true,
  aspirationClosedMessage: 'Pengiriman aspirasi saat ini sedang ditutup sementara oleh Pengurus OSIS untuk proses rekapitulasi data dan rapat kerja evaluasi. Kamu masih dapat melihat aspirasi yang telah disetujui di Papan Aspirasi dan pengumuman di Mading.',
  activityTopic: 'Umum',
  activityTopicDescription: 'Aspirasi, saran, dan pertanyaan terbuka seputar lingkungan dan kegiatan SMAN 1 Kemangkon.',
  socialLinks: {
    instagram: 'osissman1kemangkon',
    tiktok: 'osis_smansakemangkon',
    whatsapp: '6281234567890',
    whatsappMessage: 'Halo Pengurus OSIS SMAN 1 Kemangkon, saya ingin bertanya tentang kegiatan sekolah.'
  }
};

interface AppContextType {
  aspirations: Aspiration[];
  announcements: Announcement[];
  settings: SystemSettings;
  isSettingsLoaded: boolean;
  addAspiration: (aspiration: Omit<Aspiration, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateAspirationStatus: (id: string, status: Aspiration['status']) => Promise<void>;
  addResponse: (id: string, response: string) => Promise<void>;
  deleteAspiration: (id: string) => Promise<void>;
  addAnnouncement: (title: string, content: string, author: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useEffect(() => {
    // Listen to Aspirations
    const qAspirations = query(collection(db, 'aspirations'), orderBy('createdAt', 'desc'));
    const unsubscribeAspirations = onSnapshot(qAspirations, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          ...docData,
          id: doc.id,
          createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Aspiration;
      });
      setAspirations(data);
    });

    // Listen to Announcements
    const qAnnouncements = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribeAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          ...docData,
          id: doc.id,
          createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Announcement;
      });
      setAnnouncements(data);
    });

    // Listen to System Settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'system'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          isMaintenanceMode: typeof data.isMaintenanceMode === 'boolean' ? data.isMaintenanceMode : defaultSettings.isMaintenanceMode,
          maintenanceMessage: data.maintenanceMessage || defaultSettings.maintenanceMessage,
          isAspirationOpen: typeof data.isAspirationOpen === 'boolean' ? data.isAspirationOpen : defaultSettings.isAspirationOpen,
          aspirationClosedMessage: data.aspirationClosedMessage || defaultSettings.aspirationClosedMessage,
          activityTopic: data.activityTopic || defaultSettings.activityTopic,
          activityTopicDescription: data.activityTopicDescription !== undefined ? data.activityTopicDescription : defaultSettings.activityTopicDescription,
          socialLinks: {
            instagram: data.socialLinks?.instagram || defaultSettings.socialLinks.instagram,
            tiktok: data.socialLinks?.tiktok || defaultSettings.socialLinks.tiktok,
            whatsapp: data.socialLinks?.whatsapp || defaultSettings.socialLinks.whatsapp,
            whatsappMessage: data.socialLinks?.whatsappMessage || defaultSettings.socialLinks.whatsappMessage,
          },
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          updatedBy: data.updatedBy
        });
      } else {
        setSettings(defaultSettings);
        // Initialize default document in background
        setDoc(doc(db, 'settings', 'system'), {
          ...defaultSettings,
          updatedAt: serverTimestamp()
        }).catch(err => console.error("Initial settings setup error:", err));
      }
      setIsSettingsLoaded(true);
    }, (err) => {
      console.error("Settings listener error:", err);
      setIsSettingsLoaded(true);
    });

    return () => {
      unsubscribeAspirations();
      unsubscribeAnnouncements();
      unsubscribeSettings();
    };
  }, []);

  const addAspiration = async (data: Omit<Aspiration, 'id' | 'createdAt' | 'status'>) => {
    await addDoc(collection(db, 'aspirations'), {
      ...data,
      status: 'Pending',
      createdAt: serverTimestamp()
    });
  };

  const updateAspirationStatus = async (id: string, status: Aspiration['status']) => {
    await updateDoc(doc(db, 'aspirations', id), { status });
  };

  const addResponse = async (id: string, response: string) => {
    await updateDoc(doc(db, 'aspirations', id), { response });
  };

  const deleteAspiration = async (id: string) => {
    await deleteDoc(doc(db, 'aspirations', id));
  };

  const addAnnouncement = async (title: string, content: string, author: string) => {
    await addDoc(collection(db, 'announcements'), {
      title,
      content,
      author,
      createdAt: serverTimestamp()
    });
  };

  const deleteAnnouncement = async (id: string) => {
    await deleteDoc(doc(db, 'announcements', id));
  };

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    await setDoc(doc(db, 'settings', 'system'), {
      ...newSettings,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  return (
    <AppContext.Provider value={{ 
      aspirations, announcements, settings, isSettingsLoaded,
      addAspiration, updateAspirationStatus, addResponse, deleteAspiration,
      addAnnouncement, deleteAnnouncement, updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
