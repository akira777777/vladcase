import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Item } from '@/types';

interface WinScreenProps {
  item: Item | null;
  onClose: () => void;
}

const WinScreen: React.FC<WinScreenProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative max-w-2xl w-full p-12 rounded-[3rem] border border-white/10 bg-white/5 text-center shadow-[0_0_100px_rgba(0,0,0,0.5)]"
      >
        <motion.h2 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-2xl text-secondary mb-4 font-bold uppercase tracking-widest"
        >
          New Item Unlocked
        </motion.h2>

        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
          className="relative inline-block mb-8"
        >
          <div className="absolute -inset-4 bg-white/10 blur-2xl rounded-full" />
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-64 h-64 object-cover rounded-3xl border-4 border-white/20 shadow-2xl"
          />
        </motion.div>

        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`text-5xl font-display font-bold mb-4 ${item.rarity === 'legendary' ? 'text-yellow-400' : 'text-white'}`}
        >
          {item.name}
        </motion.h3>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-secondary mb-8 text-lg"
        >
          Rarity: <span className="text-white font-bold">{item.rarity}</span>
        </motion.p>

        <motion.button 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={onClose}
          className="bg-white text-black px-12 py-4 rounded-full font-bold text-xl hover:bg-accent transition-all transform hover:scale-105"
        >
          Continue
        </motion.button>
      </motion.div>
    </div>
  );
};

export default WinScreen;
