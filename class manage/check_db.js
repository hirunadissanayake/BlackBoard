import pg from 'pg';

const { Client } = pg;

// URL encode the password to handle special characters like '@'
const password = encodeURIComponent('Hiruna@2002h');
const connectionString = `postgresql://postgres:${password}@db.ssgvfvtzpdjqxnojnrts.supabase.co:5432/postgres`;

console.log('Connecting to database...');

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkTables() {
    try {
        await client.connect();
        console.log('Connected successfully.');

        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        console.log('Tables found:', res.rows.length);
        res.rows.forEach(row => {
            console.log(`- ${row.table_name}`);
        });

    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        await client.end();
    }
}

checkTables();
