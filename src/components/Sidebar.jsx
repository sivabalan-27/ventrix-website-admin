
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  MessageSquare,
  X,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Overview", path: "/", icon: LayoutDashboard },
  { name: "Job Applications", path: "/applications", icon: BriefcaseBusiness },
  { name: "Service Enquiries", path: "/enquiries", icon: MessageSquare },
];

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    navigate("/login", { replace: true });
    onClose();
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-slate-800 bg-[#0c1424]
          transition-transform duration-300
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-800 px-6">
          <div>
            <h1 className="text-xl font-extrabold tracking-wide text-white">
              VENTRIX<span className="text-cyan-400">.</span>
            </h1>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[3px] text-slate-500">
              Admin Portal
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-7">
          <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[2px] text-slate-500">
            Workspace
          </p>

          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                        : "border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-white"
                    }`
                  }
                >
                  <Icon size={19} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
