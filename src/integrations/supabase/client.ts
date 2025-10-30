import { createClient } from '@supabase/supabase-js';

// Credenciais corretas do projeto Supabase
const supabaseUrl = 'https://tlblqzxsjoofxsjhqkxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYmxxenhzam9vZnhzamhxa3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzE4MTksImV4cCI6MjA3NzE0NzgxOX0.wEz9OMEZ-RqS8Ju5HlG8PJ0pE8i4KxdEjAuj2ovuAGU';

export const supabase = createClient(supabaseUrl, supabaseKey);