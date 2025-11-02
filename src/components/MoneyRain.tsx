import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import confetti from "canvas-confetti";

export default function MoneyRain({ active }: { active: boolean }) {
  const { width, height } = useWindowSize();
  const [money, setMoney] = useState<
    { id: number; left: number; delay: number }[]
  >([]);

  useEffect(() => {
    if (!active) return;

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

  useEffect(() => {
    //confetti gun
    if (!active) return;

    const shoot = (xOrigin: number) => {
      confetti({
        particleCount: 150,
        startVelocity: 80,
        spread: 40,
        angle: xOrigin < 0.5 ? 60 : 120, // shooting angle
        origin: { x: xOrigin, y: 1 }, // bottom corners
      });
    };

    const timeout = setTimeout(() => {
      shoot(0);
      shoot(1);
    }, 100);

    return () => clearTimeout(timeout);
  }, [active]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-51">
      {active && <Confetti width={width} height={height} />}

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
