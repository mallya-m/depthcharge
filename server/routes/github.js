const express = require('express')
const { crawlRepo } = require("../services/githubService");
const { parseFiles } = require("../services/parserService");
const router = express.Router();

router.post("/crawl", async (req, res) =>{
    const { repoUrl } = req.body;
    if(!repoUrl){
        return res.status(400).json({
            error : "repoUrl is required."
        });
    }
    try{
        const files = await crawlRepo(repoUrl);
        const parsedFiles = parseFiles(files);
        res.json({
            sucess: true,
            fileCount: files.length,
            files,
        });
    }catch (error) {
    console.error("Crawl error:", error.message);
    res.status(500).json({ error: "Failed to crawl repo" });
    }
})

module.exports = router ;