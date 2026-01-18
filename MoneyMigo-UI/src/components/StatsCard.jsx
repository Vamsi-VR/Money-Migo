function StatsCard({ title, value, icon }) {
  return (
    <div className="bg-[#1d1d1d] flex items-center px-4 sm:px-6 py-4 rounded-xl shadow-lg w-auto">
      <div className="flex-1">
        <p className="text-white text-sm sm:text-lg font-medium">{title}</p>
        <p className="text-white text-xl sm:text-2xl font-bold">{value}</p>
        {icon && <div className="text-white mt-2">{icon}</div>}
      </div>
    </div>
  );
}
export default StatsCard;
