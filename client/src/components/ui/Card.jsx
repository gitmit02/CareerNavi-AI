const Card = ({ children, className = "", as: Tag = "div", noPadding = false, ...rest }) => (
  <Tag
    className={`relative overflow-hidden bg-surface border border-border rounded-2xl shadow-card transition-all duration-200 ${
      noPadding ? "" : "p-5 sm:p-6"
    } ${className}`}
    {...rest}
  >
    {children}
  </Tag>
);

export default Card;
