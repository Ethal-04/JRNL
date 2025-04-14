import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";

// In-memory user store (replace with database in production)
const users = new Map<string, {
  id: string;
  email?: string;
  username?: string;
  password?: string;
  name?: string;
  profilePic?: string;
  isReplitUser?: boolean;
}>();

passport.use(new LocalStrategy(async (username, password, done) => {
  const user = Array.from(users.values()).find(u => u.username === username);
  if (!user) {
    return done(null, false, { message: "Incorrect username" });
  }

  const isValid = await bcrypt.compare(password, user.password!);
  if (!isValid) {
    return done(null, false, { message: "Incorrect password" });
  }

  return done(null, user);
}));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error("No email found"));
    }

    let user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      user = {
        id: profile.id,
        email: email,
        name: profile.displayName,
        profilePic: profile.photos?.[0]?.value
      };
      users.set(user.id, user);
    }
    return done(null, user);
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
  const user = users.get(id);
  done(null, user);
});

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
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