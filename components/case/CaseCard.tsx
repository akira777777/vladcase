import React, { useState } from 'react';
import { openCase } from '@/lib/caseLogic';
import { useEconomy } from '@/hooks/useEconomy';
import { Case, Item } from '@/types';
import Roulette from './roulette/Roulette';

interface CaseCardProps {
  caseData: Case;
}

const CaseCard: React.FC<CaseCardProps> = ({ caseData }) => {
  const { balance, updateBalance, addXp } = useEconomy();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Item | null>(null);

  const handleOpen = () => {
    if (balance >= caseData.price && !isSpinning && !result) {
      setIsSpinning(true);
      setResult(null);
      
      // Запускаем открытие
      const winningItem = openCase(caseData);
      
      // В реальной системе мы бы использовали пропсы для запуска анимации рулетки
      // Здесь мы имитируем завершение через 5 секунд (время анимации + задержка)
      setTimeout(() => {
        setResult(winningItem);
        updateBalance(-caseData.price);
        addXp(50);
        setIsSpinning(false);
      }, 5000);
    }
  };

  return (
    <div className="metallic-card p-6 rounded-2xl flex flex-col gap-4 transition-all hover:border-white/20">
      <img 
        src={caseData.image} 
        alt={caseData.name} 
        className="w-full h-48 object-cover rounded-xl"
      />
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">{caseData.name}</h3>
          <p className="text-secondary text-sm">{caseData.category}</p>
        </div>
        <span className="text-white font-bold text-lg">${caseData.price}</span>
      </div>

      {!result ? (
        <button 
          onClick={handleOpen}
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
        <div className="mt-2 p-4 bg-white/5 rounded-xl border border-white/10 animate-in fade-in zoom-in">
          <p className="text-xs text-secondary mb-1">YOU WON:</p>
          <div className="flex items-center gap-3">
            <img src={result.image} className="w-16 h-16 rounded-lg object-cover border border-white/20" />
            <p className="text-lg font-bold text-accent">{result.name}</p>
          </div>
        </div>
      )}

      {/* Визуальная рулетка появляется только в момент открытия */}
      {isSpinning && (
        <div className="mt-4">
          <Roulette 
            items={caseData.items} 
            onComplete={(item) => {
              setResult(item);
              setIsSpinning(false);
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default CaseCard;
