const connection = require('./config/db');

async function migrate() {
    try {
        // Check existing columns
        const [cols] = await connection.promise().query('DESCRIBE user');
        const colNames = cols.map(c => c.Field);
        console.log('Existing columns:', colNames.join(', '));

        if (!colNames.includes('bio')) {
            await connection.promise().query('ALTER TABLE user ADD COLUMN bio TEXT');
            console.log('Added: bio');
        } else {
            console.log('bio already exists');
        }

        if (!colNames.includes('profile_pic')) {
            await connection.promise().query('ALTER TABLE user ADD COLUMN profile_pic VARCHAR(500)');
            console.log('Added: profile_pic');
        } else {
            console.log('profile_pic already exists');
        }

        // Verify
        const [rows] = await connection.promise().query('SELECT id, name, bio, profile_pic FROM user LIMIT 2');
        console.log('Test query OK:', JSON.stringify(rows));

    } catch (e) {
        console.error('Migration error:', e.message);
    } finally {
        process.exit();
    }
}

migrate();
