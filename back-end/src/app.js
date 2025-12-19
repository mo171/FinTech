/* 
  
  - App entry point
  - Configurations and middlewares setup
  
*/

import express from "express";
import cors from "cors";

import { inngestHandler } from "./inngest/handler.js";
import complianceRoutes from "./routes/compliance.routes.js";

const app = express();

// basic configurations
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
// cors configurations
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// routes
app.use("/api/inngest", inngestHandler);
app.use("/api/compliance", complianceRoutes);

app.get("/", (req, res) => {
  res.send("Finn-tech connected");
});

export default app;
