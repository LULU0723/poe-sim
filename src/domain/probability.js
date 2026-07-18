import { normalizeAffixTags } from './tags.js';
import { getCost, getModifiers } from './tree.js';

export const calculateAffixChances = (affixList, modifiers) => {
    if (!Array.isArray(affixList)) return [];

    let prefixTotal = 0;
    let suffixTotal = 0;
    const weightedAffixes = affixList.map(affix => {
        let multiplier = 1;
        normalizeAffixTags(affix.tags).forEach(tag => {
            multiplier += modifiers[tag] || 0;
        });
        multiplier = Math.max(0, multiplier);

        const currentWeight = Math.floor((Number(affix.baseWeight) || 0) * multiplier);
        if (affix.type === 'prefix') prefixTotal += currentWeight;
        if (affix.type === 'suffix') suffixTotal += currentWeight;

        return { ...affix, currentWeight, multiplier };
    });

    return weightedAffixes.map(affix => {
        const total = affix.type === 'prefix' ? prefixTotal : suffixTotal;
        return {
            ...affix,
            chance: total === 0 ? 0 : (affix.currentWeight / total) * 100
        };
    });
};

export const evaluateSetScore = (nodeSet, affixList, preferences = {}) => {
    const evaluatedAffixes = calculateAffixChances(affixList, getModifiers(nodeSet));
    let score = 0;

    evaluatedAffixes.forEach(affix => {
        if (affix.category === 'target') score += affix.chance * 1000;
        else if (affix.category === 'acceptable') score += affix.chance * 100;
        else if (affix.category === 'unwanted') score -= affix.chance * 1000;
    });

    score -= getCost(nodeSet) * 0.1;
    ['D', 'E', 'F', 'K'].forEach(id => {
        if (nodeSet.has(id) && preferences[id]) score += preferences[id];
    });

    return score;
};
