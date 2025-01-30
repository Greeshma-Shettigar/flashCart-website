const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();

app.use(express.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));
app.use((req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    next();
});

app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'shawarma@91625',
    database: 'online_shopping'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
// User Registration
app.post('/api/register', async (req, res) => {
    console.log("Recieved registration request",req.body);
    const { customerName, email, password } = req.body;
    try{
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO Customer (CustomerName, Email, Password) VALUES (?, ?, ?)';
    
    db.query(sql, [customerName, email, hashedPassword], (err, result) => {
        if (err) {
            console.error('Dtaabase error :',err);
            res.status(500).json({message :"Internal server error"});
            return;
        }
        res.json({ message: 'User registered successfully!' });
    });
}catch(err){
    console.error('Error:',err);
    res.status(500).json({message :'Internal server error'});

}
});

// User Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM Customer WHERE Email = ?';

    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        
        if (results.length === 0) {
            console.log('No user found with this email:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const storedHashedPassword = results[0].Password;
        console.log('Stored Hashed Password:', storedHashedPassword);

        try {
            const isValidPassword = await bcrypt.compare(password, storedHashedPassword);
            console.log('Password Comparison Result:', isValidPassword);

            if (!isValidPassword) {
                console.log('Password does not match for email:', email);
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            req.session.user = results[0];
            console.log('User session set:', req.session.user); // Debugging log
            console.log('Session data after login:', req.session); 
            res.json({ message: 'Login successful!' });
        } catch (err) {
            console.error('Error during password comparison:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
});



// Add Product
app.post('/api/addProduct', (req, res) => {
    const { productName, sku, price, stock, category } = req.body;
    const sql = 'INSERT INTO Product (ProductName, SKU, Price, Stock, CategoryID) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [productName, sku, price, stock, category], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Product added successfully!' });
    });
});

// Add to Cart
app.post('/api/addToCart', (req, res) => {
    const { customerID, productID } = req.body;
    const sql = 'INSERT INTO Cart (CustomerID, ProductID) VALUES (?, ?) ON DUPLICATE KEY UPDATE ProductID = VALUES(ProductID)';
    
    db.query(sql, [customerID, productID], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.json({ message: 'Item added to cart successfully!' });
    });
});

 

// Place Order
app.post('/api/placeOrder', (req, res) => {
    const { customerID, items } = req.body;
    console.log('Received order request for customer:', customerID, 'with items:', items);
    
    const sqlOrder = 'INSERT INTO `Orders` (OrderDate, CustomerID) VALUES (CURDATE(), ?)';
    
    db.query(sqlOrder, [customerID], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        const orderID = result.insertId;

        let errorOccurred = false;

        items.forEach(item => {
            const sqlOrderItem = 'INSERT INTO OrderItem (OrderID, ProductID, Quantity) VALUES (?, ?, ?)';
            db.query(sqlOrderItem, [orderID, item.productID, item.quantity], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    errorOccurred = true;
                }
            });
        });

        if (errorOccurred) {
            return res.status(500).json({ message: 'Error occurred while placing order items' });
        }

        res.json({ message: 'Order placed successfully!' });
    });
});

app.get('/api/product', (req, res) => {
    const sql = 'SELECT p.ProductID, p.ProductName, p.SKU, p.Price, p.Stock, c.CategoryName, p.Size, p.ImagePath FROM Product p JOIN Category c ON p.CategoryID = c.CategoryID';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
       console.log("product fetched",results);
        res.json(results);
    });
});
app.get('/api/currentCustomer', (req, res) => {
    if (req.session && req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: 'Not logged in' });
    }
});

// Get Order Summary
app.get('/api/orderSummary', (req, res) => {
    const { customerID } = req.query;
    const sql = 'SELECT * FROM OrderSummary WHERE CustomerID = ?';
    
    db.query(sql, [customerID], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.json(results);
    });
});



//Get cart
app.get('/api/cartItems', (req, res) => {
    const customerID = req.query.customerID;
    const sql = 'SELECT Cart.*, Product.ProductName, Product.Price FROM Cart JOIN Product ON Cart.ProductID = Product.ProductID WHERE Cart.CustomerID = ?';

    db.query(sql, [customerID], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.json(results);
    });
});




app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
 