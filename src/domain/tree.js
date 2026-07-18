import { TREE_DATA } from '../data/treeData.js';

export const getDescendants = (nodeId) => {
    const descendants = [];
    const node = TREE_DATA[nodeId];

    for (const childId of node?.children || []) {
        descendants.push(childId, ...getDescendants(childId));
    }

    return descendants;
};

export const getCost = (nodeSet) => {
    if (!nodeSet) return 0;

    let total = 0;
    nodeSet.forEach(id => {
        const cost = TREE_DATA[id]?.cost;
        if (typeof cost === 'number') total += cost;
    });
    return total;
};

export const hasMutex = (nodeSet, mutexName) => {
    if (!nodeSet) return false;
    return [...nodeSet].some(id => TREE_DATA[id]?.mutex === mutexName);
};

export const getModifiers = (nodeSet) => {
    const modifiers = {};
    if (!nodeSet) return modifiers;

    nodeSet.forEach(id => {
        for (const [tag, value] of Object.entries(TREE_DATA[id]?.mods || {})) {
            modifiers[tag] = (modifiers[tag] || 0) + value;
        }
    });
    return modifiers;
};

export { getOptimizerRequiredNodes } from './treeSelection.js';
