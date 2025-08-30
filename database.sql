-- Create database (run this first)
CREATE DATABASE movie_website;

-- Connect to the database and create tables
\c movie_website;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    movie_title VARCHAR(200) NOT NULL,
    review_text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data (optional)
INSERT INTO users (username, email, password) VALUES 
('testuser', 'test@example.com', 'password123'),
('moviefan', 'fan@example.com', 'mypass456');