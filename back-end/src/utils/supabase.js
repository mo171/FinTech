/* 
  - SUPABASE IS INITILISED HERE
*/

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// * will not be in production
if (!supabaseUrl || !supabaseKey) {
  console.error("CRITICAL ERROR: Supabase environment variables are missing!");
  console.error("SUPABASE_URL:", supabaseUrl ? "Present" : "Missing");
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY:",
    supabaseKey ? "Present" : "Missing",
  );
} else {
  console.log("Supabase initialized successfully with credentials.");
}
// - THE SUPABASE ADMIN WILL BE RESPONSIBLE TO FETCH DATA FROM BACKEND OR TO UPDATE DATA IN DATABASE
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
