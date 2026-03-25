export interface ClassGroup {
  id: string;
  name: string;
  shortName: string;
  color: string;
  memberCount: number;
  instructor: string;
}

export interface Section {
  id: string;
  name: string;
  icon: string;
  unread?: number;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  content: string;
  timestamp: string;
  attachment?: { name: string; size: string };
}

export interface Participant {
  id: string;
  name: string;
  role: "teacher" | "student";
  online: boolean;
  avatar: string;
}

export const classGroups: ClassGroup[] = [
  { id: "1", name: "MBA 101 — Business Strategy", shortName: "MB", color: "220 72% 50%", memberCount: 42, instructor: "Prof. Sharma" },
  { id: "2", name: "BCA 202 — Data Structures", shortName: "DS", color: "262 60% 55%", memberCount: 38, instructor: "Dr. Gupta" },
  { id: "3", name: "Marketing Fundamentals", shortName: "MK", color: "16 80% 55%", memberCount: 35, instructor: "Prof. Iyer" },
  { id: "4", name: "Python Lab", shortName: "PY", color: "152 60% 42%", memberCount: 30, instructor: "Dr. Nair" },
  { id: "5", name: "Design Thinking", shortName: "DT", color: "340 65% 52%", memberCount: 28, instructor: "Prof. Desai" },
];

export const sections: Record<string, Section[]> = {
  "1": [
    { id: "s1", name: "Discussions", icon: "message-square", unread: 3 },
    { id: "s2", name: "Assignments", icon: "file-text" },
    { id: "s3", name: "Resources", icon: "folder-open" },
    { id: "s4", name: "Announcements", icon: "megaphone", unread: 1 },
  ],
  "2": [
    { id: "s5", name: "Discussions", icon: "message-square", unread: 5 },
    { id: "s6", name: "Assignments", icon: "file-text" },
    { id: "s7", name: "Code Help", icon: "code", unread: 2 },
    { id: "s8", name: "Lab Submissions", icon: "upload" },
  ],
  "3": [
    { id: "s9", name: "Discussions", icon: "message-square" },
    { id: "s10", name: "Case Studies", icon: "book-open" },
    { id: "s11", name: "Resources", icon: "folder-open" },
  ],
  "4": [
    { id: "s12", name: "Discussions", icon: "message-square", unread: 8 },
    { id: "s13", name: "Code Snippets", icon: "code" },
    { id: "s14", name: "Resources", icon: "folder-open" },
  ],
  "5": [
    { id: "s15", name: "Discussions", icon: "message-square" },
    { id: "s16", name: "Project Ideas", icon: "lightbulb", unread: 4 },
    { id: "s17", name: "Submissions", icon: "upload" },
  ],
};

export const messages: Message[] = [
  {
    id: "m1",
    userId: "u1",
    userName: "Prof. Sharma",
    avatar: "PS",
    content: "Welcome everyone to MBA 101! Please check the syllabus shared in Resources.",
    timestamp: "Today at 9:00 AM",
  },
  {
    id: "m2",
    userId: "u2",
    userName: "Ananya Desai",
    avatar: "AD",
    content: "Thank you Professor! Quick question — when is the first assignment due?",
    timestamp: "Today at 9:15 AM",
  },
  {
    id: "m3",
    userId: "u1",
    userName: "Prof. Sharma",
    avatar: "PS",
    content: "The first case study analysis is due by next Friday. I'll share the details in Assignments shortly.",
    timestamp: "Today at 9:18 AM",
  },
  {
    id: "m4",
    userId: "u3",
    userName: "Rahul Mehta",
    avatar: "RM",
    content: "Can we form groups for the case study or is it individual?",
    timestamp: "Today at 9:25 AM",
  },
  {
    id: "m5",
    userId: "u1",
    userName: "Prof. Sharma",
    avatar: "PS",
    content: "Groups of 3-4 students. Please form your teams and share the list by Wednesday.",
    timestamp: "Today at 9:28 AM",
  },
  {
    id: "m6",
    userId: "u4",
    userName: "Priya Singh",
    avatar: "PS",
    content: "I've uploaded my notes from today's lecture. Hope they help!",
    timestamp: "Today at 10:45 AM",
    attachment: { name: "Lecture_1_Notes.pdf", size: "2.4 MB" },
  },
  {
    id: "m7",
    userId: "u5",
    userName: "Arjun Kapoor",
    avatar: "AK",
    content: "Thanks Priya! Also, is anyone else having trouble accessing the live class link for tomorrow?",
    timestamp: "Today at 11:02 AM",
  },
  {
    id: "m8",
    userId: "u2",
    userName: "Ananya Desai",
    avatar: "AD",
    content: "Works fine for me. Try checking your email — the link was sent to our college IDs.",
    timestamp: "Today at 11:05 AM",
  },
];

export const participants: Participant[] = [
  { id: "u1", name: "Prof. Sharma", role: "teacher", online: true, avatar: "PS" },
  { id: "u2", name: "Ananya Desai", role: "student", online: true, avatar: "AD" },
  { id: "u3", name: "Rahul Mehta", role: "student", online: true, avatar: "RM" },
  { id: "u4", name: "Priya Singh", role: "student", online: false, avatar: "PS" },
  { id: "u5", name: "Arjun Kapoor", role: "student", online: true, avatar: "AK" },
  { id: "u6", name: "Sneha Patel", role: "student", online: false, avatar: "SP" },
  { id: "u7", name: "Vikram Joshi", role: "student", online: true, avatar: "VJ" },
  { id: "u8", name: "Kavya Nair", role: "student", online: false, avatar: "KN" },
  { id: "u9", name: "Rohan Gupta", role: "student", online: true, avatar: "RG" },
  { id: "u10", name: "Meera Iyer", role: "student", online: false, avatar: "MI" },
];
