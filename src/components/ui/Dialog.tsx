import React from "react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            &times;
          </button>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
};

export const DialogHeader: React.FC = ({ children }) => (
  <header className="mb-4">{children}</header>
);

export const DialogFooter: React.FC = ({ children }) => (
  <footer className="mt-4">{children}</footer>
);
export const DialogTrigger: React.FC<{ asChild: boolean }> = ({
  children,
  asChild,
}) => {
  return <>{asChild ? children : <button>{children}</button>}</>;
};
export const DialogContent: React.FC = ({ children }) => (
  <main>{children}</main>
);
export default Dialog;
export const DialogTitle: React.FC = ({ children }) => (
  <h2 className="text-xl font-semibold">{children}</h2>
);
