/**
 * Strategy Service — Deterministic goal interpretation
 * Maps user goal text into a strategy type that adapts analysis output.
 */

const STRATEGIES = {
    PERFORMANCE: {
        type: 'PERFORMANCE',
        description: 'Analyzing performance bottlenecks, file complexity, and dependency hotspots',
        icon: '⚡',
        priorityIssueTypes: ['Complexity', 'Core Module Risk'],
        priorityInsightKeywords: ['complexity', 'bottleneck', 'large', 'connected', 'dependency']
    },
    STRUCTURE: {
        type: 'STRUCTURE',
        description: 'Analyzing architecture, modularity, and separation of concerns',
        icon: '🏗️',
        priorityIssueTypes: ['Coupling', 'Unused'],
        priorityInsightKeywords: ['modular', 'separation', 'layer', 'structure', 'organized']
    },
    QUALITY: {
        type: 'QUALITY',
        description: 'Analyzing code quality, maintainability, and cleanup opportunities',
        icon: '✨',
        priorityIssueTypes: ['Complexity', 'Coupling', 'Utility Complexity', 'Unused'],
        priorityInsightKeywords: ['maintainability', 'clean', 'quality', 'unused', 'utility']
    },
    GENERAL: {
        type: 'GENERAL',
        description: 'Running full-spectrum codebase analysis',
        icon: '🔍',
        priorityIssueTypes: [],
        priorityInsightKeywords: []
    }
};

const KEYWORD_MAP = {
    performance: 'PERFORMANCE',
    speed: 'PERFORMANCE',
    optimize: 'PERFORMANCE',
    fast: 'PERFORMANCE',
    slow: 'PERFORMANCE',
    bottleneck: 'PERFORMANCE',
    structure: 'STRUCTURE',
    architecture: 'STRUCTURE',
    modular: 'STRUCTURE',
    organize: 'STRUCTURE',
    layout: 'STRUCTURE',
    quality: 'QUALITY',
    clean: 'QUALITY',
    maintain: 'QUALITY',
    refactor: 'QUALITY',
    debt: 'QUALITY',
    improve: 'QUALITY',
};

exports.getStrategy = (goal) => {
    if (!goal || typeof goal !== 'string') return STRATEGIES.GENERAL;

    const normalized = goal.toLowerCase().trim();

    for (const [keyword, strategyType] of Object.entries(KEYWORD_MAP)) {
        if (normalized.includes(keyword)) {
            return STRATEGIES[strategyType];
        }
    }

    return STRATEGIES.GENERAL;
};

/**
 * Apply strategy to sort/prioritize issues and insights.
 * Does NOT remove any data — only reorders for relevance.
 */
exports.applyStrategy = (strategy, issues, insights, improvements) => {
    if (strategy.type === 'GENERAL') {
        return { issues, insights, improvements };
    }

    const priorityTypes = strategy.priorityIssueTypes;
    const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };

    const sortedIssues = [...issues].sort((a, b) => {
        const aRelevant = priorityTypes.includes(a.type) ? 0 : 1;
        const bRelevant = priorityTypes.includes(b.type) ? 0 : 1;
        if (aRelevant !== bRelevant) return aRelevant - bRelevant;
        return (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3);
    });

    // Tag relevant issues
    sortedIssues.forEach(issue => {
        issue.goalRelevant = priorityTypes.includes(issue.type);
    });

    return {
        issues: sortedIssues,
        insights,
        improvements
    };
};
