import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cognitoSub: text("cognito_sub").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name"),
  lastLogin: timestamp("last_login").default(sql`now()`),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  isBot: boolean("is_bot").notNull().default(false),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  sessionId: text("session_id").notNull(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertUserSchema = createInsertSchema(users).pick({
  cognitoSub: true,
  email: true,
  name: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  text: true,
  isBot: true,
  sessionId: true,
  userId: true,
});

export const lambdaRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  sessionId: z.string().optional(),
});

// Cognito Authentication Schemas
export const cognitoSignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

export const cognitoSignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const cognitoConfirmSignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  confirmationCode: z.string().length(6, "Confirmation code must be 6 digits"),
});

export const cognitoForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const cognitoResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  confirmationCode: z.string().length(6, "Confirmation code must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type LambdaRequest = z.infer<typeof lambdaRequestSchema>;

export type CognitoSignUp = z.infer<typeof cognitoSignUpSchema>;
export type CognitoSignIn = z.infer<typeof cognitoSignInSchema>;
export type CognitoConfirmSignUp = z.infer<typeof cognitoConfirmSignUpSchema>;
export type CognitoForgotPassword = z.infer<typeof cognitoForgotPasswordSchema>;
export type CognitoResetPassword = z.infer<typeof cognitoResetPasswordSchema>;
