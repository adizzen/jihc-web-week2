import http from 'http';
import fs from 'fs';
import CoBody from 'co-body';

function getUsers() {
    const data = fs.readFileSync('./data.json');
    return JSON.parse(data);
}

async function registerUser(req) {
    const body = await CoBody.json(req);
    const users = getUsers();

    users.push(body);

    fs.writeFileSync(
        './data.json',
        JSON.stringify(users, null, 2)
    );

    return {
        message: 'User registered successfully'
    };
}

async function loginUser(req) {
    const body = await CoBody.json(req);
    const users = getUsers();

    const user = users.find(item => {
        return item.email === body.username &&
            item.password === body.password;
    });

    if (user) {
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
            const users = getUsers();
            sendResponse(res, 200, users);
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