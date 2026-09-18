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
      
      // Вычисляем результат сразу для честности
      const winningItem = openCase(caseData);
      
      // Запускаем анимацию рулетки
      // В текущей реализации Roulette сам вызывает onComplete, 
      // но нам нужно синхронизировать логику открытия и анимации.
      // Мы передадим результат в onComplete, чтобы он "зафиксировался".
      
      // Используем небольшой хак: Roulette внутри себя должен знать, 
      // какой именно предмет выпадает, чтобы анимация была честной.
      // Но так как мы хотим "настоящую" анимацию, мы можем передать 
      // заранее определенный результат.
    }
  };

  // Поскольку openCase возвращает результат мгновенно, мы передаем его в рулетку
  // Но для эффекта "случайности" визуально мы хотим, чтобы рулетка крутилась.
  
  // Исправленная логика:
  const [winningItem, setWinningItem] = useState<Item | null>(null);

  const startOpening = () => {
    if (balance >= caseData.price && !isSpinning && !result) {
      setIsSpinning(true);
      setResult(null);
      const item = openCase(caseData);
      setWinningItem(item);
      
      // Запускаем анимацию через 100мс чтобы избежать конфликтов рендеринга
      setTimeout(() => {
        updateBalance(-caseData.price);
        addXp(50);
      }, 5000); // Время совпадает с анимацией рулетки
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
        <div className="mt-2 p-4 bg-white/5 rounded-xl border border-white/10 animate-in fade-in zoom-in">
          <p className="text-xs text-secondary mb-1">YOU WON:</p>
          <div className="flex items-center gap-3">
            <img src={winningItem?.image} className="w-16 h-16 rounded-lg object-cover border border-white/20" />
            <p className="text-lg font-bold text-accent">{winningItem?.name}</p>
          </div>
        </div>
      )}

      {isSpinning && winningItem && (
        <div className="mt-4">
          <Roulette 
            items={caseData.items} 
            onComplete={() => {
              // Мы уже знаем результат, просто ждем завершения анимации
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default CaseCard;
