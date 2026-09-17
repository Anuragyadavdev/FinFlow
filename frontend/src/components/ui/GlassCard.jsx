import clsx from 'clsx';

export default function GlassCard({ className, children, hover = false, ...rest }) {
  return (
    <div
      className={clsx(
        'glass-card p-6',
        hover && 'transition-all duration-300 hover:border-white/20 hover:shadow-glow-primary/20 hover:-translate-y-0.5',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}