import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
      {...props}
    />
  );
};

export default Input;
