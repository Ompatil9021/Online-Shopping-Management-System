🛍️ Welcome to the Online Shopping Management System
This project is a full-stack application designed to simulate an online shopping experience, including user management, product listings, and transaction handling.

🔧 How to Set Up and Use the Project
Please follow the steps below to get the system up and running:

1️⃣ Required Tools
Ensure the following tools are installed on your system:

SQL Server Management Studio (SSMS Express)

During setup, choose SQL Server Authentication (not Windows Authentication)

Node.js

Visual Studio Code

Install the Live Server extension from the Extensions Marketplace

2️⃣ Database Setup
Open SSMS and connect using your SQL Server Authentication credentials.

Open the osms.sql file located in the project.

Run all SQL queries to create the database and required tables.

3️⃣ Backend Configuration
Open the project folder in VS Code.

Locate and open the server.js file.

Configure your SQL Server credentials in the database connection section.
Example:

js
Copy
Edit
const dbConfig = {
    user: 'your_username',
    password: 'your_password',
    server: 'localhost',
    database: 'osms',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};
✅ You're all set!
Now, run the backend server using:

bash
Copy
Edit
node server.js
And launch the frontend using Live Server from VS Code.