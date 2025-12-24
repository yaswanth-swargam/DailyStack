# DailyStack
Daily Stack is a sleek, responsive web application designed for users to document their daily experiences and thoughts. Built with a focus on clean UI/UX and efficient data management, it allows users to maintain a private digital diary with full CRUD (Create, Read, Update, Delete) capabilities.


Daily Stack 📚
A Full-Stack Personal Journaling Web Application

Daily Stack is a secure digital diary designed to help users document their daily experiences. The application combines a classic typographic aesthetic with a modern RESTful architecture to provide a seamless CRUD (Create, Read, Update, Delete) experience.

🚀 Key Features
User Authentication: Secure registration and login using Bcrypt password hashing.

Dynamic Post Feed: A personalized dashboard that fetches and displays user-specific entries from a MySQL database.

Full CRUD Functionality: Users can create new entries, view detailed posts, edit content, and delete old logs.

Responsive UI: Built with Bootstrap 5 for a mobile-first, responsive experience across all devices.

SQL Injection Prevention: Implementation of parameterized queries to ensure data security.

🛠️ Tech Stack
Frontend: HTML5, CSS3, JavaScript (ES6), Bootstrap 5.

Backend: Node.js, Express.js.

Database: MySQL.

Security: Bcrypt.js for credential encryption.

🗄️ Database Schema
The project utilizes a relational database structure consisting of two primary tables:

Users Table: Stores unique user IDs, emails, and hashed passwords.

Posts Table: Stores journal entries linked to users via a userId foreign key.

🔌 API Endpoints
Authentication
POST /registerUser: Handles new user registration with password matching and duplicate email checks.

POST /loginUser: Validates credentials and returns a userId for session management.

Journal Operations
GET /getPosts/:userId: Fetches all logs for a specific user.

POST /newPost: Creates a new journal entry.

PUT /updatePost/:userId/:postId: Updates an existing entry.

DELETE /deletePost/:postId: Removes an entry from the database.

⚙️ Installation & Setup
Clone the Repository:

Bash

git clone https://github.com/yaswanth-swargam/DailyStack.git
Database Setup:

Import dairy_users.sql and dairy_posts.sql into your MySQL instance.

Ensure the database is named dairy.

Backend Configuration:

Navigate to the /backend folder.

Install dependencies: npm install.

Run the server: node app.js.

Launch Frontend:

Open login.html in your browser.
