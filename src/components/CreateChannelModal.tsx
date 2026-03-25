import { X, Hash } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string | null;
}

const CreateChannelModal = ({ open, onClose, onSuccess, groupId }: Props) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Text Channels");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!groupId) return;
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Channel name is required." });
      return;
    }

    setLoading(true);
    try {
      await api.post("/channels", { groupId, name: name.trim().toLowerCase().replace(/\s+/g, '-'), category });
      toast({ title: "Success", description: "Channel created successfully." });
      onSuccess();
      onClose();
      setName("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create channel.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create Channel</DialogTitle>
          <DialogDescription className="text-slate-400">
            Channels are where your team communicates. They’re best when organized around a topic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Channel Name
            </Label>
            <div className="relative">
              <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                id="channel-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="new-topic"
                className="pl-10 bg-slate-800 border-slate-700 text-slate-100 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 italic">Name must be lowercase and hyphenated.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Category
            </Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option>Text Channels</option>
              <option>Resources</option>
              <option>Doubts</option>
              <option>Announcements</option>
            </select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all"
          >
            {loading ? "Creating..." : "Create Channel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelModal;
