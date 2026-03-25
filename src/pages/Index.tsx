import { useState } from "react";
import Navbar from "@/components/Navbar";
import GroupsPanel from "@/components/GroupsPanel";
import SectionsPanel from "@/components/SectionsPanel";
import ChatArea from "@/components/ChatArea";
import ParticipantsSidebar from "@/components/ParticipantsSidebar";
import CreateClassModal from "@/components/CreateClassModal";
import CreateChannelModal from "@/components/CreateChannelModal";
import { Users, LayoutSidebar, ChevronLeft, ChevronRight } from "lucide-react";
import { useChat } from "@/hooks/useChat";

const Index = () => {
  const {
    groups,
    channels,
    messages,
    members,
    typingUsers,
    activeGroupId,
    setActiveGroupId,
    activeChannelId,
    setActiveChannelId,
    loading,
    sendMessage,
    sendFile,
    verifyMessage,
    flagMessage,
    setTypingStatus,
    refreshGroups,
    refreshChannels
  } = useChat();

  const [showParticipants, setShowParticipants] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [isSectionsCollapsed, setIsSectionsCollapsed] = useState(false);

  const activeGroup = groups.find((g) => g.id === activeGroupId);
  const activeChannel = channels.find((c) => c.id === activeChannelId);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      <Navbar onJoinClass={() => window.open("https://meet.google.com", "_blank")} />

      <div className="flex flex-1 min-h-0">
        {/* Left Column: Groups - White in Light, Slate in Dark */}
        <GroupsPanel
          groups={groups.map(g => ({ 
            ...g, 
            shortName: g.short_name || g.name.substring(0, 2).toUpperCase(),
            memberCount: g.memberCount || 0 
          }))}
          activeGroupId={activeGroupId || ""}
          onSelectGroup={setActiveGroupId}
          onCreateGroup={() => setShowCreateGroup(true)}
        />

        {/* Middle Column: Categories/Sections - Greyish Background */}
        {!isSectionsCollapsed && (
          <SectionsPanel
            group={activeGroup}
            sections={channels}
            activeSectionId={activeChannelId || ""}
            onSelectSection={setActiveChannelId}
            onCreateSection={() => setShowCreateChannel(true)}
          />
        )}

        {/* Right Column: Discussions/Chat - White/Clear Background */}
        <div className="flex flex-1 min-w-0 relative bg-chat-custom">
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsSectionsCollapsed(!isSectionsCollapsed)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-6 h-12 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:text-primary transition-all"
            title={isSectionsCollapsed ? "Open Sections" : "Close Sections"}
          >
            {isSectionsCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <ChatArea
            messages={messages}
            typingUsers={typingUsers}
            channelName={activeChannel?.name ?? "Discussions"}
            onSendMessage={sendMessage}
            onSendFile={sendFile}
            onVerify={verifyMessage}
            onFlag={flagMessage}
            onTyping={setTypingStatus}
            userRole={user.role}
          />

          {/* Participants toggle */}
          <div className="absolute top-2 right-3 flex items-center gap-2 z-10">
            <button
              onClick={() => setShowParticipants((p) => !p)}
              className={`p-2 rounded-lg transition-colors ${
                showParticipants ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Users size={18} />
            </button>
          </div>

          {showParticipants && (
            <ParticipantsSidebar
              participants={members.map(m => ({ ...m, online: true }))}
              onClose={() => setShowParticipants(false)}
            />
          )}
        </div>
      </div>

      <CreateClassModal 
        open={showCreateGroup} 
        onClose={() => setShowCreateGroup(false)} 
        onSuccess={refreshGroups}
      />
      <CreateChannelModal
        open={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
        onSuccess={refreshChannels}
        groupId={activeGroupId}
      />
    </div>
  );
};

export default Index;
