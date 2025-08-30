Movie Website Setup Instructions
=====================================

This website now has user accounts and PostgreSQL database integration!

SETUP STEPS:
1. Install PostgreSQL on your computer
2. Create the database by running the SQL commands in database.sql
3. Update server.js with your PostgreSQL password (line 11)
4. Install Node.js dependencies: npm install
5. Start the server: npm start
6. Open http://localhost:3000 in your browser

FEATURES ADDED:
- User registration (register.html)
- User login (login.html) 
- User reviews for movies stored in database
- Simple authentication (no encryption as requested)

DATABASE TABLES:
- users: stores usernames, emails, passwords
- reviews: stores movie reviews with ratings (1-5 stars)

HOW TO USE:
1. Register a new account or login
2. Click on any movie from the homepage
3. Leave a review and rating
4. View all user reviews for each movie

IMPORTANT:
- Update the PostgreSQL password in server.js before running
- The database must be running for the website to work
- Reviews are only visible after logging in