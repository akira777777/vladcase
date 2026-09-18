import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Item } from '@/types';

interface RouletteProps {
  items: Item[];
  onComplete: (item: Item) => void;
}

const Roulette: React.FC<RouletteProps> = ({ items, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();

  // Create an expanded list for a smooth "infinite" scrolling effect
  // We repeat the items multiple times so the reel has enough content to scroll through
  const reelItems = [...items, ...items, ...items, ...items, ...items];

  useEffect(() => {
    if (isSpinning) {
      // The animation logic will be triggered by the start button (passed from parent)
    }
  }, [isSpinning]);

  const startSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // Determine the winning index (somewhere in the middle of the repeated items)
    // To ensure a fair result, we pick the index based on the logic in caseLogic.ts
    // But for the visual part, we just need a good "landing" spot.
    const winningIndex = Math.floor(Math.random() * (reelItems.length - 20)) + 10;
    const targetIndex = winningIndex + 20; // Aim for a point deep in the reel

    // Calculate animation duration: more items = longer time
    // Base time + (distance * speed_multiplier)
    const duration = 4 + (targetIndex * 0.05); 

    await controls.start({
      x: [-1000, -targetIndex * 200], // Adjusting x based on item width (e.g., 200px)
      transition: {
        duration: duration,
        easeOut: [0.22, 1, 0.36, 1], // Custom easing for a realistic "slow down" effect
      },
    });

    // Wait for the spin to finish then snap to the result
    setTimeout(() => {
      setIsSpinning(false);
      const finalItem = reelItems[targetIndex];
      onComplete(finalItem);
    }, 500);
  };

  return (
    <div className="relative w-full h-48 bg-surface border-y border-white/10 overflow-hidden flex items-center">
      {/* Pointer / Indicator */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-accent shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
      
      {/* The Reel */}
      <motion.div 
        animate={controls}
        className="flex gap-4 px-10"
        style={{ width: 'max-content' }}
      >
        {reelItems.map((item, idx) => (
          <div 
            key={`${item.id}-${idx}`}
            className="w-40 h-32 flex-shrink-0 flex flex-col items-center justify-center bg-surface border border-white/5 rounded-xl p-2"
          >
            <img src={item.image} alt={item.name} className="w-full h-20 object-cover rounded-lg mb-2" />
            <span className="text-[10px] font-bold text-center truncate w-full">{item.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Roulette;
