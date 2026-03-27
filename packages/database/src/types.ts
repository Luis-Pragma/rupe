import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  users,
  profiles,
  activities,
  skills,
  communities,
  communityMembers,
  posts,
  comments,
  reactions,
  messages,
  achievements,
  financialHealth,
} from "./schema";

// ─── Tipos de lectura (SELECT) ────────────────────────────────────────────────

export type User = InferSelectModel<typeof users>;
export type Profile = InferSelectModel<typeof profiles>;
export type Activity = InferSelectModel<typeof activities>;
export type Skill = InferSelectModel<typeof skills>;
export type Community = InferSelectModel<typeof communities>;
export type CommunityMember = InferSelectModel<typeof communityMembers>;
export type Post = InferSelectModel<typeof posts>;
export type Comment = InferSelectModel<typeof comments>;
export type Reaction = InferSelectModel<typeof reactions>;
export type Message = InferSelectModel<typeof messages>;
export type Achievement = InferSelectModel<typeof achievements>;
export type FinancialHealth = InferSelectModel<typeof financialHealth>;

// ─── Tipos de inserción (INSERT) ──────────────────────────────────────────────

export type NewUser = InferInsertModel<typeof users>;
export type NewProfile = InferInsertModel<typeof profiles>;
export type NewActivity = InferInsertModel<typeof activities>;
export type NewSkill = InferInsertModel<typeof skills>;
export type NewCommunity = InferInsertModel<typeof communities>;
export type NewPost = InferInsertModel<typeof posts>;
export type NewComment = InferInsertModel<typeof comments>;
export type NewReaction = InferInsertModel<typeof reactions>;
export type NewMessage = InferInsertModel<typeof messages>;
export type NewAchievement = InferInsertModel<typeof achievements>;
export type NewFinancialHealth = InferInsertModel<typeof financialHealth>;

// ─── Tipos extendidos (con relaciones) ───────────────────────────────────────

export type PostWithAuthor = Post & {
  author: Pick<User, "id" | "username" | "fullName" | "avatarUrl">;
};

export type CommentWithAuthor = Comment & {
  author: Pick<User, "id" | "username" | "fullName" | "avatarUrl">;
};

// ─── Sistema de XP ───────────────────────────────────────────────────────────

export const XP_REWARDS = {
  DAILY_ACTIVITY: 50,
  COMMUNITY_POST: 30,
  COMPLETE_COURSE: 200,
  STREAK_7_DAYS: 100,
  CERTIFICATION: 500,
  POST_10_REACTIONS: 25,
  COMPLETE_PROFILE: 150,
} as const;

// ─── Sistema de niveles ───────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1, minXp: 0, name: "Semilla" },
  { level: 2, minXp: 500, name: "Brote" },
  { level: 3, minXp: 1200, name: "Raíz" },
  { level: 4, minXp: 2500, name: "Tallo" },
  { level: 5, minXp: 4500, name: "Hoja" },
  { level: 6, minXp: 7500, name: "Rama" },
  { level: 7, minXp: 12000, name: "Copa" },
  { level: 8, minXp: 18000, name: "Árbol" },
  { level: 9, minXp: 27000, name: "Bosque" },
  { level: 10, minXp: 40000, name: "Ecosistema" },
] as const;

export function getLevelFromXp(xp: number): (typeof LEVELS)[number] {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getXpForNextLevel(xp: number): number {
  const currentLevel = getLevelFromXp(xp);
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);
  return nextLevel ? nextLevel.minXp - xp : 0;
}
