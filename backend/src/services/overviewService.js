/**
 * Cleanly summarize README file content (no LLM, purely deterministic)
 */
exports.summarizeReadme = (content) => {
    if (!content) return null;

    // Split into lines
    const lines = content.split('\n');

    const meaningfulLines = [];
    for (let line of lines) {
        let l = line.trim();
        // Skip headers, code blocks, images, badges, pure links, empty lines
        if (l.startsWith('#')) continue;
        if (l.startsWith('```')) continue;
        if (l.startsWith('![')) continue;
        if (l.startsWith('<') && l.endsWith('>')) continue;
        if (l.startsWith('[') && l.includes('](')) {
            // Check if line is just a link/badge
            if (l.indexOf('](') < 15 && l.length < 150) continue;
        }
        if (l === '') continue;

        // Clean bold, italics, links
        l = l.replace(/\*\*/g, '').replace(/\*/g, '');
        l = l.replace(/`([^`]+)`/g, '$1');
        l = l.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

        if (l.length > 20) {
            meaningfulLines.push(l);
        }
        if (meaningfulLines.length >= 4) break; // Limit to ~4 lines
    }

    if (meaningfulLines.length === 0) return null;

    return meaningfulLines.join(' ');
};

/**
 * Build a nested file tree from flat paths
 */
exports.buildFileTree = (files) => {
    const root = { name: 'root', type: 'folder', children: [] };

    files.forEach(file => {
        const parts = file.path.split('/');
        let currentNode = root;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isFile = i === parts.length - 1;

            let childNode = currentNode.children.find(c => c.name === part);

            if (!childNode) {
                childNode = {
                    name: part,
                    type: isFile ? 'file' : 'folder',
                    ...(isFile ? { size: file.size, path: file.path } : { children: [] })
                };
                currentNode.children.push(childNode);
            }

            currentNode = childNode;
        }
    });

    // Helper to sort folders first, then files alphabetically
    const sortTree = (node) => {
        if (node.children) {
            node.children.sort((a, b) => {
                if (a.type === 'folder' && b.type === 'file') return -1;
                if (a.type === 'file' && b.type === 'folder') return 1;
                return a.name.localeCompare(b.name);
            });
            node.children.forEach(sortTree);
        }
    };

    sortTree(root);
    return root;
};
