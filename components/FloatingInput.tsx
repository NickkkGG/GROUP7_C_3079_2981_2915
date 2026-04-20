import { InputHTMLAttributes, ReactNode, useState } from 'react';

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

export default function FloatingInput({
  label,
  error,
  value,
  onChange,
  icon,
  rightIcon,
  onRightIconClick,
  ...props
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && String(value).length > 0;

  return (
    <div className="relative">
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-white/60 flex-shrink-0 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          {...props}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder=" "
          className={`w-full px-4 py-3 rounded-[12px] bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#003fcc] focus:bg-white/15 transition-all duration-300 font-medium peer ${
            icon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''}`}
        />
        {rightIcon && (
          onRightIconClick ? (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute right-3 text-white/60 hover:text-white/80 flex-shrink-0 transition-colors"
              tabIndex={-1}
            >
              {rightIcon}
            </button>
          ) : (
            <div className="absolute right-3 text-white/60 flex-shrink-0 pointer-events-none">
              {rightIcon}
            </div>
          )
        )}
      </div>
      <label
        className={`absolute left-4 transition-all duration-300 pointer-events-none font-semibold ${
          icon ? 'left-10' : 'left-4'
        } ${
          isFocused || hasValue
            ? 'top-0.5 text-xs text-white/60 scale-90 origin-left'
            : 'top-3.5 text-sm text-white/80'
        }`}
      >
        {label}
      </label>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
