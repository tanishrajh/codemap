const path = require('path');

exports.analyze = (nodes, edges, files, cycles = []) => {
    const globalIssues = [];
    const transformedNodes = [];

    nodes.forEach(node => {
        const filePath = node.id;
        const basename = path.basename(filePath).toLowerCase();

        // 1. Dependencies and Dependents
        const dependencies = edges.filter(e => e.source === filePath).map(e => e.target);
        const dependents = edges.filter(e => e.target === filePath).map(e => e.source);

        const dependencyCount = dependencies.length;
        const dependentCount = dependents.length;

        // 2. Role Classification
        let role = 'General Module';
        if (basename.includes('app')) role = 'Main Component';
        else if (basename.includes('index') || basename.includes('main')) role = 'Entry Module';
        else if (basename.includes('api')) role = 'API Layer';
        else if (basename.includes('util')) role = 'Utility Module';

        // 3. Structural Position
        let structuralPosition = 'Unclassified';
        if (dependencyCount > 0 && dependentCount > 0) structuralPosition = 'Intermediate Node';
        else if (dependencyCount > 0 && dependentCount === 0) structuralPosition = 'Root Node';
        else if (dependencyCount === 0 && dependentCount > 0) structuralPosition = 'Leaf Node';
        else if (dependencyCount === 0 && dependentCount === 0) structuralPosition = 'Isolated Node';

        // 4. Entry Point Detection
        const isEntry = ['index.js', 'main.js', 'app.js'].includes(basename);

        // Build Overview
        const overview = {
            role,
            dependencies,
            dependents,
            dependencyCount,
            dependentCount,
            structuralPosition,
            isEntry
        };

        // 5. Issues Generation
        const nodeIssues = [];

        if (dependencyCount >= 3) {
            nodeIssues.push('High dependency file — tightly coupled to multiple modules');
        }

        if (dependentCount >= 3) {
            nodeIssues.push('High impact file — changes may affect multiple parts of the system');
        }

        if (dependencyCount === 0 && dependentCount === 0) {
            nodeIssues.push('Isolated file — not connected to the system');
        }

        if (dependentCount === 0 && !isEntry) {
            nodeIssues.push('Unused file — no other files depend on this');
        }

        if (dependencyCount === 0 && dependentCount > 0) {
            nodeIssues.push('Leaf node — does not depend on other files');
        }

        if (isEntry) {
            nodeIssues.push('Entry point of the application');
        }

        // Add to global issues collection for the dashboard
        nodeIssues.forEach(issue => {
            const severityMap = {
                'High impact file — changes may affect multiple parts of the system': 'HIGH',
                'High dependency file — tightly coupled to multiple modules': 'HIGH',
                'Isolated file — not connected to the system': 'MEDIUM',
                'Unused file — no other files depend on this': 'MEDIUM',
                'Leaf node — does not depend on other files': 'LOW',
                'Entry point of the application': 'LOW'
            };
            
            globalIssues.push({
                file: filePath,
                message: issue,
                type: issue.split(' — ')[0] || issue, // roughly derive type from issue string 
                severity: severityMap[issue] || 'LOW',
                goalRelevant: false
            });
        });

        transformedNodes.push({
            ...node,
            overview,
            issues: nodeIssues
        });
    });

    // 6. Circular Dependency Detection
    cycles.forEach(cycle => {
        const cycleStr = cycle.map(p => path.basename(p)).join(' -> ');
        globalIssues.push({
            file: cycle[0], // Attribute to the first file in the cycle
            message: `Circular dependency detected: ${cycleStr}`,
            type: 'Circular Dependency',
            severity: 'HIGH',
            goalRelevant: false,
            isCycle: true,
            cycleArr: cycle
        });
    });

    return {
        nodes: transformedNodes,
        globalIssues: globalIssues.sort((a,b) => {
            const ord = { HIGH: 0, MEDIUM: 1, LOW: 2 };
            return ord[a.severity] - ord[b.severity];
        })
    };
};

