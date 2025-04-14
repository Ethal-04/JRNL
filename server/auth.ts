
import { Request, Response, NextFunction } from "express";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || token !== process.env.APP_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
