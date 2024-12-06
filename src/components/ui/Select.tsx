import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select: React.FC<SelectProps> = ({ children, ...props }) => (
  <select
    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none"
    {...props}
  >
    {children}
  </select>
);

export const SelectItem: React.FC<{ value: string }> = ({
  value,
  children,
}) => <option value={value}>{children}</option>;

export const SelectContent: React.FC = ({ children }) => (
  <optgroup>{children}</optgroup>
);

export const SelectTrigger: React.FC = ({ children }) => <>{children}</>;

export const SelectValue: React.FC<{ placeholder: string }> = ({
  placeholder,
}) => (
  <option value="" disabled hidden>
    {placeholder}
  </option>
);
