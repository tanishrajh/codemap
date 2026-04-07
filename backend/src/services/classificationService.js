const path = require('path');

exports.classifyNodes = (nodes) => {
    return nodes.map(node => {
        const filePath = node.id;
        const lowerPath = filePath.toLowerCase();
        const basename = path.basename(lowerPath);
        const parts = lowerPath.split('/');

        let category = 'Core Logic'; // Default fallback

        // 1. Filename-based exact rules (Highest priority)
        const coreExact = ['app.js', 'app.jsx', 'app.ts', 'app.tsx', 'main.js', 'main.jsx', 'main.ts', 'main.tsx', 'index.js', 'index.jsx', 'index.ts', 'index.tsx'];
        if (coreExact.includes(basename)) {
            category = 'Core Logic';
        } else if (basename === 'config.json' || basename === '.env' || basename.includes('config.js') || basename.includes('config.ts')) {
            category = 'Config';
        } else {
            // 2. Folder-based rules
            let foundFolderMatch = false;
            for (const part of parts) {
                if (['components', 'pages', 'views'].includes(part)) {
                    category = 'UI';
                    foundFolderMatch = true;
                    break;
                }
                if (['api', 'routes', 'controllers', 'services'].includes(part)) {
                    category = 'Backend';
                    foundFolderMatch = true;
                    break;
                }
                if (['utils', 'helpers'].includes(part)) {
                    category = 'Utility';
                    foundFolderMatch = true;
                    break;
                }
                if (['config'].includes(part)) {
                    category = 'Config';
                    foundFolderMatch = true;
                    break;
                }
                if (['data'].includes(part)) {
                    category = 'Data';
                    foundFolderMatch = true;
                    break;
                }
            }

            // 3. Extension-based fallback
            if (!foundFolderMatch) {
                if (basename.endsWith('.json')) {
                    category = 'Data';
                } else if (basename.endsWith('.js') || basename.endsWith('.ts') || basename.endsWith('.jsx') || basename.endsWith('.tsx') || basename.endsWith('.py')) {
                    category = 'Core Logic';
                }
            }
        }

        return {
            ...node,
            category
        };
    });
};
