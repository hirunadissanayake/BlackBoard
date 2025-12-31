import 'dotenv/config';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

console.log('--- Environment Variable Check ---');
console.log('VITE_SUPABASE_URL:', url ? url : 'MISSING');
console.log('VITE_SUPABASE_ANON_KEY:', key ? `${key.substring(0, 10)}...[HIDDEN]` : 'MISSING');

if (key && key.includes('"')) {
    console.log('WARNING: The key contains quotes. Please remove them.');
}

if (key && key.includes('your-anon-key')) {
    console.log('WARNING: You are still using the placeholder key.');
}
