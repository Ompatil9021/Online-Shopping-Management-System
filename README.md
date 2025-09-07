# Online-Shopping-Management-System
This project is a Database Management System (DBMS) designed for an online shopping platform, handling products, customers, orders, payments, and inventory efficiently.
<br>
🛒 Online Shopping Management System
📌 Overview

The Online Shopping Management System (OSMS) is a full-stack e-commerce web application.
It allows users to:

Register and Login

Browse Products

Add Items to Cart

Place Orders with Payment Method selection

View Today’s Deals

Store sales and orders in SQL Server

🖥️ Tech Stack

Frontend: HTML, CSS, JavaScript (Live Server for testing)

Backend: Node.js, Express.js

Database: Microsoft SQL Server

Authentication: bcrypt (password hashing)

⚙️ Prerequisites

Make sure you have installed:

Node.js
 (v18 or higher recommended)

SQL Server

SQL Server Management Studio (SSMS)

VS Code with Live Server extension

📂 Project Structure
OnlineShoppingSystem/
│── backend/
│   ├── server.js        # Node.js + Express backend
│   ├── backend.env      # Database config (environment variables)
│   └── package.json
│
│── frontend/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── cart.html
│   ├── purchase.html
│   ├── style.css
│   └── script.js
│
│── OSMS.sql             # Database schema & sample data
│── README.md

🚀 Setup Instructions
1️⃣ Database Setup (SQL Server)

Open SSMS (SQL Server Management Studio)

Create a database:

CREATE DATABASE OnlineShoppingDB;


Run the SQL script provided in OSMS.sql to create tables:

Users

Products

Categories

Orders

OrderItems

Sales

Verify tables:

USE OnlineShoppingDB;
EXEC sp_help 'Users';
EXEC sp_help 'Products';

2️⃣ Backend Setup (Node.js + Express)

Navigate to backend folder:

cd OnlineShoppingSystem/backend


Install dependencies:

npm install express mssql cors body-parser bcrypt dotenv


Create a backend.env file in the backend folder:

DB_USER=sa
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_NAME=OnlineShoppingDB
DB_PORT=1433


Start the server:

node server.js


✅ Backend runs on: http://localhost:3000

3️⃣ Frontend Setup (Live Server)

Open the frontend/ folder in VS Code

Right-click index.html → Open with Live Server

Access frontend at:

http://127.0.0.1:5500/frontend/index.html
