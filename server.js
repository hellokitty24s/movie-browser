const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

// Database connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'movie_website',
    password: '24022004Sj!',
    port: 5432,
});

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Session storage (simple in-memory)
const sessions = {};

// Register user
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
            [username, email, password]
        );
        res.json({ success: true, userId: result.rows[0].id });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === '23505') {
            res.json({ success: false, error: 'Username or email already exists' });
        } else {
            res.json({ success: false, error: 'Registration failed: ' + error.message });
        }
    }
});

// Login user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const result = await pool.query(
            'SELECT id, username FROM users WHERE username = $1 AND password = $2',
            [username, password]
        );
        
        if (result.rows.length > 0) {
            const sessionId = Math.random().toString(36);
            sessions[sessionId] = result.rows[0];
            res.json({ success: true, sessionId: sessionId, user: result.rows[0] });
        } else {
            res.json({ success: false, error: 'Invalid username or password' });
        }
    } catch (error) {
        res.json({ success: false, error: 'Login failed' });
    }
});

// Get user info
app.get('/user/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (sessions[sessionId]) {
        res.json({ success: true, user: sessions[sessionId] });
    } else {
        res.json({ success: false, error: 'Session not found' });
    }
});

// Add review
app.post('/review', async (req, res) => {
    const { sessionId, movieTitle, reviewText, rating } = req.body;
    
    if (!sessions[sessionId]) {
        return res.json({ success: false, error: 'Not logged in' });
    }
    
    const userId = sessions[sessionId].id;
    
    try {
        const result = await pool.query(
            'INSERT INTO reviews (user_id, movie_title, review_text, rating) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, movieTitle, reviewText, rating]
        );
        res.json({ success: true, review: result.rows[0] });
    } catch (error) {
        res.json({ success: false, error: 'Failed to add review' });
    }
});

// Get reviews for movie
app.get('/reviews/:movieTitle', async (req, res) => {
    const { movieTitle } = req.params;
    
    try {
        const result = await pool.query(`
            SELECT r.*, u.username 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.movie_title = $1 
            ORDER BY r.created_at DESC
        `, [movieTitle]);
        
        res.json({ success: true, reviews: result.rows });
    } catch (error) {
        res.json({ success: false, error: 'Failed to get reviews' });
    }
});

// Logout
app.post('/logout', (req, res) => {
    const { sessionId } = req.body;
    delete sessions[sessionId];
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});