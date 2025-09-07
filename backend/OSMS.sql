-- Create the database
CREATE DATABASE OnlineShoppingDB;
GO

USE OnlineShoppingDB;
GO

-- Users Table
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    Password NVARCHAR(256) NOT NULL,
    PhoneNumber NVARCHAR(15),
    Address NVARCHAR(255)
);
GO

-- Categories Table (created first to reference in Products)
CREATE TABLE Categories (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    CategoryName NVARCHAR(100) NOT NULL,
    ParentCategoryID INT NULL
);
GO

-- Add self-referential foreign key after table creation
ALTER TABLE Categories
ADD CONSTRAINT FK_ParentCategory 
FOREIGN KEY (ParentCategoryID) REFERENCES Categories(CategoryID)
ON DELETE NO ACTION;
GO

-- Products Table
CREATE TABLE Products (
    ProductID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Price DECIMAL(10, 2) NOT NULL,
    Stock INT CHECK (Stock >= 0),
    CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID) ON DELETE CASCADE,
    ImagePath NVARCHAR(255),
    IsTodayDeal BIT DEFAULT 0,
    IsNewItem BIT DEFAULT 0,
    DateAdded DATETIME DEFAULT GETDATE()
);
GO

-- Orders Table
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    OrderDate DATETIME DEFAULT GETDATE(),
    Amount DECIMAL(10, 2),
    Status NVARCHAR(20) CHECK (Status IN ('Pending', 'Completed', 'Cancelled')),
    Name NVARCHAR(100),
    Address NVARCHAR(255),
    PaymentMethod NVARCHAR(50)
);
GO

-- OrderItems Table (renamed from OrderDetails for clarity)
CREATE TABLE OrderItems (
    OrderItemID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT FOREIGN KEY REFERENCES Orders(OrderID) ON DELETE CASCADE,
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    ProductName NVARCHAR(100),
    Quantity INT CHECK (Quantity > 0),
    Price DECIMAL(10, 2)
);
GO

-- Payments Table
CREATE TABLE Payments (
    PaymentID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT FOREIGN KEY REFERENCES Orders(OrderID) ON DELETE CASCADE,
    PaymentDate DATETIME DEFAULT GETDATE(),
    PaymentMode NVARCHAR(20) CHECK (PaymentMode IN ('UPI', 'Card', 'COD')),
    Status NVARCHAR(20) CHECK (Status IN ('Pending', 'Completed', 'Failed'))
);
GO

-- Additional Tables
CREATE TABLE Coupons (
    CouponID INT PRIMARY KEY IDENTITY(1,1),
    CouponCode VARCHAR(50) UNIQUE NOT NULL,
    DiscountPercentage DECIMAL(5,2) CHECK (DiscountPercentage BETWEEN 0 AND 100),
    ExpiryDate DATE NOT NULL
);
GO

CREATE TABLE Notifications (
    NotificationID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    Message TEXT NOT NULL,
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Admins (
    AdminID INT PRIMARY KEY IDENTITY(1,1),
    Username VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(50) DEFAULT 'Admin'
);
GO

CREATE TABLE Suppliers (
    SupplierID INT PRIMARY KEY IDENTITY(1,1),
    Name VARCHAR(255) NOT NULL,
    ContactEmail VARCHAR(255) UNIQUE,
    ContactPhone VARCHAR(20),
    Address TEXT
);
GO

CREATE TABLE Inventory (
    InventoryID INT PRIMARY KEY IDENTITY(1,1),
    ProductID INT NOT NULL FOREIGN KEY REFERENCES Products(ProductID) ON DELETE CASCADE,
    Quantity INT DEFAULT 0,
    LastUpdated DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Discounts (
    DiscountID INT PRIMARY KEY IDENTITY(1,1),
    DiscountName VARCHAR(255) NOT NULL,
    DiscountPercentage DECIMAL(5,2) CHECK (DiscountPercentage BETWEEN 0 AND 100),
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    ProductID INT NOT NULL FOREIGN KEY REFERENCES Products(ProductID) ON DELETE CASCADE
);
GO

CREATE TABLE Shipping (
    ShippingID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL FOREIGN KEY REFERENCES Orders(OrderID) ON DELETE CASCADE,
    TrackingNumber VARCHAR(50) UNIQUE,
    Carrier VARCHAR(50),
    Status VARCHAR(50) DEFAULT 'Processing',
    EstimatedDelivery DATE
);
GO

CREATE TABLE Reviews (
    ReviewID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    ProductID INT NOT NULL FOREIGN KEY REFERENCES Products(ProductID) ON DELETE CASCADE,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT,
    ReviewDate DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE WishList (
    WishListID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    ProductID INT NOT NULL FOREIGN KEY REFERENCES Products(ProductID) ON DELETE CASCADE,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE sales (
    SaleID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    Quantity INT DEFAULT 1,
    Price DECIMAL(10,2) NOT NULL,
    PurchaseDate DATETIME DEFAULT GETDATE()
);
GO

-- Insert sample data
INSERT INTO Users (Username, Email, Password, PhoneNumber, Address) 
VALUES 
('john_doe', 'john@example.com', 'hashed_password', '9876543210', '123 Main St'),
('seller_abc', 'seller@example.com', 'hashed_password', '9876543211', '456 Market St'),
('real_user', 'realuser@example.com', '$2b$10$WucQQGyrEjI0CNwY8x7gK.v8fHz8RE0Xb1/CsN9vM6l/UpP1v3JmC', '9876543212', '789 Real St'),
('test_user', 'test@example.com', '$2b$10$Lkd7c4UmfUPL4PGZZv8BVe77/BB1rBvwcLgBU3zqLkVDqFD2LuDsG', '1234567890', 'Test Street');
GO

-- Insert categories with hierarchy
INSERT INTO Categories (CategoryName, ParentCategoryID) VALUES
('Electronics', NULL),
('Phones', 1),
('Smartphones', 2),
('Feature Phones', 2),
('Watches', 1),
('Smartwatches', 5),
('Analog Watches', 5),
('Audio', 1),
('Earbuds', 8),
('Headphones', 8),
('Laptops', 1);
GO

-- Insert sample products
INSERT INTO Products (Name, Description, Price, Stock, CategoryID, ImagePath) VALUES
('Laptop', 'Gaming Laptop', 75000, 10, 11, 'images/laptop.png'),
('Phone', 'Smartphone', 50000, 50, 3, 'images/iphone.png'),
('Headphones', 'Premium headphones', 3000, 30, 10, 'images/headphone.png'),
('Xiaomi Redmi Note 13 Pro', 'Powerful mid-range smartphone', 15299.99, 25, 3, 'images/smartphones/redmi_note_13_pro.jpg'),
('Google Pixel 8a', 'Compact with fantastic camera', 20449.00, 18, 3, 'images/smartphones/google_pixel_8a.jpg'),
('Samsung Galaxy A55', 'Balanced performance', 30379.50, 30, 3, 'images/smartphones/samsung_a55.jpg'),
('iPhone 16 Pro Max', 'Latest flagship iPhone', 100000.00, 12, 3, 'images/smartphones/iphone_16_pro_max.jpg'),
('Dell XPS 15 (2024)', 'Premium laptop', 189900.00, 8, 11, 'images/laptops/Dell_XPS%2015_(2024).jpg'),
('HP Spectre x360 14', 'Versatile 2-in-1 laptop', 154999.00, 10, 11, 'images/laptops/hp_spectre_x360_14.jpg'),
('Apple Watch Series 9', 'Advanced smartwatch', 45900.00, 12, 6, 'images/watches/apple_watch_series_9.jpg'),
('Rolex Submariner', 'Luxury dive watch', 950000.00, 5, 5, 'images/watches/rolex_submariner.jpg');
GO

-- Mark some products as deals/new items
UPDATE Products SET IsTodayDeal = 1 WHERE ProductID IN (4, 8);
UPDATE Products SET IsNewItem = 1 WHERE ProductID IN (5, 9);
GO

-- Create sample orders
INSERT INTO Orders (UserID, Amount, Status, Name, Address, PaymentMethod)
VALUES (1, 125000.00, 'Completed', 'John Doe', '123 Main St', 'Card'),
       (3, 45900.00, 'Pending', 'Real User', '789 Real St', 'UPI');
GO

INSERT INTO OrderItems (OrderID, ProductID, ProductName, Quantity, Price)
VALUES (1, 1, 'Laptop', 1, 75000.00),
       (1, 3, 'Headphones', 1, 3000.00),
       (2, 10, 'Apple Watch Series 9', 1, 45900.00);
GO

-- Create admin user
INSERT INTO Admins (Username, PasswordHash) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx3Zmrzo5NeC1k7JTDhD7Xl1lLYjH1KQb7i7vY2zKO');
GO

-- Verify data
SELECT * FROM Users;
SELECT * FROM Products;
SELECT * FROM Orders;
SELECT * FROM OrderItems;
GO