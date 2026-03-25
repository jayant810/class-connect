import { Paperclip, Send, FileText, CheckCircle2, AlertCircle, HelpCircle, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Props {
  messages: any[];
  typingUsers: any[];
  channelName: string;
  onSendMessage: (content: string, isDoubt: boolean) => void;
  onSendFile: (file: File, content: string, isDoubt: boolean) => Promise<any>;
  onVerify: (messageId: string, status: 'verified' | 'incorrect') => void;
  onFlag: (messageId: string) => void;
  onTyping: (isTyping: boolean) => void;
  userRole?: string;
}

const ChatArea = ({ messages, typingUsers, channelName, onSendMessage, onSendFile, onVerify, onFlag, onTyping, userRole }: Props) => {
  const [input, setInput] = useState("");
  const [isDoubt, setIsDoubt] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input, isDoubt);
      setInput("");
      setIsDoubt(false);
      stopTyping();
    }
  };

  const stopTyping = () => {
    if (isTypingRef.current) {
      onTyping(false);
      isTypingRef.current = false;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (startTypingTimeoutRef.current) clearTimeout(startTypingTimeoutRef.current);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    setIsUploading(true);
    try {
      await onSendFile(file, input, isDoubt);
      setInput("");
      setIsDoubt(false);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);

    if (!isTypingRef.current) {
      if (startTypingTimeoutRef.current) clearTimeout(startTypingTimeoutRef.current);
      startTypingTimeoutRef.current = setTimeout(() => {
        if (newValue.trim().length > 0) {
          onTyping(true);
          isTypingRef.current = true;
        }
      }, 700);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => stopTyping(), 3000);
  };

  const getTypingText = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0].userName} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
    return `${typingUsers[0].userName} and ${typingUsers.length - 1} others are typing...`;
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-slate-900 text-slate-100">
      <div className="h-12 border-b border-slate-800 flex items-center px-5 shrink-0">
        <h3 className="text-sm font-semibold text-slate-200">#{channelName}</h3>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-1">
        {messages.map((msg, i) => {
          const showHeader = i === 0 || messages[i - 1].sender_id !== msg.sender_id;
          const timestamp = msg.created_at ? format(new Date(msg.created_at), "h:mm aa") : "";
          
          return (
            <div key={msg.id} className={`group hover:bg-slate-800/40 rounded-lg px-3 transition-colors ${showHeader ? "pt-3" : "pt-0.5"}`}>
              {showHeader && (
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
                    {msg.avatar || msg.userName?.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-slate-200">{msg.userName}</span>
                    <span className="text-[10px] text-slate-500">{timestamp}</span>
                    {msg.userRole === 'mentor' && ( staff
                      <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded border border-indigo-500/30">Mentor</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="pl-12 relative">
                {msg.verification_status === 'pending' && !msg.attachment_url && (
                  <div className="mb-2 bg-amber-500/10 border border-amber-500/20 rounded-md p-2 flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-500" />
                    <span className="text-xs text-amber-200 font-medium">Needs Verification</span>
                    {(userRole === 'mentor' || userRole === 'admin') && (
                      <div className="ml-auto flex gap-2">
                        <button onClick={() => onVerify(msg.id, 'verified')} className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded">Verify</button>
                        <button onClick={() => onVerify(msg.id, 'incorrect')} className="text-[10px] bg-rose-600 hover:bg-rose-700 text-white px-2 py-0.5 rounded">Mark Incorrect</button>
                      </div>
                    )}
                  </div>
                )}

                {msg.verification_status === 'verified' && (
                  <div className="flex items-center gap-1.5 mb-1 text-emerald-400">
                    <CheckCircle2 size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Verified Answer</span>
                  </div>
                )}

                <div className={msg.verification_status === 'incorrect' ? 'opacity-50 line-through decoration-rose-500/50' : ''}>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.verification_status === 'incorrect' && (
                  <div className="mt-1 flex items-center gap-1.5 text-rose-400">
                    <ShieldAlert size={12} />
                    <span className="text-[10px] font-medium italic">Flagged as incorrect by mentor</span>
                  </div>
                )}

                {msg.is_doubt && (
                  <div className="absolute top-0 -left-8 text-amber-500" title="This is a doubt">
                    <HelpCircle size={14} />
                  </div>
                )}

                {msg.attachment_url && (
                  <div className="mt-2 space-y-2">
                    <div className="inline-flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 max-w-sm group/file hover:bg-slate-750 transition-colors">
                      <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center text-indigo-400">
                        {msg.verification_status === 'pending' ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-200 truncate">{msg.attachment_name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500">{msg.attachment_size}</span>
                          {msg.verification_status === 'pending' && (
                            <span className="text-[10px] text-amber-500 font-medium bg-amber-500/10 px-1.5 rounded">Scanning...</span>
                          )}
                          {msg.verification_status === 'none' && (
                            <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                              <ShieldCheck size={10} /> Safe
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {msg.verification_status === 'none' && !msg.is_doubt && !msg.attachment_url && (
                  <button onClick={() => onFlag(msg.id)} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-[10px] text-slate-500 hover:text-amber-500 transition-all">
                    Flag for verification
                  </button>
                )}
              </div>
            </div>
          );
        })}
        
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-12 pt-2 animate-pulse">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            </div>
            <span className="text-xs text-slate-500 font-medium italic">{getTypingText()}</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.jpg,.jpeg,.png" />
        <div className="flex items-center gap-3 mb-2 px-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="is_doubt" checked={isDoubt} onCheckedChange={(c) => setIsDoubt(c as boolean)} className="border-slate-700 data-[state=checked]:bg-amber-600" />
            <Label htmlFor="is_doubt" className="text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-300 flex items-center gap-1.5">
              <HelpCircle size={12} className={isDoubt ? "text-amber-500" : ""} /> Mark as Doubt
            </Label>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500/40 transition-all">
          <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-slate-200 transition-colors shrink-0" disabled={isUploading}>
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
          </button>
          <input type="text" value={input} onChange={handleInputChange} onKeyDown={handleKeyPress} placeholder={`Ask a doubt or share a thought in #${channelName}…`} className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none" />
          <button onClick={handleSend} disabled={!input.trim() || isUploading} className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-all">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
