const express = require("express")
require("dotenv").config()

const app = express();

app.get("/",(req,res)=>{
    res.send("Hello from backend")
})

const PORT = process.env.PORT
app.listen(PORT,"127.0.0.1",()=>{
    console.log(`Listenong to the PORT:${PORT}\nhttp://127.0.0.1:8000/`)
})