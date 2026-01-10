const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-md overflow-hidden ${
        hover ? 'hover:shadow-xl transition-shadow duration-200 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
