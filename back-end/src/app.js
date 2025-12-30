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

// - CORS CONFIG -->  YOUR FRONT-END URL LIES HERE
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow all origins for debugging
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// - BASIC MIDDLEWARES CONFIG
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));

// - ROUTING IS DONE HERE
app.use("/api/inngest", inngestHandler);
app.use("/api/compliance", complianceRoutes);


export default app;
