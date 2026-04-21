import { createClient } from '@supabase/supabase-js';

// Using your specific project URL 
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://okdibktdtodalxetxiyu.supabase.co';

// Using the publishable key you provided from the dashboard!
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ICCwxnG0JKObRFdmrITh6g_StQDcwdJ';

export const supabase = createClient(supabaseUrl, supabaseKey);
