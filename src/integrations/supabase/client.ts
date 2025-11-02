import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dipmnpqnxziougeqtmyn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcG1ucHFueHppb3VnZXF0bXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NjUyMDMsImV4cCI6MjA3NzQ0MTIwM30.IbTQFVXjEO1gmdQumMGJRaAErtZ4tu8bCIZ0F1QO-jQ';

export const supabase = createClient(supabaseUrl, supabaseKey);