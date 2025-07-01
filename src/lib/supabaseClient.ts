import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://olzsyrwtrabmcfgmyedl.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9senN5cnd0cmFibWNmZ215ZWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzOTY1ODcsImV4cCI6MjA2NTk3MjU4N30.v31zrstKbMZ4yTBP6Au-JT6ILKILW6vWt7tBYA8LjLk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
