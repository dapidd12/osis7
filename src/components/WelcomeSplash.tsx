import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function WelcomeSplash() {
  const [show, setShow] = useState(true);

  const handleDismiss = () => {
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-sky-50/80 backdrop-blur-md p-4"
        >
          <motion.div 
            initial={{ scale: 0.5, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            className="bg-white p-6 sm:p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border-4 border-white relative overflow-hidden ring-4 ring-sky-100/50"
          >
            {/* Dekorasi Background */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-amber-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-sky-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            
            <motion.div 
              animate={{ y: [0, -15, 0], rotate: [0, -5, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-2 relative z-10 drop-shadow-2xl"
            >
              <img 
                src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788313109624-20260902_083812.png" 
                alt="Maskot OSIS" 
                className="w-full h-full object-contain" 
              />
            </motion.div>
            
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
                className="inline-block bg-amber-100 text-amber-800 px-5 py-2 rounded-full text-sm font-extrabold mb-5 shadow-sm border border-amber-200"
              >
                Haloo Teman-teman! 👋
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 leading-tight"
              >
                Selamat Datang di <br/>
                <span className="text-sky-500">Curhat OSIS!</span>
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-slate-600 mb-8 font-medium text-sm sm:text-base px-2"
              >
                Tempat paling asik buat nyampein ide, saran, atau sekadar curhat soal sekolah kita. Yuk, bareng-bareng bikin sekolah makin keren!
              </motion.p>
              
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDismiss}
                className="w-full py-4 px-6 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 group border-2 border-slate-900 hover:bg-slate-800 transition-colors"
              >
                <Sparkles className="w-5 h-5 text-amber-300 group-hover:animate-pulse" />
                Mulai Curhat Sekarang!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
