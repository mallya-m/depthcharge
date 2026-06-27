const express = require('express')
const { crawlRepo } = require("../services/githubService");
const { parseFiles } = require("../services/parserService");
const { buildGraph } = require("../services/graphService");
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
        console.log("Files crawled:", files.length);
        console.log("Parsed files:", parsedFiles.length);
        console.log("Sample parsed file:", JSON.stringify(parsedFiles[0], null, 2));
        const graph = buildGraph(parsedFiles);
        res.json({ success: true, graph });

    }catch (error) {
    console.error("Crawl error:", error.message);
    res.status(500).json({ error: "Failed to crawl repo" });
    }
})

module.exports = router ;