import { Paperclip, Send, FileText, CheckCircle2, AlertCircle, HelpCircle, ShieldAlert, ShieldCheck, Loader2, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  messages: any[];
  typingUsers: any[];
  channelName: string;
  onSendMessage: (content: string, isDoubt: boolean) => void;
  onSendFile: (file: File, content: string, isDoubt: boolean) => Promise<any>;
  onVerify: (messageId: string, status: 'verified' | 'incorrect') => void;
  onFlag: (messageId: string) => void;
  onTyping: (isTyping: boolean) => void;
  onSelectUser?: (userId: string) => void;
  userRole?: string;
}

const ChatArea = ({ messages, typingUsers, channelName, onSendMessage, onSendFile, onVerify, onFlag, onTyping, onSelectUser, userRole }: Props) => {
  const [input, setInput] = useState("");
  const [isDoubt, setIsDoubt] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string, name: string, type: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const openFilePreview = (msg: any) => {
    const url = msg.attachment_url;
    const name = msg.attachment_name;
    const extension = name.split('.').pop().toLowerCase();
    
    let type = 'other';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) type = 'image';
    else if (['pdf', 'doc', 'docx'].includes(extension)) type = 'document';

    // Construct full absolute URL for Google Docs Viewer
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    setPreviewFile({ url: fullUrl, name, type });
  };

  const getTypingText = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0].userName} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
    return `${typingUsers[0].userName} and ${typingUsers.length - 1} others are typing...`;
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-background text-foreground overflow-hidden">
      <div className="h-12 border-b border-border flex items-center px-5 shrink-0 bg-background/80 backdrop-blur-sm z-10">
        <h3 className="text-sm font-semibold text-foreground">{channelName}</h3>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isSelf = msg.sender_id === currentUser.id;
            const showHeader = i === 0 || messages[i - 1].sender_id !== msg.sender_id;
            const timestamp = msg.created_at ? format(new Date(msg.created_at), "h:mm aa") : "";
            
            return (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, x: isSelf ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
              >
                {showHeader && (
                  <div className={`flex items-center gap-2 mb-1 px-1 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
                    <div 
                      onClick={() => !isSelf && onSelectUser?.(msg.sender_id)}
                      className={`w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 ${!isSelf && onSelectUser ? "cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all" : ""}`}
                    >
                      {msg.avatar || msg.userName?.substring(0, 2).toUpperCase()}
                    </div>
                    <span 
                      onClick={() => !isSelf && onSelectUser?.(msg.sender_id)}
                      className={`text-[11px] font-bold text-foreground/70 ${!isSelf && onSelectUser ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
                    >
                      {isSelf ? "You" : msg.userName}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{timestamp}</span>
                    {msg.userRole === 'mentor' && !isSelf && (
                      <span className="bg-primary/20 text-primary text-[9px] px-1.5 py-0.5 rounded border border-primary/30 font-bold">Mentor</span>
                    )}
                  </div>
                )}
                
                <div className={`relative max-w-[85%] group ${isSelf ? "pr-0" : "pl-0"}`}>
                  <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                    isSelf 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-muted text-foreground rounded-tl-none"
                  }`}>
                    {msg.verification_status === 'verified' && !msg.attachment_url && (
                      <div className={`flex items-center gap-1.5 mb-1.5 ${isSelf ? "text-primary-foreground/90" : "text-emerald-600 dark:text-emerald-400"}`}>
                        <CheckCircle2 size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Verified Answer</span>
                      </div>
                    )}

                    <div className={msg.verification_status === 'incorrect' ? 'opacity-50 line-through decoration-rose-500/50' : ''}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content?.split(/(https?:\/\/[^\s]+)/g).map((part: string, i: number) => {
                          if (part.match(/^https?:\/\//)) {
                            return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{part}</a>;
                          }
                          return part.replace(' [SAFE]', '');
                        })}
                      </p>
                    </div>

                    {msg.link_metadata && (
                      <div className={`mt-3 overflow-hidden rounded-xl border ${
                        isSelf ? "border-white/20 bg-black/10" : "border-border bg-background/50"
                      }`}>
                        {(() => {
                          const meta = typeof msg.link_metadata === 'string' ? JSON.parse(msg.link_metadata) : msg.link_metadata;
                          if (!meta) return null;

                          if (meta.youtubeId) {
                            return (
                              <div className="max-w-[400px] w-full aspect-video rounded-lg overflow-hidden border border-white/5 shadow-sm">
                                <iframe
                                  key={`yt-${msg.id}`}
                                  src={`https://www.youtube.com/embed/${meta.youtubeId}`}
                                  className="h-full w-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            );
                          }
                          if (meta.instagramId) {
                            return (
                              <div className="w-fit mx-auto h-[450px] overflow-hidden bg-white rounded-lg border border-white/5 shadow-sm">
                                <iframe
                                  key={`ig-${msg.id}`}
                                  src={`https://www.instagram.com/p/${meta.instagramId}/embed`}
                                  className="w-[320px] h-full border-0"
                                  allowTransparency
                                  scrolling="no"
                                />
                              </div>
                            );
                          }
                          return (
                            <a href={meta.url} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row gap-3 p-3 hover:bg-white/5 transition-colors">
                              {meta.image && (
                                <div className="shrink-0 w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden bg-muted">
                                  <img src={meta.image} alt="" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h4 className={`text-sm font-bold truncate ${isSelf ? "text-primary-foreground" : "text-foreground"}`}>{meta.title}</h4>
                                {meta.description && <p className={`text-xs line-clamp-2 mt-1 ${isSelf ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{meta.description}</p>}
                                <span className={`text-[10px] mt-2 truncate ${isSelf ? "text-primary-foreground/50" : "text-muted-foreground/60"}`}>{new URL(meta.url).hostname}</span>
                              </div>
                            </a>
                          );
                        })()}
                      </div>
                    )}

                    {msg.attachment_url && (
                      <div className="mt-2">
                        <button 
                          onClick={() => msg.verification_status !== 'pending' && openFilePreview(msg)}
                          className={`flex items-center gap-3 border rounded-xl px-3 py-2.5 transition-all text-left w-full ${
                            isSelf 
                              ? "bg-white/10 border-white/20 hover:bg-white/20" 
                              : "bg-background/50 border-border hover:bg-background hover:border-primary/30"
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelf ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                            {msg.verification_status === 'pending' ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold truncate">{msg.attachment_name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] opacity-70">{msg.attachment_size}</span>
                              {msg.verification_status === 'verified' && (
                                <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold">(safe)</span>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {!isSelf && (userRole === 'mentor' || userRole === 'admin') && msg.verification_status === 'pending' && (
                    <div className="absolute -right-24 top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onVerify(msg.id, 'verified')} className="p-1.5 bg-emerald-500 text-white rounded-full hover:scale-110 transition-transform shadow-md" title="Verify"><CheckCircle2 size={14}/></button>
                      <button onClick={() => onVerify(msg.id, 'incorrect')} className="p-1.5 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-md" title="Mark Incorrect"><ShieldAlert size={14}/></button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview Modal */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl flex flex-col">
          <DialogHeader className="p-4 border-b border-border bg-background flex flex-row items-center justify-between shrink-0 pr-12">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                <FileText size={18} />
              </div>
              <DialogTitle className="text-sm font-bold truncate pr-4">{previewFile?.name}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden p-0">
            {previewFile?.type === 'image' ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-full object-contain shadow-lg rounded-sm" />
              </div>
            ) : previewFile?.type === 'document' ? (
              <iframe 
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewFile.url)}&embedded=true`} 
                className="w-full h-full border-none"
                title="File Preview"
              />
            ) : (
              <div className="text-center p-12 bg-background rounded-2xl border border-border shadow-xl max-w-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                  <FileText size={32} />
                </div>
                <h3 className="font-bold text-lg mb-2">Preview not available</h3>
                <p className="text-sm text-muted-foreground mb-6">This file type cannot be previewed directly. Please download it to view the contents.</p>
                <a 
                  href={previewFile?.url} 
                  download 
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md"
                >
                  <Download size={18} />
                  Download File
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Input Section */}
      <div className="p-4 border-t border-border bg-background/50 backdrop-blur-sm relative overflow-visible z-20">
        {typingUsers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-7 left-4 flex items-center gap-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-t-lg border-t border-x border-border z-30"
          >
            <div className="flex gap-1">
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1 h-1 rounded-full bg-primary" />
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1 h-1 rounded-full bg-primary" />
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1 h-1 rounded-full bg-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium italic">{getTypingText()}</span>
          </motion.div>
        )}

        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.jpg,.jpeg,.png" />
        <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/40 transition-all shadow-sm">
          <button onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-primary transition-colors shrink-0" disabled={isUploading}>
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
          </button>
          <input 
            type="text" 
            value={input} 
            onChange={handleInputChange} 
            onKeyDown={handleKeyPress} 
            placeholder={`Ask a Doubt or Share a thought to ${channelName}`} 
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" 
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend} 
            disabled={!input.trim() || isUploading} 
            className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:scale-100 transition-all shadow-sm"
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
