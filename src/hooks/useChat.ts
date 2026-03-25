import { useState, useEffect } from "react";
import api from "@/lib/api";
import { socket } from "@/lib/socket";
import { useToast } from "@/components/ui/use-toast";

export const useChat = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchGroups = async () => {
    try {
      const { data } = await api.get("/groups");
      setGroups(data);
      if (data.length > 0 && !activeGroupId) {
        setActiveGroupId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchChannels = async (groupId: string) => {
    try {
      const { data } = await api.get(`/channels/${groupId}`);
      setChannels(data);
      if (data.length > 0) {
        setActiveChannelId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      const { data } = await api.get(`/messages/${channelId}`);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchMembers = async (groupId: string) => {
    try {
      const { data } = await api.get(`/groups/${groupId}/members`);
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  useEffect(() => {
    fetchGroups().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeGroupId) {
      fetchChannels(activeGroupId);
      fetchMembers(activeGroupId);
    }
  }, [activeGroupId]);

  useEffect(() => {
    if (activeChannelId) {
      fetchMessages(activeChannelId);
      socket.connect();
      socket.emit("join_channel", activeChannelId);

      const handleReceiveMessage = (message: any) => {
        setMessages((prev) => [...prev, message]);
      };

      const handleUpdateMessage = (updatedMessage: any) => {
        setMessages((prev) => prev.map(m => m.id === updatedMessage.id ? { ...m, ...updatedMessage } : m));
      };

      const handleTypingUsers = (users: any[]) => {
        // Exclude current user from typing list
        setTypingUsers(users.filter(u => u.id !== user.id));
      };

      socket.on("receive_message", handleReceiveMessage);
      socket.on("update_message", handleUpdateMessage);
      socket.on("typing_users", handleTypingUsers);

      return () => {
        socket.off("receive_message", handleReceiveMessage);
        socket.off("update_message", handleUpdateMessage);
        socket.off("typing_users", handleTypingUsers);
        socket.disconnect();
      };
    }
  }, [activeChannelId]);

  const sendMessage = async (content: string, isDoubt: boolean = false, attachment?: any) => {
    if (!activeChannelId) return;

    try {
      const { data } = await api.post("/messages", {
        channelId: activeChannelId,
        content,
        isDoubt,
        ...attachment
      });

      socket.emit("send_message", {
        ...data,
        channelId: activeChannelId
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const sendFile = async (file: File, content: string = "", isDoubt: boolean = false) => {
    if (!activeChannelId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("channelId", activeChannelId);
    formData.append("content", content);
    formData.append("isDoubt", String(isDoubt));

    try {
      const { data } = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      socket.emit("send_message", {
        ...data,
        channelId: activeChannelId
      });
      
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.response?.data?.message || "File upload failed.",
      });
      throw error;
    }
  };

  const verifyMessage = async (messageId: string, status: 'verified' | 'incorrect') => {
    try {
      const { data } = await api.post(`/messages/${messageId}/verify`, { status });
      socket.emit("update_message", {
        ...data,
        channelId: activeChannelId
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to verify message",
      });
    }
  };

  const flagMessage = async (messageId: string) => {
    try {
      const { data } = await api.post(`/messages/${messageId}/flag`);
      socket.emit("update_message", {
        ...data,
        channelId: activeChannelId
      });
    } catch (error) {
      console.error("Error flagging message:", error);
    }
  };

  const setTypingStatus = (isTyping: boolean) => {
    if (!activeChannelId) return;
    
    if (isTyping) {
      socket.emit("typing_start", {
        channelId: activeChannelId,
        userId: user.id,
        userName: user.name,
      });
    } else {
      socket.emit("typing_stop", {
        channelId: activeChannelId,
        userId: user.id,
      });
    }
  };

  return {
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
    verifyMessage,
    flagMessage,
    setTypingStatus,
    refreshGroups: fetchGroups,
    refreshChannels: () => activeGroupId && fetchChannels(activeGroupId)
  };
};
