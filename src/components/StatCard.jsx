export default function StatCard({ title, value, color }) {
  const colorMap = {
    blue: "text-blue-600",
    red: "text-red-600",
    green: "text-green-600",
    orange: "text-orange-500",
  };
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
      <p className={`text-4xl font-extrabold mt-3 ${colorMap[color] || "text-gray-800"}`}>
        {value}
      </p>
    </div>
  );
}
