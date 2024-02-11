// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Set up Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON
app.use(bodyParser.json());

// MongoDB Connection URI
const mongoURI = "mongodb+srv://<username_pass></username_pass>:test@webtech.yks5px6.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(mongoURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Define MongoDB collection
let customerCollection;

// Connect to MongoDB and set up collection
async function connectDB() {
    try {
        await client.connect();
        await client.db("sample_analytics").command({ ping: 1 });
        console.log("Connected to MongoDB Atlas");
        customerCollection = client.db("sample_analytics").collection('customers');
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error);
        process.exit(1);
    }
}
connectDB();

// POST /customers: Create a new customer
app.post('/customers', async (req, res) => {
    try {
        const { username, address, email } = req.body;
        if (!username || !address || !email) {
            return res.status(400).json({ error: 'Username, address, and email are required' });
        }
        const result = await customerCollection.insertOne({ username, address, email });
        res.status(201).json(result.ops[0]);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /customers: Retrieve all customers
app.get('/customers', async (req, res) => {
    try {
        const customers = await customerCollection.find().toArray();
        res.json(customers);
    } catch (error) {
        console.error('Error retrieving customers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /customers/:id: Retrieve a single customer by ID
app.get('/customers/:id', async (req, res) => {
    try {
        const customer = await customerCollection.findOne({ _id: ObjectId(req.params.id) });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        console.error('Error retrieving customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /customers/:id: Update a customer by ID
app.put('/customers/:id', async (req, res) => {
    try {
        const { username, address, email } = req.body;
        if (!username || !address || !email) {
            return res.status(400).json({ error: 'Username, address, and email are required' });
        }
        const result = await customerCollection.updateOne(
            { _id: ObjectId(req.params.id) },
            { $set: { username, address, email } }
        );
        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ message: 'Customer updated successfully' });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /customers/:id: Delete a customer by ID
app.delete('/customers/:id', async (req, res) => {
    try {
        const result = await customerCollection.deleteOne({ _id: ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
