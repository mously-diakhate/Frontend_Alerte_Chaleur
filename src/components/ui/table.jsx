import React from "react";

export function Table({ children }) {
  return (
    <table className="w-full border-collapse border border-gray-300">
      {children}
    </table>
  );
}

export function TableHeader({ children }) {
  return <thead className="bg-gray-200">{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }) {
  return <tr className="border-t">{children}</tr>;
}

export function TableCell({ children }) {
  return <td className="px-4 py-2 border">{children}</td>;
}
