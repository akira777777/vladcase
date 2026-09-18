import React, { useState } from 'react';
import { openCase } from '@/lib/caseLogic';
import { useEconomy } from '@/hooks/useEconomy';
import { Case, Item } from '@/types';
import Roulette from './roulette/Roulette';
import WinScreen from './WinScreen';
import { motion, AnimatePresence } from 'framer-motion';

interface CaseCardProps {
  caseData: Case;
  onSuccess?: (item: Item) => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ caseData, onSuccess }) => {
  const { balance, updateBalance, addXp } = useEconomy();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Item | null>(null);
  const [winningItem, setWinningItem] = useState<Item | null>(null);
  const [showWinScreen, setShowWinScreen] = useState(false);

  const startOpening = () => {
    if (balance >= caseData.price && !isSpinning && !result) {
      setIsSpinning(true);
      setResult(null);
      setWinningItem(null);
      
      const item = openCase(caseData);
      setWinningItem(item);
      
      setTimeout(() => {
        updateBalance(-caseData.price);
        addXp(50);
        setIsSpinning(false);
        if (onSuccess) onSuccess(item);
        setShowWinScreen(true);
      }, 5000);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 transition-all hover:border-white/20 border border-white/5">
      <img 
        src={caseData.image} 
        alt={caseData.name} 
        className="w-full h-48 object-cover rounded-xl"
      />
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h3 className="text-xl font-bold metallic-text">{caseData.name}</h3>
          <p className="text-secondary text-sm">{caseData.category}</p>
        </div>
        <span className="text-white font-bold text-lg">${caseData.price}</span>
      </div>

      {!result ? (
        <button 
          onClick={startOpening}
          disabled={isSpinning || balance < caseData.price}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            balance >= caseData.price && !isSpinning 
            ? 'bg-white text-black hover:bg-accent' 
            : 'bg-white/10 text-white cursor-not-allowed'
          }`}
        >
          {isSpinning ? 'Spinning...' : 'Open Case'}
        </button>
      ) : (
        <div className="mt-auto p-3 bg-white/5 rounded-xl border border-white/10 animate-in fade-in zoom-in">
          <p className="text-xs text-secondary mb-1 font-bold uppercase">Last Win:</p>
          <p className="text-sm font-bold">{winningItem?.name}</p>
        </div>
      )}

      {isSpinning && winningItem && (
        <div className="mt-4">
          <Roulette 
            items={caseData.items} 
            onComplete={() => {}} 
          />
        </div>
      )}

      <AnimatePresence>
        {showWinScreen && winningItem && (
          <WinScreen 
            item={winningItem} 
            onClose={() => setShowWinScreen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CaseCard;
