import { colors, borderRadius, shadows } from '../../theme';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity"
          style={{ backgroundColor: colors.overlay }}
          onClick={onClose}
        />

        {/* Modal */}
        <div 
          className={`relative ${sizes[size]} w-full max-h-[90vh] overflow-hidden`}
          style={{
            backgroundColor: colors.background,
            borderRadius: borderRadius.xl,
            boxShadow: shadows.xxl,
          }}
        >
          {title && (
            <div 
              className="px-6 py-4 border-b"
              style={{ borderColor: colors.border }}
            >
              <h3 className="text-xl font-semibold" style={{ color: colors.text }}>{title}</h3>
            </div>
          )}
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
