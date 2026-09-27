import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'motion/react';
import Navbar from './Navbar';
import WelcomeSplash from './WelcomeSplash';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <WelcomeSplash />
      <Navbar />
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <Outlet />
      </motion.main>
      <footer className="bg-white border-t py-8 text-center text-sm text-slate-500">
        <p className="font-medium text-slate-700">&copy; {new Date().getFullYear()} Organisasi Siswa Intra Sekolah SMAN 1 Kemangkon.</p>
        <p className="mt-1">Hak Cipta Dilindungi. Dikelola oleh Pengurus OSIS.</p>
      </footer>
    </div>
  );
}
