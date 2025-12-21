/*

   - The first- file to be executed when the project starts
   - Loads environment variables from a .env file into process.env
   - connects to the database in this case supabase
   - configures express object as server
   - starts the server to listen on a specified port
   - routes incoming requests to appropriate route handlers
   - all the routes and handling will be done from app.js

*/

import "dotenv/config";
import app from "./app.js";
import http from "http";

const port = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
