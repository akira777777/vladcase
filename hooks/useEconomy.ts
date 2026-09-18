import { useState, useEffect } from 'react';

export function useEconomy() {
  const [balance, setBalance] = useState<number>(1000); // Начальный баланс
  const [xp, setXp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);

  useEffect(() => {
    // Загрузка из localStorage при инициализации
    const savedBalance = localStorage.getItem('vladcase_balance');
    const savedXp = localStorage.getItem('vladcase_xp');
    if (savedBalance) setBalance(Number(savedBalance));
    if (savedXp) {
      const currentXp = Number(savedXp);
      setXp(currentXp);
      setLevel(Math.floor(currentXp / 1000) + 1);
    }
  }, []);

  const updateBalance = (amount: number) => {
    setBalance(prev => {
      const newBalance = prev + amount;
      localStorage.setItem('vladcase_balance', newBalance.toString());
      return newBalance;
    });
  };

  const addXp = (amount: number) => {
    setXp(prev => {
      const newXp = prev + amount;
      localStorage.setItem('vladcase_xp', newXp.toString());
      if (newXp >= 1000) {
        setLevel(prev => prev + 1);
        // Можно добавить уведомление о повышении уровня
      }
      return newXp;
    });
  };

  return { balance, xp, level, updateBalance, addXp };
}
