
import { Request, Response, NextFunction } from "express";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-replit-user-id'];
  const username = req.headers['x-replit-user-name'];
  
  if (!userId || !username) {
    return res.status(401).json({ message: "Please login with your Replit account" });
  }

  req.user = { id: userId as string, name: username as string };
  next();
};
