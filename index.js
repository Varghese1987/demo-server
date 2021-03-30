const express = require("express");
const app = express();

app.use(express.json())

const mongodb = require("mongodb");
const { DB_URL } = require("./environment");
const { hashing, hashCompare, createJWT, authenticate } = require("./authorize");
const mongoClient = mongodb.MongoClient;

const dbUrl = DB_URL;


app.get("/",(req,res)=>{
    res.send("Welcome to My App")
})

// register route

app.post("/register", async (req,res)=>{
    
    const client = await mongoClient.connect(dbUrl);
    if(client){
        try {
                const db = client.db("productManager");
                const documentFind = await db.collection("users").findOne({email:req.body.email});
                if(documentFind){
                    res.status(400).json({
                        message:"User already Exists"
                    })
                }else{
                    const hash = await hashing(req.body.password);
                    req.body.password = hash;
                    const document = await db.collection("users").insertOne(req.body);
                    if(document){
                        res.status(200).json({
                            "message":"Record created"
                        })
                    }
                }
            client.close();
        } catch (error) {
            console.log(error);
            client.close();
        }
    }else{
        res.sendStatus(500);
    }
})

//login

app.post("/login", async(req,res)=>{
    const client = await mongoClient.connect(dbUrl);
    if(client){
        try {
            const { email, password} = req.body;
            const db = client.db("productManager");
            const user = await db.collection("users").findOne({email});
            if(user){
                const compare = await hashCompare(password, user.password);
                if(compare){
                    const token = await createJWT({email,id:user._id,role:user.role});
                    return res.status(200).json({token})
                }
            }
            client.close()
        } catch (error) {
            console.log(error);
            client.close();
        }

    }
})

app.post("/add-product",authenticate,async(req,res)=>{
    const client = await mongoClient.connect(dbUrl);
    if(client){
        try {
            const db = client.db("productManager");
            const document = await db.collection("products").insertOne(req.body);
            if(document){
                res.status(200).json({
                    "message":"record updated"
                })
            }
            client.close();
        } catch (error) {
            console.log(error);
            client.close();
        }
    }
})

app.get("/all-products",async(req,res)=>{
    const client = await mongoClient.connect(dbUrl);
    if(client){
        try {
            const db = client.db("productManager");
            const document = await db.collection("products").find().toArray();
            if(document){
                res.status(200).json(document)
            }
            client.close()
        } catch (error) {
            console.log(error);
            client.close();
        }
    }
})

app.listen(process.env.PORT || 5000,()=>{
    console.log("App Started")
})