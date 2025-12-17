/* 
  
  - App entry point
  - Configurations and middlewares setup
  
*/

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// basic configurations
// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(express.static("public"));
// app.use(cookieParser());
// // cors configurations
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   }),
// );

// // routes
// import userRoutes from "./routes/user.routes.js";
// import captainRoutes from "./routes/captain.routes.js";
// import mapsRoutes from "./routes/maps.routes.js";
// import rideRoutes from "./routes/ride.routes.js";

// app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/captains", captainRoutes);
// app.use("/api/v1/maps", mapsRoutes);
// app.use("/api/v1/ride", rideRoutes);

// app.get("/", (req, res) => {
//   res.send("uber-app connected");
// });

export default app;
