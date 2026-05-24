import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://baumzxhvmqlkooqqfclu.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhdW16eGh2bXFsa29vcXFmY2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDA1MzYsImV4cCI6MjA5NTAxNjUzNn0.3g3XR9GnjtIIiwcCwacJ_VBfr5EDsha_oO6pVTOSC5o";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);