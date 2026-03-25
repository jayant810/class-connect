import { X, GraduationCap, ShieldCheck, Crown } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: "owner" | "admin" | "mentor" | "student";
  online: boolean;
}

interface Props {
  participants: Participant[];
  onClose: () => void;
}

const ParticipantsSidebar = ({ participants, onClose }: Props) => {
  const staff = participants.filter((p) => ["owner", "admin", "mentor"].includes(p.role));
  const students = participants.filter((p) => p.role === "student");
  const online = students.filter((p) => p.online);
  const offline = students.filter((p) => !p.online);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return <Crown size={12} className="text-amber-500 shrink-0" />;
      case "admin": return <ShieldCheck size={12} className="text-rose-500 shrink-0" />;
      case "mentor": return <GraduationCap size={12} className="text-indigo-500 shrink-0" />;
      default: return null;
    }
  };

  const renderUser = (p: Participant, isStaff: boolean = false) => (
    <div key={p.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors group cursor-pointer">
      <div className="relative">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          isStaff ? "bg-indigo-500/10 text-indigo-400" : "bg-slate-800 text-slate-400"
        }`}>
          {p.avatar || p.name.substring(0, 2).toUpperCase()}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
          p.online ? "bg-emerald-500" : "bg-slate-600"
        }`} />
      </div>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={`text-sm truncate ${
          p.online ? "text-slate-200" : "text-slate-500"
        } ${isStaff ? "font-medium" : ""}`}>
          {p.name}
        </span>
        {getRoleIcon(p.role)}
      </div>
    </div>
  );

  return (
    <div className="w-60 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
      <div className="h-12 flex items-center justify-between px-4 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-slate-200">Community</h3>
        <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-200 rounded transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-6">
        {staff.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2 mb-2">Mentors & Admins</p>
            <div className="space-y-0.5">
              {staff.map((p) => renderUser(p, true))}
            </div>
          </div>
        )}

        {online.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2 mb-2">Online Students — {online.length}</p>
            <div className="space-y-0.5">
              {online.map((p) => renderUser(p))}
            </div>
          </div>
        )}

        {offline.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2 mb-2">Offline — {offline.length}</p>
            <div className="space-y-0.5">
              {offline.map((p) => renderUser(p))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantsSidebar;
