const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
require('dotenv').config({ path: './backend.env' });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('frontend'));

const dbConfig = {
    user: "hi",
    password: "123",
    server: "localhost\\SQLEXPRESS",
    database: "OnlineShoppingDB",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

let pool; // Declare globally

// Initialize database connection pool
async function initializeDbConnection() {
    try {
        pool = await sql.connect(dbConfig);
        console.log("🟢 Connected to SQL Server.");
    } catch (err) {
        console.error("❌ Database connection error:", err);
    }
}
initializeDbConnection();

// ✅ Test DB Connection
app.get("/api/test-connection", async (req, res) => {
    if (!pool || !pool.connected) {
        return res.status(500).json({ success: false, message: "Database connection not available." });
    }
    try {
        const request = pool.request();
        await request.query("SELECT 1"); // Simple query to test connection
        res.json({ success: true, message: "Database connection successful!" });
    } catch (error) {
        console.error("Connection error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Register
app.post("/api/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (!pool || !pool.connected) {
        return res.status(500).json({ success: false, message: "Database connection not available." });
    }

    try {
        // First request to check if email already exists
        const checkRequest = pool.request();
        const check = await checkRequest
            .input("email", sql.NVarChar, email)
            .query("SELECT COUNT(*) AS Count FROM Users WHERE Email = @email");

        if (check.recordset[0].Count > 0) {
            return res.status(409).json({ success: false, message: "Email already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // New request object for insertion
        const insertRequest = pool.request();
        await insertRequest
            .input("username", sql.NVarChar, username)
            .input("email", sql.NVarChar, email)
            .input("password", sql.NVarChar, hashedPassword)
            .query("INSERT INTO Users (Username, Email, Password) VALUES (@username, @email, @password)");

        res.status(201).json({ success: true, message: "User registered successfully!" });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: "Registration failed: " + error.message });
    }
});


// ✅ Login
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!pool || !pool.connected) {
        return res.status(500).json({ success: false, message: "Database connection not available." });
    }

    try {
        const request = pool.request();
        const result = await request
            .input("email", sql.NVarChar, email)
            .query("SELECT UserID, Username, Email, Password FROM Users WHERE Email = @email");

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            const isMatch = await bcrypt.compare(password, user.Password);

            if (isMatch) {
                res.json({ success: true, message: "Login successful!", userId: user.UserID, username: user.Username });
            } else {
                res.status(401).json({ success: false, message: "Invalid email or password." });
            }
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password." });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Login failed: " + error.message });
    }
});

// ✅ Products Route (General - might still be used on a full product listing page)
app.get("/api/products", async (req, res) => {
    if (!pool || !pool.connected) {
        return res.status(500).send("Database connection not available.");
    }
    try {
        const request = pool.request();
        const result = await request.query("SELECT ProductID, Name, Description, Price, ImagePath FROM Products");
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).send("Failed to fetch products.");
    }
});

// ✅ Today's Deals Route
app.get('/api/today-deals', async (req, res) => {
    if (!pool || !pool.connected) {
        return res.status(500).send('Database connection not available.');
    }
    try {
        const request = pool.request();
        const result = await request
            .query('SELECT ProductID, Name, Description, Price, ImagePath FROM Products WHERE IsTodayDeal = 1');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching today\'s deals:', err);
        res.status(500).send('Error fetching today\'s deals from the server.');
    }
});

// ✅ Get Product by ID Route
app.get('/api/product/:id', async (req, res) => {
    const productId = req.params.id;
    if (!productId || isNaN(productId)) {
        return res.status(400).send('Invalid Product ID.');
    }
    if (!pool || !pool.connected) {
        return res.status(500).send('Database connection not available.');
    }
    try {
        const request = pool.request();
        const result = await request
            .input('ProductID', sql.Int, productId)
            .query('SELECT ProductID, Name, Description, Price, ImagePath, Stock, CategoryID FROM Products WHERE ProductID = @ProductID');
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Product not found.');
        }
    } catch (err) {
        console.error('Error fetching product details:', err);
        res.status(500).send('Error fetching product details from the server.');
    }
});

// ✅ Get Products by Category Name Route
app.get('/api/category/:categoryName', async (req, res) => {
    const categoryName = req.params.categoryName;
    if (!categoryName) {
        return res.status(400).send('Invalid Category Name.');
    }
    if (!pool || !pool.connected) {
        return res.status(500).send('Database connection not available.');
    }
    try {
        const request = pool.request();
        const categoryResult = await request
            .input('CategoryName', sql.NVarChar, categoryName)
            .query('SELECT CategoryID FROM Categories WHERE CategoryName = @CategoryName');

        if (categoryResult.recordset.length > 0) {
            const categoryId = categoryResult.recordset[0].CategoryID;
            const productsResult = await request
                .input('CategoryID', sql.Int, categoryId)
                .query('SELECT ProductID, Name, Description, Price, ImagePath FROM Products WHERE CategoryID = @CategoryID');
            res.json(productsResult.recordset);
        } else {
            res.status(404).send('Category not found.');
        }
    } catch (err) {
        console.error('Error fetching products by category:', err);
        res.status(500).send('Error fetching products by category from the server.');
    }
});

// ✅ Search Products Route
app.get('/api/search', async (req, res) => {
    const query = req.query.query; // Get the search term from the query parameters

    if (!query) {
        return res.status(400).json({ message: 'Search query is required.' });
    }
    if (!pool || !pool.connected) {
        return res.status(500).json({ message: 'Database connection not available.' });
    }
    try {
        const request = pool.request();
        const result = await request
            .input('searchTerm', sql.NVarChar, `%${query}%`) // Use wildcards for partial matches
            .query(`
                SELECT ProductID, Name, Description, Price, ImagePath
                FROM Products
                WHERE Name LIKE @searchTerm OR Description LIKE @searchTerm;
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error during search:", err);
        res.status(500).json({ message: 'Error during search.' });
    }
});

// ✅ Purchase Single Item (from 1st code) - Renamed to avoid conflict
app.post("/api/purchase-single", async (req, res) => {
    const { name, price } = req.body;

    if (!pool || !pool.connected) {
        return res.status(500).json({ message: 'Database connection not available.' });
    }

    try {
        const request = pool.request();
        await request
            .input("ProductName", sql.NVarChar, name)
            .input("Price", sql.Decimal, price)
            .query("INSERT INTO sales (ProductName, Price) VALUES (@ProductName, @Price)");

        res.json({ message: "Item purchased successfully!" });
    } catch (error) {
        console.error("Error purchasing item:", error);
        res.status(500).json({ message: "Error processing purchase." });
    }
});

// ✅ Purchase All Items (from 1st code) - Renamed to avoid conflict
app.post("/api/purchase-all-basic", async (req, res) => {
    const { items } = req.body;

    if (!pool || !pool.connected) {
        return res.status(500).json({ message: 'Database connection not available.' });
    }

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "Cart is empty." });
    }

    try {
        const request = pool.request();
        for (const item of items) {
            await request
                .input("ProductName", sql.NVarChar, item.name)
                .input("Price", sql.Decimal, item.price)
                .query("INSERT INTO sales (ProductName, Price) VALUES (@ProductName, @Price)");
        }

        res.json({ message: "All items purchased successfully!" });
    } catch (error) {
        console.error("Error processing purchase:", error);
        res.status(500).json({ message: "Error processing purchase." });
    }
});

// ✅ Purchase with User, Cart Details (with Transaction Management) - UPDATED for altered Orders table
app.post('/api/purchase', async (req, res) => {
    const { userId, name, address, paymentMethod, cartItems } = req.body;

    if (!pool || !pool.connected) {
        return res.status(500).json({ success: false, error: "Database connection not available." });
    }

    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const request = transaction.request();
        const orderDate = new Date();
        let totalAmount = 0;
        for (const item of cartItems) {
            totalAmount += item.price * item.quantity;
        }

        const result = await request
            .input("UserID", sql.Int, userId)
            .input("Name", sql.NVarChar(100), name)
            .input("Address", sql.NVarChar(255), address)
            .input("PaymentMethod", sql.NVarChar(50), paymentMethod)
            .input("OrderDate", sql.DateTime, orderDate)
            .input("Amount", sql.Decimal(10, 2), totalAmount)
            .input("Status", sql.NVarChar(20), 'Pending') // Default status
            .query(`
                INSERT INTO Orders (UserID, OrderDate, Amount, Status, Name, Address, PaymentMethod)
                OUTPUT INSERTED.OrderID
                VALUES (@UserID, @OrderDate, @Amount, @Status, @Name, @Address, @PaymentMethod)
            `);

        const orderId = result.recordset[0].OrderID;

        for (const item of cartItems) {
            await transaction.request()
                .input("OrderID", sql.Int, orderId)
                .input("ProductID", sql.Int, item.productId)
                .input("Quantity", sql.Int, item.quantity)
                .input("Price", sql.Decimal(10, 2), item.price)
                .query(`
                    INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price)
                    VALUES (@OrderID, @ProductID, @Quantity, @Price)
                `);
        }

        await transaction.commit();
        res.status(200).json({ success: true, message: "Order placed successfully" });

    } catch (err) {
        if (transaction && transaction.rollback) {
            await transaction.rollback();
        }
        console.error("❌ Backend error placing order:", err);
        res.status(500).json({ success: false, error: "Failed to place order" });
    }
});

// POST: Purchase All (Corrected for Sales Table based on provided schema)
app.post('/api/purchase-all', async (req, res) => {
    const { userId, cartItems } = req.body; // Only expecting userId and cartItems

    console.log("📦 Purchase request received:", req.body);

    if (!pool || !pool.connected) {
        return res.status(500).json({ message: 'Database connection not available.' });
    }

    try {
        const request = pool.request();
        const purchaseDate = new Date();

        for (const item of cartItems) {
            await request
                .input('UserID', sql.Int, userId) // Assuming you want to associate the sale with a user
                .input('ProductID', sql.Int, item.productId)
                .input('Quantity', sql.Int, item.quantity || 1) // Use quantity from cart item, default to 1
                .input('Price', sql.Decimal(10, 2), item.price)
                .input('PurchaseDate', sql.DateTime, purchaseDate)
                .query(`
                    INSERT INTO Sales (UserID, ProductID, Quantity, Price, PurchaseDate)
                    VALUES (@UserID, @ProductID, @Quantity, @Price, @PurchaseDate)
                `);
        }

        res.status(200).json({ message: 'Purchase completed successfully!' });
    } catch (err) {
        console.error("❌ Backend error placing order:", err);
        res.status(500).json({ message: 'Error placing order' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
});