export default function Button({ children, variant = "default", className = "", ...props }) {
  return <button className={`btn ${variant === "primary" ? "btn-primary" : ""} ${className}`} {...props}>{children}</button>;
}