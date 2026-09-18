import React from 'react';
import { CASES } from '@/data/mockData';
import { motion } from 'framer-motion';

export default function HomePage() {
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
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10"
        >
          Experience the ultimate virtual economy. Open cases, build your collection, and trade for the rarest items in our CS2-inspired simulator.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
            <motion.div
              key={item.id}
              whileHover={{ y: -5 }}
              className="metallic-card p-6 rounded-2xl flex flex-col"
            >
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="text-xl font-bold mb-2">{item.name}</h3>
              <p className="text-secondary text-sm mb-4">{item.category}</p>
              <div className="mt-auto flex justify-between items-center">
                <span className="text-white font-bold">${item.price}</span>
                <button className="text-accent font-bold hover:underline">Open Now &rarr;</button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
