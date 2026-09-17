import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function AnimatedNumber({
  value = 0,
  duration = 1.2,
  format = 'currency',
  className = '',
}) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);
  const rafRef = useRef();

  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;
    const target = Number(value) || 0;

    const step = (ts) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = fromRef.current + (target - fromRef.current) * eased;
      setDisplay(current);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const text = format === 'currency'
    ? formatCurrency(display)
    : Math.round(display).toLocaleString('en-IN');

  return <span className={className}>{text}</span>;
}