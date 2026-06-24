import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://brupxamsawlvsojsmnhh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJydXB4YW1zYXdsdnNvanNtbmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNTMxMjMsImV4cCI6MjA5NzYyOTEyM30.oR_xu6vkTA2dXRRMTXi3VeqgP3A9Hom16_ccplztsEw";

export const supabase = createClient(supabaseUrl,supabaseKey);