import { Search, Bell, Video, User, LogOut, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  onJoinClass: () => void;
}

const Navbar = ({ onJoinClass }: Props) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-6 gap-4 shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-6">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <h1 className="font-display font-bold text-lg text-foreground tracking-tight">MedAI</h1>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-md hidden md:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search doubts, cases, UKMLA content…"
          className="w-full bg-muted text-sm text-foreground placeholder:text-muted-foreground rounded-lg pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-ring/30 transition-all"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Join Live Class */}
        <button
          onClick={onJoinClass}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:shadow-md"
        >
          <Video size={16} />
          Join Live Mentoring
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                {user.name?.substring(0, 2).toUpperCase() || <User size={16} />}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user.name}</span>
                <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full mt-1 w-fit uppercase font-bold">{user.role}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Profile Settings</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-rose-500 focus:text-rose-500" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
