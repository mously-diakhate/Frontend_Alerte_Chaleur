import React from 'react';

function StatsCard({ title, value, icon }) {
  return (
    <div className="p-4 bg-white rounded shadow text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <h4 className="text-xl font-bold">{value}</h4>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
}

export default StatsCard;
