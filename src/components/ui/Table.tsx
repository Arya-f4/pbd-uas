import React from "react";

export const Table: React.FC = ({ children }) => (
  <table className="min-w-full border-collapse">{children}</table>
);

export const TableHeader: React.FC = ({ children }) => (
  <thead className="border-b bg-gray-100">{children}</thead>
);

export const TableBody: React.FC = ({ children }) => <tbody>{children}</tbody>;

export const TableRow: React.FC = ({ children }) => (
  <tr className="border-b">{children}</tr>
);

export const TableCell: React.FC = ({ children }) => (
  <td className="px-4 py-2">{children}</td>
);

export const TableHead: React.FC = ({ children }) => (
  <th className="px-4 py-2 text-left font-semibold">{children}</th>
);
