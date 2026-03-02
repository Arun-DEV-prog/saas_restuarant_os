export default function StatCard({ title, value, icon, bg }) {
  return (
    <div
      className={`rounded-xl p-5 shadow-md min-h-[120px] flex flex-col justify-between transition-colors ${bg}`}
    >
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm opacity-90">{title}</p>
        <h2 className="text-3xl font-bold">{value}</h2>
      </div>
    </div>
  );
}
