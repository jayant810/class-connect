import { Plus, Users, Hash } from "lucide-react";

interface Props {
  groups: any[];
  activeGroupId: string;
  onSelectGroup: (id: string) => void;
  onCreateGroup: () => void;
}

const GroupsPanel = ({ groups, activeGroupId, onSelectGroup, onCreateGroup }: Props) => {
  return (
    <div className="w-64 bg-sidebar-custom border-r border-border flex flex-col shrink-0">
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">My Groups</h2>
          <button
            onClick={onCreateGroup}
            className="p-1 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-all"
            title="Create or Join Group"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-3 space-y-1.5">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
              <Hash size={20} className="text-slate-600" />
            </div>
            <p className="text-xs text-slate-500 font-medium">No groups yet</p>
            <button 
              onClick={onCreateGroup}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 mt-2 font-semibold"
            >
              Create your first one
            </button>
          </div>
        ) : (
          groups.map((group) => {
            const isActive = group.id === activeGroupId;
            return (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 group border ${
                  isActive
                    ? "bg-indigo-600/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5"
                    : "hover:bg-slate-800/50 border-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-transform ${isActive ? "scale-105" : "group-hover:scale-105"}`}
                    style={{
                      backgroundColor: `hsl(${group.color || '220 72% 50%'} / 0.15)`,
                      color: `hsl(${group.color || '220 72% 50%'})`,
                    }}
                  >
                    {group.shortName}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate transition-colors ${isActive ? "text-white" : "text-slate-300 group-hover:text-slate-100"}`}>
                      {group.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1 opacity-60">
                      <Users size={10} className="text-slate-400" />
                      <span className="text-[10px] text-slate-400 font-medium">{group.memberCount || 0} members</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GroupsPanel;
