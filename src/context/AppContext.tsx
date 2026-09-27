import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Aspiration, Announcement } from '../types';

interface AppContextType {
  aspirations: Aspiration[];
  announcements: Announcement[];
  addAspiration: (aspiration: Omit<Aspiration, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateAspirationStatus: (id: string, status: Aspiration['status']) => Promise<void>;
  addResponse: (id: string, response: string) => Promise<void>;
  deleteAspiration: (id: string) => Promise<void>;
  addAnnouncement: (title: string, content: string, author: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

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

    return () => {
      unsubscribeAspirations();
      unsubscribeAnnouncements();
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

  return (
    <AppContext.Provider value={{ 
      aspirations, announcements,
      addAspiration, updateAspirationStatus, addResponse, deleteAspiration,
      addAnnouncement, deleteAnnouncement
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
