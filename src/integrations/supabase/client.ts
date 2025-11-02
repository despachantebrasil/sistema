import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qtgcbunoyeugthksfrvs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0Z2NidW5veWV1Z3Roa3NmcnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4OTAxMDEsImV4cCI6MjA3NDQ2NjEwMX0.ytB1R0Y_MZD06zyHwiM1lruDHVxv8o8hu1jaOv8Muu8';

export const supabase = createClient(supabaseUrl, supabaseKey);