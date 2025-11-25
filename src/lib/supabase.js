// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jzepcgnlbdomrckielzz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6ZXBjZ25sYmRvbXJja2llbHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNDcxMjgsImV4cCI6MjA3OTYyMzEyOH0.rErcK3g-Z0XIbWi2q3MbC-JY6bUfa2FNEsgY_uic6ak'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)