import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

// Parse the DATABASE_URL from .env
// Note: We need to ensure the password is correctly encoded if it has special chars, 
// but usually the string in .env is already formatted.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is missing from .env');
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function initDB() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // 1. Create 'classes' table
        await client.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        schedule TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
        console.log('Created table: classes');

        // 2. Create 'students' table
        await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        name TEXT NOT NULL,
        grade TEXT,
        email TEXT,
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
        console.log('Created table: students');

        // 3. Create 'assignments' table
        await client.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        due_date TIMESTAMPTZ,
        total_submissions INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
        console.log('Created table: assignments');

        // 4. Create 'attendance' table
        await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        student_id UUID REFERENCES students(id) ON DELETE CASCADE,
        date DATE DEFAULT CURRENT_DATE,
        status TEXT NOT NULL, -- 'Present', 'Absent', 'Late'
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
        console.log('Created table: attendance');

        // Enable RLS (Row Level Security) - Optional but good practice
        // For simplicity in this script, we just enable it. 
        // Policies usually need 'auth.uid()', which works with Supabase Auth.

        const tables = ['classes', 'students', 'assignments', 'attendance'];

        for (const table of tables) {
            await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);

            // Policy: Users can only see their own data
            // We use a DO block to check if policy exists to avoid errors on re-run
            await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_policies
                    WHERE tablename = '${table}' AND policyname = 'Users can select their own ${table}'
                ) THEN
                    CREATE POLICY "Users can select their own ${table}" ON ${table}
                    FOR SELECT
                    USING (auth.uid() = user_id);
                END IF;

                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_policies
                    WHERE tablename = '${table}' AND policyname = 'Users can insert their own ${table}'
                ) THEN
                    CREATE POLICY "Users can insert their own ${table}" ON ${table}
                    FOR INSERT
                    WITH CHECK (auth.uid() = user_id);
                END IF;

                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_policies
                    WHERE tablename = '${table}' AND policyname = 'Users can update their own ${table}'
                ) THEN
                    CREATE POLICY "Users can update their own ${table}" ON ${table}
                    FOR UPDATE
                    USING (auth.uid() = user_id);
                END IF;

                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_policies
                    WHERE tablename = '${table}' AND policyname = 'Users can delete their own ${table}'
                ) THEN
                    CREATE POLICY "Users can delete their own ${table}" ON ${table}
                    FOR DELETE
                    USING (auth.uid() = user_id);
                END IF;
            END
            $$;
        `);
            console.log(`Enabled RLS and Policies for: ${table}`);
        }

    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await client.end();
    }
}

initDB();
