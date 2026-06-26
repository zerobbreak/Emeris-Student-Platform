import type { UserRole } from "./auth";

export interface ProfileSkill {
  id: string;
  name: string;
  category: string;
  endorsementCount: number;
  addedAt?: string;
}

export interface ProfileStats {
  projectCount: number;
  certCount: number;
  totalPoints: number;
  currentLevel: "Beginner" | "Explorer" | "Innovator" | "Expert" | "Master";
}

export interface PublicProfile {
  id: string;
  name: string;
  bio: string | null;
  profileImage: string | null;
  course: string | null;
  year: number | null;
  location: string | null;
  role: UserRole;
  githubUrl: string | null;
  linkedinUrl: string | null;
  createdAt: string;
  isOnboarded: boolean;
  skills?: ProfileSkill[];
  stats?: ProfileStats;
}

export interface ProfileUpdateInput {
  name?: string;
  bio?: string;
  course?: string;
  year?: number;
  location?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  isOnboarded?: boolean;
}
