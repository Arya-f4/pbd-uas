import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "md",
  children,
  ...props
}) => {
  const variantClasses = {
    default: "bg-blue-500 text-white",
    outline: "border border-blue-500 text-blue-500",
    destructive: "bg-red-500 text-white",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`rounded ${variantClasses[variant]} ${sizeClasses[size]} focus:outline-none`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
