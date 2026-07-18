import { TREE_DATA } from '../data/treeData.js';

// 基底鎖定與屬性需求偏向屬於玩家已選定的產出條件，最佳化時必須保留並預留點數。
const OPTIMIZER_REQUIRED_SELECTION_NODES = new Set([
    'G1', 'G2', 'G3', 'G4', 'G5',
    'H1', 'H2', 'H3', 'i',
    'g1', 'g2', 'g3', 'g4', 'g5', 'g6'
]);

const addNodeWithAncestors = (nodeSet, nodeId) => {
    let currentId = nodeId;
    while (currentId && TREE_DATA[currentId]) {
        nodeSet.add(currentId);
        currentId = TREE_DATA[currentId].req;
    }
};

export const getOptimizerRequiredNodes = (activeNodes) => {
    const required = new Set(['start']);
    activeNodes.forEach(nodeId => {
        if (OPTIMIZER_REQUIRED_SELECTION_NODES.has(nodeId)) addNodeWithAncestors(required, nodeId);
    });
    return required;
};
