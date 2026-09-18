import React from 'react';
import { openCase } from '@/lib/caseLogic';
import { useEconomy } from '@/hooks/useEconomy';
import { Case } from '@/types';

interface CaseCardProps {
  caseData: Case;
}

const CaseCard: React.FC<CaseCardProps> = ({ caseData }) => {
  const { balance, updateBalance, addXp } = useEconomy();
  const [isOpening, setIsOpening] = React.useState(false);
  const [result, setResult] = React.useState<Item | null>(null);

  const handleOpen = () => {
    if (balance >= caseData.price && !isOpening) {
      setIsOpening(true);
      setResult(null);
      
      // Имитация задержки открытия (для будущего анимационного эффекта)
      setTimeout(() => {
        const winningItem = openCase(caseData);
        setResult(winningItem);
        updateBalance(-caseData.price);
        addXp(50); // Даем опыт за открытие
        setIsOpening(false);
      }, 1500);
    }
  };

  return (
    <div className="metallic-card p-6 rounded-2xl flex flex-col gap-4 transition-all hover:border-white/20">
      <img 
        src={caseData.image} 
        alt={caseData.name} 
        className="w-full h-48 object-cover rounded-xl"
      />
      <div>
        <h3 className="text-xl font-bold">{caseData.name}</h3>
        <p className="text-secondary text-sm">{caseData.category}</p>
      </div>
      
      <div className="flex justify-between items-center mt-auto">
        <span className="text-white font-bold text-lg">${caseData.price}</span>
        <button 
          onClick={handleOpen}
          disabled={isOpening || balance < caseData.price}
          className={`px-4 py-2 rounded-md font-bold transition-all ${
            balance >= caseData.price && !isOpening 
            ? 'bg-white text-black hover:bg-accent' 
            : 'bg-white/10 text-white cursor-not-allowed'
          }`}
        >
          {isOpening ? 'Opening...' : 'Open Case'}
        </button>
      </div>

      {result && (
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 animate-in fade-in zoom-in">
          <p className="text-xs text-secondary">You got:</p>
          <p className="text-lg font-bold text-accent">{result.name}</p>
        </div>
      )}
    </div>
  );
};

export default CaseCard;
