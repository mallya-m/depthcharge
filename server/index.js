const express = require('express');
const cors = require('cors');

require("dotenv").config();

const githubRoutes = require('./routes/github');
const uploadRoutes = require("./routes/upload");
const { default: axios } = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/api/github',githubRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/",(req,res)=>{
    res.json({message: "DepthCharge is alive."});
});
app.listen(PORT,() =>{
    console.log(`DepthCharge backend running on http://localhost:${PORT}`);
});
