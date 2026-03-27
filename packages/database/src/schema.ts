import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ──────────────────────────────────────────────────────────────────

export const activityCategoryEnum = pgEnum("activity_category", [
  "content",
  "finance",
  "learning",
  "social",
  "health",
]);

export const visibilityEnum = pgEnum("visibility", ["public", "private"]);

export const communityRoleEnum = pgEnum("community_role", [
  "member",
  "moderator",
  "admin",
]);

export const reactionTypeEnum = pgEnum("reaction_type", [
  "like",
  "fire",
  "clap",
  "mind_blown",
]);

// ─── Users ───────────────────────────────────────────────────────────────────
// Nota: Supabase Auth maneja la autenticación. Esta tabla extiende el perfil.

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // Mismo ID que Supabase Auth
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),

  // Progreso
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),

  // Premium
  isPremium: boolean("is_premium").notNull().default(false),
  premiumUntil: timestamp("premium_until"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Profiles (perfil público extendido) ─────────────────────────────────────

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  handle: text("handle").notNull().unique(), // @usuario
  tagline: text("tagline"), // Frase corta del perfil
  skills: jsonb("skills"), // Array de habilidades en JSON
  socialLinks: jsonb("social_links"), // { instagram, tiktok, youtube, etc }
  visibility: visibilityEnum("visibility").notNull().default("public"),
});

// ─── Activities (tracker diario) ─────────────────────────────────────────────

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // Ej: "publicación", "curso", "ejercicio"
  title: text("title").notNull(),
  description: text("description"),
  xpEarned: integer("xp_earned").notNull().default(0),
  category: activityCategoryEnum("category").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Skills (habilidades del usuario) ─────────────────────────────────────────

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  level: integer("level").notNull().default(0), // 0-100
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Communities ──────────────────────────────────────────────────────────────

export const communities = pgTable("communities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // URL amigable
  description: text("description"),
  coverUrl: text("cover_url"),
  category: text("category").notNull(),
  memberCount: integer("member_count").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Community Members ────────────────────────────────────────────────────────

export const communityMembers = pgTable("community_members", {
  communityId: uuid("community_id")
    .notNull()
    .references(() => communities.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: communityRoleEnum("role").notNull().default("member"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// ─── Posts (feed de comunidad) ────────────────────────────────────────────────

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  communityId: uuid("community_id")
    .notNull()
    .references(() => communities.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  mediaUrls: jsonb("media_urls"), // Array de URLs de imágenes/videos
  likesCount: integer("likes_count").notNull().default(0),
  commentsCount: integer("comments_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Comments ─────────────────────────────────────────────────────────────────

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Reactions ────────────────────────────────────────────────────────────────

export const reactions = pgTable("reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: reactionTypeEnum("type").notNull(),
});

// ─── Messages (solo web, solo Premium) ───────────────────────────────────────

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: uuid("receiver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Achievements (logros) ────────────────────────────────────────────────────

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // Ej: "first_post", "streak_7", "level_5"
  title: text("title").notNull(),
  description: text("description"),
  xpReward: integer("xp_reward").notNull().default(0),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
});

// ─── Financial Health (panel financiero) ─────────────────────────────────────

export const financialHealth = pgTable("financial_health", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  estimatedIncome: integer("estimated_income").default(0), // en centavos MXN
  contentRevenue: integer("content_revenue").default(0),
  sponsorships: integer("sponsorships").default(0),
  expenses: integer("expenses").default(0),
  savingsGoal: integer("savings_goal").default(0),
  notes: text("notes"),
});
