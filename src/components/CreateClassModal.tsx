import { X, BookOpen, Users } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COLORS = [
  "220 72% 50%", // Indigo
  "168 80% 50%", // Teal
  "38 92% 55%",  // Orange
  "142 70% 50%", // Green
  "340 75% 55%", // Pink
];

const CreateClassModal = ({ open, onClose, onSuccess }: Props) => {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortName, setShortName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === "create") {
        if (!name.trim() || !shortName.trim()) {
          toast({ variant: "destructive", title: "Validation Error", description: "Name and Short Name are required." });
          return;
        }
        await api.post("/groups", { name, description, shortName, color });
        toast({ title: "Success", description: "Group created successfully." });
      } else {
        if (!inviteCode.trim()) {
          toast({ variant: "destructive", title: "Validation Error", description: "Invite code is required." });
          return;
        }
        await api.post("/groups/join", { groupId: inviteCode });
        toast({ title: "Success", description: "Joined group successfully." });
      }
      onSuccess();
      onClose();
      // Reset fields
      setName("");
      setDescription("");
      setShortName("");
      setInviteCode("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md p-0 overflow-hidden">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{mode === "create" ? "Create a Group" : "Join a Group"}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {mode === "create" ? "Set up a new space for your medical team." : "Enter a code to join an existing team."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
          <div className="px-6 mb-4">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
              <TabsTrigger value="create" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <BookOpen size={14} className="mr-2" /> Create
              </TabsTrigger>
              <TabsTrigger value="join" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <Users size={14} className="mr-2" /> Join
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 pb-6 space-y-4">
            <TabsContent value="create" className="space-y-4 mt-0">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="group-name" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Group Name</Label>
                  <Input
                    id="group-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="UKMLA Study Group"
                    className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-indigo-500"
                  />
                </div>
                <div className="w-24 space-y-2">
                  <Label htmlFor="short-name" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Initials</Label>
                  <Input
                    id="short-name"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="UK"
                    maxLength={3}
                    className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-indigo-500 text-center"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this group about?"
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Theme Color</Label>
                <div className="flex gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color === c ? "border-white scale-110 shadow-lg shadow-white/10" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: `hsl(${c})` }}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="join" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="invite-code" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Invite Code (Group ID)</Label>
                <Input
                  id="invite-code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                  className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-indigo-500"
                />
              </div>
            </TabsContent>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all py-6 mt-2"
            >
              {loading ? "Processing..." : (mode === "create" ? "Create Group" : "Join Group")}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassModal;
