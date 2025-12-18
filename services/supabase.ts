
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gubzjbaprfiihiadtmhq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YnpqYmFwcmZpaWhpYWR0bWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzgwNTksImV4cCI6MjA4MTY1NDA1OX0.Txr51G6JoUxGLAu2lfBbEJcpxLol-GP93I1ilkCOb2Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Nota para o Desenvolvedor:
 * Certifique-se de que as tabelas abaixo existam no seu projeto Supabase:
 * - profiles (id, email, full_name, avatar_url)
 * - patients (id, doctor_id, name, age, gender, contact, email, consultation_date, diagnosis, etc)
 * - evolutions (id, patient_id, doctor_id, author_name, content, date)
 * - notes (id, user_id, title, content, updated_at)
 * - community_posts (id, author_id, author_name, content, reactions, etc)
 */
