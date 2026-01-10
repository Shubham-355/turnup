import { colors, borderRadius, spacing } from '../../theme';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  
  const variantStyles = {
    primary: {
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
    },
    secondary: {
      backgroundColor: colors.secondary,
      color: colors.white,
      border: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.primary,
      border: `2px solid ${colors.primary}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.text,
      border: 'none',
    },
    danger: {
      backgroundColor: colors.error,
      color: colors.white,
      border: 'none',
    },
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const variantStyle = variantStyles[variant];
  
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizes[size]} ${widthClass} ${className}`}
      style={variantStyle}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
