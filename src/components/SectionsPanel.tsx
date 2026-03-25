import { MessageSquare, FileText, FolderOpen, Megaphone, Code, Upload, BookOpen, Lightbulb, Plus } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  "message-square": MessageSquare,
  "file-text": FileText,
  "folder-open": FolderOpen,
  megaphone: Megaphone,
  code: Code,
  upload: Upload,
  "book-open": BookOpen,
  lightbulb: Lightbulb,
};

interface Props {
  group: any;
  sections: any[];
  activeSectionId: string;
  onSelectSection: (id: string) => void;
  onCreateSection?: () => void;
}

const SectionsPanel = ({ group, sections, activeSectionId, onSelectSection, onCreateSection }: Props) => {
  return (
    <div className="w-56 bg-middle border-r border-border flex flex-col shrink-0 transition-all duration-300">
      {/* Group header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">{group?.name || "Select Group"}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{group?.description || "Discussions"}</p>
        </div>
        {onCreateSection && (
          <button
            onClick={onCreateSection}
            className="p-1 text-muted-foreground hover:text-primary transition-colors ml-2 shrink-0"
            title="Create Channel"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Sections list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
        {sections.map((section) => {
          const Icon = iconMap[section.icon] || MessageSquare;
          const isActive = section.id === activeSectionId;
          return (
            <button
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? "bg-card text-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/60"
              }`}
            >
              <Icon size={16} className={isActive ? "text-primary" : ""} />
              <span className="truncate">{section.name}</span>
              {section.unread && (
                <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                  {section.unread}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SectionsPanel;
