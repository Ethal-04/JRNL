import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join('data', 'users.json');

// Ensure data directory exists
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

// Create users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, '{}');
}

interface User {
  username: string;
  password: string;
}

const getUsers = (): Record<string, User> => {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
};

const saveUsers = (users: Record<string, User>) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

export const registerUser = async (username: string, password: string) => {
  const users = getUsers();
  if (users[username]) {
    throw new Error("Username already taken");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users[username] = {
    username,
    password: hashedPassword
  };

  saveUsers(users);
  return { username };
};

export const verifyUser = async (username: string, password: string) => {
  const users = getUsers();
  const user = users[username];

  if (!user) {
    return false;
  }

  return bcrypt.compare(password, user.password);
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.user) {
    return next();
  }
  return res.status(401).json({ message: "Please login to continue" });
};