import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// --- START OF CONFIGURATION ---
// This appears to be configured, but ensure these are your correct Supabase credentials.
// You can find these in your Supabase project dashboard under Project Settings > API.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("YOUR_SUPABASE_URL");

if (!isSupabaseConfigured) {
    const rootEl = document.getElementById('root');
    const messages = [];

    if (!isSupabaseConfigured) {
        messages.push(`
            <h2 style="font-size: 1.25rem; font-weight: bold; color: #f3f4f6; margin-top: 1.5rem;">Supabase Configuration Missing</h2>
            <p style="color: #d1d5db; margin-top: 0.5rem;">
                Please ensure <code>supabaseUrl</code> and <code>supabaseAnonKey</code> are set correctly in <code>supabaseClient.ts</code>.
            </p>
        `);
    }

    if (rootEl) {
        rootEl.innerHTML = `
            <div style="font-family: Inter, sans-serif; color: #e5e7eb; background-color: #030712; height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; box-sizing: border-box;">
                <div style="background-color: #111827; border: 1px solid #374151; padding: 2.5rem; border-radius: 1rem; text-align: center; max-width: 90vw;">
                    <h1 style="font-size: 1.75rem; font-weight: bold; color: #ef4444;">Configuration Required</h1>
                    ${messages.join('')}
                </div>
            </div>
        `;
    }
    throw new Error("Supabase credentials are not configured in supabaseClient.ts.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
