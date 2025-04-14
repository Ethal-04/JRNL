
import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";

// In-memory user store (replace with database in production)
const users = new Map<string, {
  id: string;
  username: string;
  password: string;
  isReplitUser?: boolean;
}>();

passport.use(new LocalStrategy(async (username, password, done) => {
  const user = Array.from(users.values()).find(u => u.username === username);
  if (!user) {
    return done(null, false, { message: "Incorrect username" });
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return done(null, false, { message: "Incorrect password" });
  }
  
  return done(null, user);
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
  const user = users.get(id);
  done(null, user);
});

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Check for Replit auth first
  const replitUserId = req.headers['x-replit-user-id'];
  const replitUsername = req.headers['x-replit-user-name'];
  
  if (replitUserId && replitUsername) {
    let user = users.get(replitUserId as string);
    if (!user) {
      // Create user entry for Replit user
      user = {
        id: replitUserId as string,
        username: replitUsername as string,
        password: '', // No password for Replit users
        isReplitUser: true
      };
      users.set(user.id, user);
    }
    req.user = user;
    return next();
  }

  // Check local auth
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ message: "Please login to continue" });
};

export const registerUser = async (username: string, password: string) => {
  if (Array.from(users.values()).some(u => u.username === username)) {
    throw new Error("Username already taken");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = `local_${Date.now()}`;
  const user = {
    id,
    username,
    password: hashedPassword
  };
  
  users.set(id, user);
  return user;
};
