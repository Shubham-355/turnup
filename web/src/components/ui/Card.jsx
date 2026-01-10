import { colors, shadows, borderRadius } from '../../theme';

const Card = ({ children, className = '', hover = false, onClick, style = {} }) => {
  const baseStyle = {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    boxShadow: shadows.sm,
    overflow: 'hidden',
    transition: 'box-shadow 0.2s ease',
  };

  const hoverStyle = hover ? {
    cursor: 'pointer',
  } : {};

  const combinedStyle = { ...baseStyle, ...hoverStyle, ...style };

  return (
    <div
      onClick={onClick}
      className={`${hover ? 'hover:shadow-lg' : ''} ${className}`}
      style={combinedStyle}
      onMouseEnter={(e) => {
        if (hover) e.currentTarget.style.boxShadow = shadows.md;
      }}
      onMouseLeave={(e) => {
        if (hover) e.currentTarget.style.boxShadow = shadows.sm;
      }}
    >
      {children}
    </div>
  );
};

export default Card;
