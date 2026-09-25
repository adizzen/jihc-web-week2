import http from 'http';
import CoBody from 'co-body';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    database: 'travel_db',
    user: 'adin',
    host: 'localhost',
    port: 5432
});

pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Database connected!');
    }
});

async function registerUser(req) {
    const body = await CoBody.json(req);

    await pool.query(
        `INSERT INTO users (name, email, destination, password)
         VALUES ($1, $2, $3, $4)`,
        [
            body.name,
            body.email,
            body.destination,
            body.password
        ]
    );

    return {
        message: 'User registered successfully'
    };
}

async function loginUser(req) {
    const body = await CoBody.json(req);

    const result = await pool.query(
        `SELECT * FROM users
         WHERE email = $1 AND password = $2`,
        [body.username, body.password]
    );

    if (result.rows.length > 0) {
        return {
            message: 'Login successful'
        };
    }

    return {
        message: 'Wrong username or password'
    };
}

function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });

    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
        sendResponse(res, 200, {});
        return;
    }

    try {
        if (req.method === 'GET' && req.url === '/users') {
        const result = await pool.query('SELECT * FROM users');

        sendResponse(res, 200, result.rows);
        return;
}

        if (req.method === 'POST' && req.url === '/register') {
            const result = await registerUser(req);
            sendResponse(res, 200, result);
            return;
        }

        if (req.method === 'POST' && req.url === '/login') {
            const result = await loginUser(req);
            sendResponse(res, 200, result);
            return;
        }

        sendResponse(res, 404, {
            message: 'Not found'
        });
    } catch (error) {
        console.log(error);

        sendResponse(res, 500, {
            message: 'Server error'
        });
    }
});

server.listen(3000, () => {
    console.log('Server started on port 3000');
});