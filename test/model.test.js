import test from 'node:test';
import assert from 'node:assert/strict';

import { EQUIPMENT_MAX_POINTS } from '../src/data/treeData.js';
import { optimizeTree } from '../src/domain/optimizer.js';
import { calculateAffixChances } from '../src/domain/probability.js';
import { normalizeAffixTags } from '../src/domain/tags.js';
import { getCost, getOptimizerRequiredNodes } from '../src/domain/tree.js';

test('既有中文標籤會正規化成天賦樹標籤', () => {
    assert.deepEqual(
        normalizeAffixTags('能力、法術、攻擊速度').sort(),
        ['屬性', '施法', '攻擊', '速度'].sort()
    );
});

test('多標籤加成採相加，前綴機率獨立計算', () => {
    const affixes = [
        { id: 'target', type: 'prefix', name: '目標', tags: '火焰、抗性', baseWeight: 100 },
        { id: 'other', type: 'prefix', name: '其他', tags: '', baseWeight: 100 }
    ];
    const [target] = calculateAffixChances(affixes, { 火焰: 3, 抗性: 3 });

    assert.equal(target.multiplier, 7);
    assert.equal(target.currentWeight, 700);
    assert.equal(target.chance, 87.5);
});

test('多標籤減益相加後最低歸零', () => {
    const [affix] = calculateAffixChances([
        { id: 'reduced', type: 'suffix', name: '減益', tags: '物理、攻擊', baseWeight: 100 }
    ], { 物理: -0.6, 攻擊: -0.6 });

    assert.equal(affix.multiplier, 0);
    assert.equal(affix.currentWeight, 0);
    assert.equal(affix.chance, 0);
});

test('最佳化必要條件會帶入基底節點與所有前置', () => {
    const required = getOptimizerRequiredNodes(new Set(['start', 'G2', 'g1']));

    assert.deepEqual(required, new Set(['start', 'a', 'G', 'G2', 'g', 'g1']));
});

test('最佳化會保留玩家選定的產出基底且不超過點數上限', () => {
    const result = optimizeTree({
        activeNodes: new Set(['start', 'a', 'G', 'G2']),
        affixes: [
            { id: 'life', type: 'prefix', name: '生命', tags: '生命', baseWeight: 100, category: 'target' },
            { id: 'mana', type: 'prefix', name: '魔力', tags: '魔力', baseWeight: 100, category: 'neutral' }
        ],
        preferences: { D: 0, E: 0, F: 0, K: 0 }
    });

    assert.equal(result.activeNodes.has('G2'), true);
    assert.equal(result.activeNodes.has('G'), true);
    assert.equal(result.activeNodes.has('a'), true);
    assert.ok(getCost(result.activeNodes) <= EQUIPMENT_MAX_POINTS);
});
