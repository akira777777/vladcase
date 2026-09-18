import React from 'react';
import { CASES } from '@/data/mockData';
import { motion } from 'framer-motion';
import { useEconomy } from '@/hooks/useEconomy';
import CaseCard from '@/components/case/CaseCard';

export default function HomePage() {
  const { balance, level, xp } = useEconomy();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-6"
        >
          UNLOCK THE <span className="text-accent">RARE</span>
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-8 mb-10"
        >
          <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-secondary text-sm">Balance</p>
            <p className="text-2xl font-bold text-white">${balance.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-secondary text-sm">Level</p>
            <p className="text-2xl font-bold text-white">{level}</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-secondary text-sm">XP</p>
            <p className="text-2xl font-bold text-white">{xp} / 1000</p>
          </div>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10"
        >
          Experience the ultimate virtual economy. Open cases, build your collection, and trade for the rarest items in our CS2-inspired simulator.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-accent transition-all transform hover:scale-105">
            Explore Cases
          </button>
        </motion.div>
      </section>

      {/* Featured Cases */}
      <section className="py-20">
        <h2 className="text-3xl font-display font-bold mb-12 text-left">Featured Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CASES.map((item) => (
            <CaseCard key={item.id} caseData={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
