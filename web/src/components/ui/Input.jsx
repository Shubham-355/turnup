import { colors, borderRadius, spacing } from '../../theme';

const Input = ({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
          {label}
          {required && <span className="ml-1" style={{ color: colors.error }}>*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textTertiary }}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-4 py-3 ${Icon ? 'pl-10' : ''} border rounded-xl focus:outline-none focus:ring-2 transition-all ${className}`}
          style={{
            borderColor: error ? colors.error : colors.border,
            backgroundColor: disabled ? colors.surfaceLight : colors.surface,
            color: colors.text,
            borderRadius: borderRadius.lg,
          }}
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-sm" style={{ color: colors.error }}>{error}</p>}
    </div>
  );
};

export default Input;
