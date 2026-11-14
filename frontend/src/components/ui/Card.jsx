const Card = ({ children, className = "", as: Tag = "div", noPadding = false, ...rest }) => (
  <Tag
    className={`bg-surface border border-border rounded-2xl shadow-card ${
      noPadding ? "" : "p-5 sm:p-6"
    } ${className}`}
    {...rest}
  >
    {children}
  </Tag>
);

export default Card;
