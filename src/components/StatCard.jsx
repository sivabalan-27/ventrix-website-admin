
function StatCard({ title, value, description, icon: Icon, color }) {
    const colors = {
      blue: "bg-blue-500/10 text-blue-400",
      cyan: "bg-cyan-500/10 text-cyan-400",
      purple: "bg-purple-500/10 text-purple-400",
      orange: "bg-orange-500/10 text-orange-400",
    };
  
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0c1424] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">
              {title}
            </p>
  
            <h3 className="mt-3 text-3xl font-bold text-white">
              {value}
            </h3>
          </div>
  
          <div className={`rounded-xl p-3 ${colors[color] || colors.blue}`}>
            <Icon size={22} />
          </div>
        </div>
  
        <p className="mt-5 text-xs text-slate-500">
          {description}
        </p>
      </div>
    );
  }
  
  export default StatCard;
  