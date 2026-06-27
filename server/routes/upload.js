
const express = require("express");
const multer = require("multer");
const AdmZip = require("adm-zip");
const { parseFiles } = require("../services/parserService");
const { buildGraph } = require("../services/graphService");
const Graph = require("../models/Graph");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/zip" || file.originalname.endsWith(".zip")) {
        cb(null, true);  // accept this file
    } else {
      cb(new Error("Only .zip files are allowed"), false); // reject
    }
  },
});

router.post("/zip", upload.single("zipfile"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No zip file uploaded" });
    }
    const sourceKey = `zip:${req.file.originalname}`;
    try {
        const cached = await Graph.findOne({ sourceKey });
        if (cached) {
            return res.json({
                success: true,
                graph: cached.graph,
                cached: true,
                parsedAt: cached.parsedAt,
            });
        }
        const zip = new AdmZip(req.file.buffer);
        const zipEntries = zip.getEntries();

        const jsFiles = zipEntries
        .filter((entry) => {
            if (entry.isDirectory) return false;
            if (entry.entryName.includes("node_modules")) return false;
            if (entry.entryName.includes("dist/") ||
                entry.entryName.includes("build/")) return false;
            return (
                entry.entryName.endsWith(".js") ||
                entry.entryName.endsWith(".jsx") ||
                entry.entryName.endsWith(".ts") ||
                entry.entryName.endsWith(".tsx")
                );
        })
        .map((entry) => ({
            path: entry.entryName,
            content: zip.readAsText(entry),
        }));
        const parsedFiles = parseFiles(jsFiles);
        const graph = buildGraph(parsedFiles);
        
        await Graph.create({ sourceKey, graph, parsedAt: new Date() });

        res.json({ success: true, graph, cached: false });

    }catch (error) {
        console.error("Zip processing error:", error.message);
        res.status(500).json({ error: "Failed to process zip file" });
    }
});

module.exports = router;