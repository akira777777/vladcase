import React from 'react';
import { useEconomy } from '@/hooks/useEconomy';
import { useInventory } from '@/hooks/useInventory';
import { CASES } from '@/data/mockData';
import { openCase } from '@/lib/caseLogic';
import CaseCard from '@/components/case/CaseCard';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { balance, level, xp } = useEconomy();
  const { inventory, addItem } = useInventory();

  const handleOpenCase = (caseData: any) => {
    const winningItem = openCase(caseData);
    // В реальной системе здесь должна быть анимация рулетки. 
    // Для текущего этапа мы просто добавляем предмет в инвентарь и обновляем баланс.
    // Но чтобы не дублировать логику, мы можем вызвать функцию открытия из компонента.
  };

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
        
        <div className="flex justify-center gap-4 mb-10">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-secondary text-xs uppercase">Balance</p>
            <p className="text-xl font-bold text-white">${balance.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-secondary text-xs uppercase">Level</p>
            <p className="text-xl font-bold text-white">{level}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-secondary text-xs uppercase">XP</p>
            <p className="text-xl font-bold text-white">{xp} / 1000</p>
          </div>
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10"
        >
          Experience the ultimate virtual economy. Open cases, build your collection, and trade for the rarest items in our CS2-inspired simulator.
        </motion.p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <a href="#cases" className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-accent transition-all transform hover:scale-105">
            Explore Cases
          </a>
          <a href="#inventory" className="bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all">
            My Inventory
          </a>
        </div>
      </section>

      {/* Featured Cases */}
      <section id="cases" className="py-20">
        <h2 className="text-3xl font-display font-bold mb-12 text-left">Featured Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CASES.map((item) => (
            <CaseCard 
              key={item.id} 
              caseData={item} 
              onSuccess={(item) => addItem(item)}
            />
          ))}
        </div>
      </section>

      {/* Inventory Section */}
      <section id="inventory" className="py-20">
        <h2 className="text-3xl font-display font-bold mb-12 text-left">My Inventory</h2>
        {inventory.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/20">
            <p className="text-secondary">Your inventory is empty. Open some cases to start collecting!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {inventory.map((item, idx) => (
              <motion.div 
                key={`${item.id}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-white/30 transition-all"
              >
                <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                <p className="text-sm font-bold truncate">{item.name}</p>
                <p className="text-[10px] text-secondary uppercase tracking-widest">{item.rarity}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
