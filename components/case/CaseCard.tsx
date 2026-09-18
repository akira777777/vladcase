import React from 'react';
import { openCase } from '@/lib/caseLogic';
import { useEconomy } from '@/hooks/useEconomy';
import { Case, Item } from '@/types';
import Roulette from './roulette/Roulette';

interface CaseCardProps {
  caseData: Case;
  onSuccess?: (item: Item) => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ caseData, onSuccess }) => {
  const { balance, updateBalance, addXp } = useEconomy();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Item | null>(null);
  const [winningItem, setWinningItem] = useState<Item | null>(null);

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
      }, 5000);
    }
  };

  const getRarityClass = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'rarity-common';
      case 'uncommon': return 'rarity-uncommon';
      case 'rare': return 'rarity-rare';
      case 'mythic': return 'rarity-mythic';
      case 'legendary': return 'rarity-legendary';
      case 'exotic': return 'rarity-exotic';
      default: return '';
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 transition-all hover:border-white/20 border border-white/5">
      <div className="relative overflow-hidden rounded-xl">
        <img 
          src={caseData.image} 
          alt={caseData.name} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 p-4">
          <h3 className="text-xl font-bold metallic-text">{caseData.name}</h3>
          <p className="text-secondary text-sm">{caseData.category}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-white font-bold text-lg">${caseData.price}</span>
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
      </div>

      {!result ? (
        <div className="mt-auto" />
      ) : (
        <div className={`mt-auto p-4 rounded-xl border animate-in fade-in zoom-in ${getRarityClass(winningItem?.rarity)} bg-white/5 border-2 shadow-[0_0_15px_rgba(255,255,255,0.05)]`}>
          <p className="text-xs text-secondary mb-1 font-bold uppercase tracking-wider">YOU WON:</p>
          <div className="flex items-center gap-3">
            <img src={winningItem?.image} className="w-16 h-16 rounded-lg object-cover border border-white/20 shadow-lg" />
            <p className="text-lg font-bold">{winningItem?.name}</p>
          </div>
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
    </div>
  );
};

export default CaseCard;
