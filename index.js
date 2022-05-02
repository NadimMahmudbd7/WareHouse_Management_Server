const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())


async function run(){
    
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.ambpg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log("connected db");
    try{
        await client.connect()
        const WaltonCollections = client.db("WaltonCollection").collection("Products")
        const AllUsers = client.db("WaltonCollection").collection("users")

        app.get("/",(req,res)=>{
            res.send("this is successfull")
        })
        
        // for show all products
        app.get('/products',async(req,res)=>{
            const query = {}
            const filter ={}
            const cursor = WaltonCollections.find(query)
            const products = await cursor.limit(6). toArray()
            const  findAllProducts = WaltonCollections.find(filter)
            const allProducts = await findAllProducts.toArray()
            res.send({success:"successfully loaded", products:products, allProducts:allProducts})
        })

        // for update products
        app.get("/updateproduct/:id",async(req,res)=>{
            const id = req.params.id
            const query = {_id:ObjectId(id)}
            const product = await WaltonCollections.findOne(query)
            res.send({success:"find Successfullu", product:product})
        })


        // for deliver products
        app.put("/updateproduct/:id",async(req,res)=>{
            const id = req.params.id
            console.log(req.query.data);
            let previusQty=parseInt(req.body.qty)
            const deliverQty = parseInt(req.body.deliverQty)
            previusQty = previusQty-deliverQty
            const filter = {_id:ObjectId(id)}
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    qty:previusQty
                }
              };
              const result = await WaltonCollections.updateOne(filter,updateDoc,options)
              console.log();
            res.send({succrssfull:"successfull",result:result})            
        })

        app.put("/updateproducts/:id",async(req,res)=>{
            const id = req.params.id
            let previusQty=parseInt(req.body.qty)
            const deliverQty = parseInt(req.body.deliverQty)
            previusQty = previusQty+deliverQty
            const filter = {_id:ObjectId(id)}
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    qty:previusQty
                }
              };
              const result = await WaltonCollections.updateOne(filter,updateDoc,options)
              console.log();
            res.send({succrssfull:"successfull",result:result})            
        })

        app.post("/products", async(req,res)=>{
            const newitem = req.body
            const result = await WaltonCollections.insertOne(newitem)
            console.log("add",result);
            res.send(result)
        })

        // for Delete
        app.delete('/products/:id',async(req,res)=>{
            const id = req.params.id
            console.log(id);
            const query = {_id:ObjectId(id)}
            const result = await WaltonCollections.deleteOne(query)
            console.log("deleted", result);
            res.send(result)
        })


        app.post("/signup", async(req,res)=>{
            const newusers = req.body
            const result = await AllUsers.insertOne(newusers)
            console.log("add",result);
            res.send(result)
        })

        // Per User Items
        app.get("/items",async(req,res)=>{
            const email = req.query.email
            console.log(email);
            const query = {email}
            const cursor = WaltonCollections.find(query)
            const users = await cursor.toArray()
            res.send({success:"successfully added",users:users})
        })
    }
    finally{

    }
}

run().catch(console.dir)

app.listen(port,()=>{
    console.log("Listening port",port);
})
