const path = require('path');

exports.buildGraph = (files) => {
    let nodesMap = new Map();
    let edges = [];
    let inDegree = new Map();
    let outDegree = new Map();

    files.forEach(f => {
        nodesMap.set(f.path, f);
        inDegree.set(f.path, 0);
        outDegree.set(f.path, 0);
    });

    const filePaths = Array.from(nodesMap.keys());

    const importRegex = /import\s+(?:.|\n)*?from\s+['"](\.\.?\/[^'"]+)['"]/g;
    const requireRegex = /require\(['"](\.\.?\/[^'"]+)['"]\)/g;

    files.forEach(file => {
        if (!file.content) return;

        let matches = [];
        let match;

        while ((match = importRegex.exec(file.content)) !== null) matches.push(match[1]);
        while ((match = requireRegex.exec(file.content)) !== null) matches.push(match[1]);

        matches.forEach(rawImport => {
            let sourceDir = file.path.includes('/') ? file.path.substring(0, file.path.lastIndexOf('/')) : '';
            let rawNormalized = path.normalize(sourceDir + '/' + rawImport).replace(/\\/g, '/');
            if (rawNormalized.startsWith('/')) rawNormalized = rawNormalized.substring(1);

            let resolvedTarget = null;
            if (nodesMap.has(rawNormalized)) {
                resolvedTarget = rawNormalized;
            } else {
                const exts = ['.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.ts', '/index.jsx', '/index.tsx'];
                for (let ext of exts) {
                    if (nodesMap.has(rawNormalized + ext)) {
                        resolvedTarget = rawNormalized + ext;
                        break;
                    }
                }
            }

            if (resolvedTarget && resolvedTarget !== file.path) {
                edges.push({ source: file.path, target: resolvedTarget });
                inDegree.set(resolvedTarget, (inDegree.get(resolvedTarget) || 0) + 1);
                outDegree.set(file.path, (outDegree.get(file.path) || 0) + 1);
            }
        });
    });

    let scores = [];
    for (const [nodePath, degree] of inDegree.entries()) {
        scores.push({
            file: nodePath,
            importanceScore: degree,
            inDegree: degree,
            outDegree: outDegree.get(nodePath) || 0
        });
    }

    scores.sort((a, b) => b.importanceScore - a.importanceScore);
    const coreModules = scores.filter(s => s.importanceScore > 0).slice(0, 10);

    const totalNodes = scores.length;
    const top20Count = Math.max(1, Math.ceil(totalNodes * 0.2));
    const next30Count = Math.max(1, Math.ceil(totalNodes * 0.3));

    scores.forEach((s, index) => {
        if (s.importanceScore === 0) {
            s.importanceLevel = 'LOW';
        } else if (index < top20Count) {
            s.importanceLevel = 'HIGH';
        } else if (index < top20Count + next30Count) {
            s.importanceLevel = 'MEDIUM';
        } else {
            s.importanceLevel = 'LOW';
        }
    });

    const uniqueEdges = [];
    const seenEdges = new Set();
    edges.forEach(e => {
        const sig = `${e.source}->${e.target}`;
        if (!seenEdges.has(sig)) {
            seenEdges.add(sig);
            uniqueEdges.push(e);
        }
    });

    const graph = {
        nodes: filePaths.map(p => {
            const fileData = files.find(f => f.path === p);
            const stats = scores.find(s => s.file === p);
            return {
                id: p,
                importanceLevel: stats.importanceLevel,
                importanceScore: stats.importanceScore,
                inDegree: stats.inDegree,
                outDegree: stats.outDegree,
                content: fileData?.content,
                extension: fileData?.extension
            };
        }),
        edges: uniqueEdges,
        coreModules,
        cycles: findCycles(filePaths, uniqueEdges)
    };

    return graph;
};

function findCycles(nodeIds, edges) {
    const adj = new Map();
    nodeIds.forEach(id => adj.set(id, []));
    edges.forEach(e => {
        if (adj.has(e.source)) adj.get(e.source).push(e.target);
    });

    const cycles = [];
    const visited = new Set();
    const stack = new Set();
    const path = [];

    function dfs(node) {
        visited.add(node);
        stack.add(node);
        path.push(node);

        const neighbors = adj.get(node) || [];
        for (const neighbor of neighbors) {
            if (stack.has(neighbor)) {
                const cycleStartIdx = path.indexOf(neighbor);
                if (cycleStartIdx !== -1) {
                    cycles.push([...path.slice(cycleStartIdx), neighbor]);
                }
            } else if (!visited.has(neighbor)) {
                dfs(neighbor);
            }
        }

        stack.delete(node);
        path.pop();
    }

    nodeIds.forEach(id => {
        if (!visited.has(id)) dfs(id);
    });

    return cycles;
}
