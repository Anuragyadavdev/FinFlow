import clsx from 'clsx';

const variants = {
  default: 'bg-white/10 text-gray-300',
  primary: 'bg-primary-500/20 text-primary-300',
  green:   'bg-accent-green/20 text-accent-green',
  red:     'bg-accent-red/20 text-accent-red',
  amber:   'bg-accent-amber/20 text-accent-amber',
  cyan:    'bg-accent-cyan/20 text-accent-cyan',
};

export default function Badge({ variant = 'default', className, children }) {
  return (
    <span className={clsx('pill', variants[variant], className)}>
      {children}
    </span>
  );
}