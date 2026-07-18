import { EQUIPMENT_MAX_POINTS, TREE_DATA } from '../data/treeData.js';
import { calculateAffixChances, evaluateSetScore } from './probability.js';
import { getCost, getModifiers, getOptimizerRequiredNodes, hasMutex } from './tree.js';

const GROUP_OPTIONS = {
    A: [null, 'A1', 'A2', 'A3', 'A4', 'A5'],
    B: [null, 'B1', 'B2', 'B3', 'B4'],
    C: [null, 'C1', 'C2', 'C3', 'C4', 'C5'],
    L: [null, 'L1', 'L2', 'L3', 'L4', 'L5'],
    M: [null, 'M1', 'M2', 'M3', 'M4'],
    N: [null, 'N1', 'N2', 'N3', 'N4', 'N5']
};

const buildFunctionCombinations = (preferences) => {
    const preferredIds = Object.entries(preferences)
        .filter(([, value]) => value > 0)
        .map(([id]) => id);
    const combinations = [[]];

    for (const id of preferredIds) {
        combinations.push(...combinations.map(combo => [...combo, id]));
    }

    return { preferredIds, combinations };
};

const buildCandidate = (requiredNodes, choices, functionNodes) => {
    const { a, b, c, l, m, n } = choices;
    const useD = functionNodes.includes('D');
    const useE = functionNodes.includes('E');
    const useF = functionNodes.includes('F');
    const useK = functionNodes.includes('K');
    const candidate = new Set(requiredNodes);

    if (a || b || c || useD || useE) ['a', 'b', 'c'].forEach(id => candidate.add(id));
    if (useF) ['a', 'b', 'F'].forEach(id => candidate.add(id));
    if (useD) candidate.add('D');
    if (useE) candidate.add('E');
    if (a) ['d', 'A', a].forEach(id => candidate.add(id));
    if (b) ['e', 'B', b].forEach(id => candidate.add(id));
    if (c) ['f', 'C', c].forEach(id => candidate.add(id));
    if (l || m || n || useK) ['g', 'j'].forEach(id => candidate.add(id));
    if (useK) candidate.add('K');
    if (l) ['k', 'L', l].forEach(id => candidate.add(id));
    if (m) ['m', 'M', m].forEach(id => candidate.add(id));
    if (n) ['n', 'N', n].forEach(id => candidate.add(id));

    return candidate;
};

const fillSelectedUtilityNodes = (bestSet, activeNodes) => {
    const finalSet = new Set(bestSet);
    let currentCost = getCost(finalSet);
    const utilityNodes = [...activeNodes].filter(id => !finalSet.has(id));
    let addedAny = true;

    while (addedAny) {
        addedAny = false;
        for (const id of utilityNodes) {
            if (finalSet.has(id)) continue;
            const node = TREE_DATA[id];
            if (!node || (node.req && !finalSet.has(node.req))) continue;
            if (node.mutex && hasMutex(finalSet, node.mutex)) continue;
            if (currentCost + node.cost <= EQUIPMENT_MAX_POINTS) {
                finalSet.add(id);
                currentCost += node.cost;
                addedAny = true;
            }
        }
    }

    return finalSet;
};

const buildWarnings = (finalSet, affixes, preferences, preferredIds) => {
    const warnings = [];
    const resultAffixes = calculateAffixChances(affixes, getModifiers(finalSet));

    resultAffixes
        .filter(affix => affix.category === 'target' && affix.chance < 10)
        .forEach(affix => warnings.push({
            type: 'low_chance',
            msg: `「${affix.name}」目標詞機率偏低（${affix.chance.toFixed(1)}%），可能難以達成`
        }));

    const labels = { D: 'D (破裂)', E: 'E (連線+50)', F: 'F (隨機品質)', K: 'K (移最低詞)' };
    preferredIds.forEach(id => {
        if (preferences[id] > 0 && !finalSet.has(id)) {
            warnings.push({
                type: 'node_skipped',
                msg: `${labels[id]} 因點數不足無法納入，建議降低其他偏好或減少目標詞`
            });
        }
    });

    return warnings;
};

export const optimizeTree = ({ activeNodes, affixes, preferences }) => {
    const requiredNodes = getOptimizerRequiredNodes(activeNodes);
    const { preferredIds, combinations } = buildFunctionCombinations(preferences);
    let bestScore = -Infinity;
    let bestSet = new Set(requiredNodes);

    for (const a of GROUP_OPTIONS.A) for (const b of GROUP_OPTIONS.B) for (const c of GROUP_OPTIONS.C)
    for (const l of GROUP_OPTIONS.L) for (const m of GROUP_OPTIONS.M) for (const n of GROUP_OPTIONS.N)
    for (const functionNodes of combinations) {
        const candidate = buildCandidate(requiredNodes, { a, b, c, l, m, n }, functionNodes);
        if (getCost(candidate) > EQUIPMENT_MAX_POINTS) continue;

        const score = evaluateSetScore(candidate, affixes, preferences);
        if (score > bestScore) {
            bestScore = score;
            bestSet = candidate;
        }
    }

    const finalSet = fillSelectedUtilityNodes(bestSet, activeNodes);
    return {
        activeNodes: finalSet,
        warnings: buildWarnings(finalSet, affixes, preferences, preferredIds)
    };
};
