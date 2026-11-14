
import { Menu } from "lucide-react";

function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-slate-800 bg-[#080d18]/95 px-5 backdrop-blur-xl md:px-8">

      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-lg font-semibold text-white">
            Admin Dashboard
          </h2>
          <p className="mt-1 hidden text-xs text-slate-500 sm:block">
            Welcome to Ventrix Admin Portal
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center">
        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/15 text-sm font-semibold text-blue-400">
            A
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
