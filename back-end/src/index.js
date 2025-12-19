/*

   - The first- file to be executed when the project starts
   - Loads environment variables from a .env file into process.env
   - connects to the database
   - configures express object
   - starts the server to listen on a specified port
   - routes incoming requests to appropriate route handlers

*/

import dotenv from "dotenv";
import app from "./app.js";
import http from "http";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
