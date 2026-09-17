import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';

export default function StockCandleChart({ chart, isLoading }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !chart) return;

    // Clean up previous
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chartInstance = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 380,
      layout: {
        background: { color: 'transparent' },
        textColor: '#9CA3AF',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.08)',
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.08)',
        timeVisible: true,
      },
      crosshair: {
        vertLine: { color: '#6C63FF', width: 1, style: 2 },
        horzLine: { color: '#6C63FF', width: 1, style: 2 },
      },
    });

    const candleSeries = chartInstance.addCandlestickSeries({
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderUpColor: '#22C55E',
      borderDownColor: '#EF4444',
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
    });

    const data = (chart.points || [])
      .filter((p) => p.open != null && p.close != null)
      .map((p) => ({
        time: Math.floor(new Date(p.timestamp).getTime() / 1000),
        open: Number(p.open),
        high: Number(p.high),
        low: Number(p.low),
        close: Number(p.close),
      }));

    if (data.length) {
      candleSeries.setData(data);
      chartInstance.timeScale().fitContent();
    }

    chartRef.current = chartInstance;

    // Resize observer
    const observer = new ResizeObserver(() => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chart]);

  if (isLoading) {
    return <Skeleton className="h-[380px]" />;
  }

  if (!chart?.points?.length) {
    return (
      <EmptyState
        icon="📉"
        title="No chart data"
        description="Try a different range or symbol."
      />
    );
  }

  return <div ref={containerRef} className="w-full" />;
}