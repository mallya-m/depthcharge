const express = require('express')
const { crawlRepo } = require("../services/githubService");
const { parseFiles } = require("../services/parserService");
const { buildGraph } = require("../services/graphService");
const Graph = require("../models/Graph");

const router = express.Router();

router.post("/crawl", async (req, res) =>{
    const { repoUrl } = req.body;
    if(!repoUrl){
        return res.status(400).json({
            error : "repoUrl is required."
        });
    }
    try{
        const cached = await Graph.findOne({ sourceKey: repoUrl });
        if (cached) {
            console.log("Cache hit for:", repoUrl);
            return res.json({
                success: true,
                graph: cached.graph,
                cached: true,
                parsedAt: cached.parsedAt,
            });
        }
        console.log("Cache miss, crawling:", repoUrl);
        const files = await crawlRepo(repoUrl);
        const parsedFiles = parseFiles(files);
        const graph = buildGraph(parsedFiles);
        await Graph.create({
            sourceKey: repoUrl,
            graph,
            parsedAt: new Date(),
        });
        res.json({ success: true, graph, cached: false });

    }catch (error) {
    console.error("Crawl error:", error.message);
    res.status(500).json({ error: "Failed to crawl repo" });
    }
})

module.exports = router ;