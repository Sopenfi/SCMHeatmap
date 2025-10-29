import { useEffect, useState } from "react";

export default function MoneyRain({ active }: { active: boolean }) {
  const [money, setMoney] = useState<
    { id: number; left: number; delay: number }[]
  >([]);

  useEffect(() => {
    if (!active) return; // stop spawning when inactive

    const interval = setInterval(() => {
      const id = Date.now();
      const left = Math.random() * 100;
      const delay = 0;
      setMoney((prev) => [...prev, { id, left, delay }]);

      // remove after animation
      setTimeout(() => {
        setMoney((prev) => prev.filter((m) => m.id !== id));
      }, 4000);
    }, 50);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {money.map(({ id, left, delay }) => (
        <span
          key={id}
          className="absolute text-3xl animate-fall"
          style={{
            left: `${left}%`,
            animationDelay: `${delay}s`,
          }}
        >
          💸
        </span>
      ))}
    </div>
  );
}
