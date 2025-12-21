/* 
  
  - App entry point
  - Configurations and middlewares setup
  - routes are also created here
  
*/

// - DEPENDENCIES TO BE IMPORTED HERE
import express from "express";
import cors from "cors";

// - ROUTES TO BE IMPORTED HERE
import { inngestHandler } from "./inngest/handler.js";
import complianceRoutes from "./routes/compliance.routes.js";

const app = express();

// - BASIC MIDDLEWARES CONFIG 
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
// - CORS CONFIG -->  YOUR FRONT-END URL LIES HERE
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// - ROUTING IS DONE HERE
app.use("/api/inngest", inngestHandler);
app.use("/api/compliance", complianceRoutes);

// - DEFAULT ROUTE
app.get("/", (req, res) => {
  res.send("Finn-tech connected");
});

export default app;
