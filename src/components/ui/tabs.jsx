import React, { useState } from "react";

export function Tabs({ children, defaultValue }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <div>
      {React.Children.map(children, (child) => {
        if (child.type === TabsList) {
          return React.cloneElement(child, { active, setActive });
        }
        if (child.type === TabsContent && child.props.value === active) {
          return child;
        }
        return null;
      })}
    </div>
  );
}

export function TabsList({ children, active, setActive }) {
  return (
    <div className="flex space-x-2 mb-4 border-b">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { active, setActive })
      )}
    </div>
  );
}

export function TabsTrigger({ value, children, active, setActive }) {
  const isActive = value === active;
  return (
    <button
      onClick={() => setActive(value)}
      className={`px-4 py-2 rounded-t ${isActive ? "bg-white border border-b-transparent" : "bg-gray-100 text-gray-500"}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }) {
  return <div className="p-4 bg-white rounded-b shadow">{children}</div>;
}
