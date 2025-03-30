//importing all required express modules after instalation
const express = require("express")
const mongoose = require("mongoose")
require("dotenv").config()
const User=require("./models/User")
const Product = require("./models/Product");
const bcrypt = require("bcrypt")

//Middleware
const PORT=3000
const app=express()
app.use(express.json())

//connecting to the database using mongoose
mongoose.connect(process.env.MONGO_URL).then(
  () =>console.log("DB connected successfully....")
).catch(
    (err)=>console.log(err)
  )

  // API landing page http://localhost:3000/
app.get('/',async(req, res)=>{
  try{
    res.send("<h1 align=center >Welcome to the home page</h1>")

  }
  catch(err){
    console.log(err)
  }
})
// API Registration page http://localhost:3000/register
app.post('/register',async(req, res)=>{
  const {username, email, password} = req.body
  try{
   const hashPassword = await bcrypt.hash(password, 10) 
   const newUser = new User({username,email,password:hashPassword})
   await newUser.save()
   console.log(" New User is registered successfully")
   res.json({message:'User created.......'})
  }
  catch(err){
    console.log(err)
  }
})
  
//API Login page http://localhost:3000/login
app.post('/login',async(req, res)=>{
  const {email, password} = req.body
  try{
    const user = await User.findOne({email});
    if(!user || !(await bcrypt.compare(password, user.password)))
      {
      return res.status(400).json({message:'Invalid credentials'});
    }
    else{
      res.json({message:'Login successfully',username:user.username});
    }
  }
  catch(err){
    console.log(err)
  }
})

const multer = require("multer");
const path = require("path");

// Set up storage engine
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// Initialize upload
const upload = multer({ storage });

// API to add a new product with an image - http://localhost:3000/add-product
app.post("/add-product", upload.single("image"), async (req, res) => {
  const { name, description, price, category, stock } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!image) {
    return res.status(400).json({ message: "Image is required" });
  }

  try {
    const newProduct = new Product({ name, description, price, category, stock, image });
    await newProduct.save();
    console.log("New Product is added successfully");
    res.json({ message: "Product added successfully", product: newProduct });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.use("/uploads", express.static("uploads"));

//Server running and testing
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Server is running on port : " +PORT);
  }
});