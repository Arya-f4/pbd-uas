import React from "react";

interface BadgeProps {
  variant?: "default" | "secondary";
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant = "default", children }) => {
  const variantClasses = {
    default: "bg-blue-500 text-white",
    secondary: "bg-gray-300 text-gray-800",
  };

  return (
    <span
      className={`rounded px-2 py-1 text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
};

export default Badge;
