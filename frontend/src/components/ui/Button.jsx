import clsx from 'clsx';
import { forwardRef } from 'react';

const variants = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost:   'btn-ghost',
  danger:  'btn-base bg-accent-red/90 text-white hover:bg-accent-red',
  success: 'btn-base bg-accent-green/90 text-white hover:bg-accent-green',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5',
  lg: 'px-6 py-3 text-lg',
};

const Button = forwardRef(
  ({ variant = 'primary', size = 'md', loading, className, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={clsx(variants[variant], sizes[size], className)}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? (
        <>
          <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          Loading...
        </>
      ) : children}
    </button>
  )
);

Button.displayName = 'Button';
export default Button;