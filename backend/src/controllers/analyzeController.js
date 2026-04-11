const repoService = require('../services/repoService');
const fileService = require('../services/fileService');
const graphService = require('../services/graphService');
const classificationService = require('../services/classificationService');
const insightService = require('../services/insightService');
const overviewService = require('../services/overviewService');

exports.analyze = async (req, res) => {
    console.log('Received analysis request.');
    const { type } = req.body;

    try {
        // Phase 1: Ingestion
        let extractedPath = '';

        if (type === 'local') {
            const file = req.file;
            console.log('[Ingester] Mode: Local Upload');
            if (!file) {
                return res.status(400).json({ error: "No file uploaded for local mode." });
            }
            extractedPath = await repoService.extractLocalZip(file.path);

        } else if (type === 'github') {
            const { repoUrl } = req.body;
            console.log('[Ingester] Mode: GitHub Repo:', repoUrl);
            if (!repoUrl) {
                return res.status(400).json({ error: "No repository URL provided." });
            }
            extractedPath = await repoService.downloadAndExtractGithub(repoUrl);

        } else {
            return res.status(400).json({ error: "Invalid type. Must be 'github' or 'local'." });
        }

        // Phase 2: File Traversal
        console.log('[Parser] Traversing files...');
        const traverseResult = fileService.traverseDirectory(extractedPath);
        const files = traverseResult.files || [];
        const readme = traverseResult.readme;

        // Phase 3: Graph + Classification
        console.log('[Analyzer] Building dependency graph...');
        const graphData = graphService.buildGraph(files);
        graphData.nodes = classificationService.classifyNodes(graphData.nodes);

        // Phase 4: Insight Engine
        console.log('[Critic] Computing rule-based insights...');
        const insightData = insightService.analyze(graphData.nodes, graphData.edges, files, graphData.cycles);

        console.log('[Reporter] Compiling final report...');

        const projectOverview = {
            summary: {
                totalFiles: files.length,
                totalDependencies: graphData.edges.length,
                coreModulesCount: graphData.coreModules.length,
            },
            readmeContent: readme,
            readmeSummary: overviewService.summarizeReadme(readme),
            fileTree: overviewService.buildFileTree(files)
        };

        res.json({
            message: "Analysis complete",
            totalFiles: files.length,
            nodes: insightData.nodes,
            edges: graphData.edges,
            issues: insightData.globalIssues,
            projectOverview,
        });

    } catch (err) {
        console.error("Error during analysis:", err.message || err);
        const errMsg = err.message || "An error occurred during repo parsing.";
        res.status(500).json({ error: errMsg });
    }
};
