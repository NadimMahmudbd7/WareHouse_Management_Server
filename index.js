const express = require('express');
const cors = require('cors');
require('dotenv').config()
var jwt = require('jsonwebtoken');
const res = require('express/lib/response');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())
function VerifyAccess(token) {
    let email;
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            email = "Invalid Email"
        }
        if (decoded) {
            email = decoded
        }
    });
    return email
}

async function run() {

    const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.ambpg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    console.log("connected db");
    try {
        await client.connect()
        const WaltonCollections = client.db("WaltonCollection").collection("Products")

        



        // ..................................// For All Products //...........................................................//

        app.get('/products', async (req, res) => {
            const query = {}
            const filter = {}
            const cursor = WaltonCollections.find(query)
            const products = await cursor.limit(6).toArray()
            const findAllProducts = WaltonCollections.find(filter)
            const allProducts = await findAllProducts.toArray()
            res.send({ success: "successfully loaded", products: products, allProducts: allProducts })
        })


        // ..................................// For Update Products //...........................................................//

        app.get("/updateproduct/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const product = await WaltonCollections.findOne(query)
            res.send({ success: "find Successfullu", product: product })
        })


        // ..................................// Deliver Products Quentity //...........................................................//

        app.put("/updateproduct/:id", async (req, res) => {
            const id = req.params.id
            let previusQty = parseInt(req.body.qty)
            console.log(previusQty);
            if (previusQty < 1) {
                res.send({ error: "Sold Out" })
            }
            else {
                const deliverQty = parseInt(req.body.deliverQty)
                console.log(deliverQty);
                if (previusQty < deliverQty) {
                    res.send({ error: "You Haven't Enough Quentity For Deliver" })
                }
                else {
                    previusQty = previusQty - deliverQty
                    const filter = { _id: ObjectId(id) }
                    const options = { upsert: true };
                    const updateDoc = {
                        $set: {
                            qty: previusQty
                        }
                    };
                    const result = await WaltonCollections.updateOne(filter, updateDoc, options)
                    res.send({ successfull: "successfull", result: result })
                }
            }

        })


        // ..................................// Add Products Quentity //...........................................................//

        app.put("/updateproducts/:id", async (req, res) => {
            const id = req.params.id
            let previusQty = parseInt(req.body.qty)
            const deliverQty = parseInt(req.body.deliverQty)
            previusQty = previusQty + deliverQty
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    qty: previusQty
                }
            };
            const result = await WaltonCollections.updateOne(filter, updateDoc, options)
            res.send({ successfull: "successfull", result: result })
        })


        // ..................................// Add New Product //...........................................................//

        app.post("/products", async (req, res) => {
            const newitem = req.body
            const token = req.headers.authorization
            const [email, AccessToken] = token.split(" ")
            const decoded = VerifyAccess(AccessToken)
            console.log(decoded.email);
            if (decoded.email === email) {
                const result = await WaltonCollections.insertOne(newitem)
                res.send({ value: true, success: "Added Successfull", result: result })
            }
            else {
                res.send({ value: false, success: "Unauthorized Access" })
            }
        })


        // ..................................// Delete Products //...........................................................//

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await WaltonCollections.deleteOne(query)
            res.send(result)
        })




        // ..................................// Per User Item //...........................................................//
        app.get("/items", async (req, res) => {
            const email = req.query.email
            const query = { email }
            const cursor = WaltonCollections.find(query)
            const users = await cursor.toArray()
            res.send({ success: "successfully added", users: users })
        })


        app.post("/login", (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.ACCESS_TOKEN);
            res.send({ token })
        })
    }
    finally {

    }
}

run().catch(console.dir)

app.get("/", (req, res) => {
    res.send("This website Is Running")
})

app.listen(port, () => {
    console.log("Listening port", port);
})




