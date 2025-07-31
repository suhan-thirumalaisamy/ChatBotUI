import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByCognitoSub(cognitoSub: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(cognitoSub: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByCognitoSub(cognitoSub: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.cognitoSub === cognitoSub,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      name: insertUser.name || null,
      lastLogin: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async upsertUser(insertUser: InsertUser): Promise<User> {
    // Check if user exists by cognitoSub
    const existingUser = await this.getUserByCognitoSub(insertUser.cognitoSub);
    
    if (existingUser) {
      // Update existing user
      const updatedUser: User = {
        ...existingUser,
        ...insertUser,
        lastLogin: new Date()
      };
      this.users.set(existingUser.id, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      return this.createUser(insertUser);
    }
  }

  async updateUserLastLogin(cognitoSub: string): Promise<void> {
    const user = await this.getUserByCognitoSub(cognitoSub);
    if (user) {
      const updatedUser: User = {
        ...user,
        lastLogin: new Date()
      };
      this.users.set(user.id, updatedUser);
    }
  }
}

export const storage = new MemStorage();
