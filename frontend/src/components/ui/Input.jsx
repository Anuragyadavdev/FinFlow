import clsx from 'clsx';
import { forwardRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = forwardRef(
  ({ label, error, icon: Icon, className, type = 'text', ...rest }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';
    const actualType = isPassword ? (show ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && <label className="label-base">{label}</label>}
        <div className="relative">
          {Icon && (
            <Icon
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
          )}
          <input
            ref={ref}
            type={actualType}
            className={clsx(
              'input-base',
              Icon && 'pl-11',
              isPassword && 'pr-11',
              error &&
                'border-accent-red focus:border-accent-red focus:ring-accent-red/20',
              className
            )}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-accent-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;