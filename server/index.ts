import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";

const app = express();

app.use(cors());
app.use(express.json());

const port = 5000;

async function main() {
  await setupVite(app);
  const server = await registerRoutes(app);
  server.listen(port, "0.0.0.0", () => {
    console.log(`[express] serving on port ${port}`);
  });
}

main();