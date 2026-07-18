// ==========================================
// 1. 內建詞綴資料庫目錄
// ==========================================
export const BUILT_IN_PRESETS = {
    'Helmet': {
        name: '⛑️ 頭盔 (Helmet)', treeBase: 'G2', isArmour: true,
        attributes: {
            'str': { name: '💪 純力 (護甲)', file: '/presets/helmet_str.json' },
            'dex': { name: '🦅 純敏 (閃避)', file: '/presets/helmet_dex.json' },
            'int': { name: '🧠 純智 (能盾)', file: '/presets/helmet_int.json' },
            'str_dex': { name: '⚔️ 力敏 (護甲/閃避)', file: '/presets/helmet_str_dex.json' },
            'str_int': { name: '🛡️ 力智 (護甲/能盾)', file: '/presets/helmet_str_int.json' },
            'dex_int': { name: '🌀 敏智 (閃避/能盾)', file: '/presets/helmet_dex_int.json' }
        }
    },
    'BodyArmour': {
        name: '🦺 胸甲 (Body Armour)', treeBase: 'G3', isArmour: true,
        attributes: {
            'str': { name: '💪 純力 (護甲)', file: '/presets/body_armour_str.json' },
            'dex': { name: '🦅 純敏 (閃避)', file: '/presets/body_armour_dex.json' },
            'int': { name: '🧠 純智 (能盾)', file: '/presets/body_armour_int.json' },
            'str_dex': { name: '⚔️ 力敏 (護甲/閃避)', file: '/presets/body_armour_str_dex.json' },
            'str_int': { name: '🛡️ 力智 (護甲/能盾)', file: '/presets/body_armour_str_int.json' },
            'dex_int': { name: '🌀 敏智 (閃避/能盾)', file: '/presets/body_armour_dex_int.json' }
        }
    },
    'Gloves': {
        name: '🧤 手套 (Gloves)', treeBase: 'G4', isArmour: true,
        attributes: {
            'str': { name: '💪 純力 (護甲)', file: '/presets/gloves_str.json' },
            'dex': { name: '🦅 純敏 (閃避)', file: '/presets/gloves_dex.json' },
            'int': { name: '🧠 純智 (能盾)', file: '/presets/gloves_int.json' },
            'str_dex': { name: '⚔️ 力敏 (護甲/閃避)', file: '/presets/gloves_str_dex.json' },
            'str_int': { name: '🛡️ 力智 (護甲/能盾)', file: '/presets/gloves_str_int.json' },
            'dex_int': { name: '🌀 敏智 (閃避/能盾)', file: '/presets/gloves_dex_int.json' }
        }
    },
    'Boots': {
        name: '🥾 鞋子 (Boots)', treeBase: 'G5', isArmour: true,
        attributes: {
            'str': { name: '💪 純力 (護甲)', file: '/presets/boots_str.json' },
            'dex': { name: '🦅 純敏 (閃避)', file: '/presets/boots_dex.json' },
            'int': { name: '🧠 純智 (能盾)', file: '/presets/boots_int.json' },
            'str_dex': { name: '⚔️ 力敏 (護甲/閃避)', file: '/presets/boots_str_dex.json' },
            'str_int': { name: '🛡️ 力智 (護甲/能盾)', file: '/presets/boots_str_int.json' },
            'dex_int': { name: '🌀 敏智 (閃避/能盾)', file: '/presets/boots_dex_int.json' }
        }
    },
    'Amulet': {
        name: '📿 護身符 (Amulet)', treeBase: 'H1', isArmour: false,
        attributes: { 'none': { name: '通用屬性 (無需求)', file: '/presets/amulet_general.json' } }
    },
    'Ring': {
        name: '💍 戒指 (Ring)', treeBase: 'H2', isArmour: false,
        attributes: { 'none': { name: '通用屬性 (無需求)', file: '/presets/ring_general.json' } }
    },
    'Belt': {
        name: '🧵 腰帶 (Belt)', treeBase: 'H3', isArmour: false,
        attributes: { 'none': { name: '通用屬性 (無需求)', file: '/presets/belt_general.json' } }
    },
    'Shield': {
        name: '🛡️ 盾牌 (Shield)', treeBase: 'G1', isArmour: true,
        attributes: {
            'str':     { name: '💪 純力 (護甲)',       file: '/presets/shield_str.json' },
            'dex':     { name: '🦅 純敏 (閃避)',       file: '/presets/shield_dex.json' },
            'int':     { name: '🧠 純智 (能盾)',       file: '/presets/shield_int.json' },
            'str_dex': { name: '⚔️ 力敏 (護甲/閃避)', file: '/presets/shield_str_dex.json' },
            'str_int': { name: '🛡️ 力智 (護甲/能盾)', file: '/presets/shield_str_int.json' },
            'dex_int': { name: '🌀 敏智 (閃避/能盾)', file: '/presets/shield_dex_int.json' }
        }
    },
    'Jewel': {
        name: '💎 珠寶 (Jewel)', treeBase: 'i', isArmour: false,
        attributes: {
            'crimson': { name: '🔴 赤紅 (偏力量/近戰)', file: '/presets/jewel_crimson.json' },
            'cobalt': { name: '🔵 鈷藍 (偏智力/法術)', file: '/presets/jewel_cobalt.json' },
            'viridian': { name: '🟢 翠綠 (偏敏捷/弓箭)', file: '/presets/jewel_viridian.json' }
        }
    }
};

// ==========================================
// 2. 基底演算法策略庫 (Advisor Strategies)
// ==========================================
export const BASE_STRATEGIES = {
    'str': {
        desc: '純力底極易被力智/力敏稀釋。最佳策略是砍斷智敏來源。',
        cp: { nodes: ['g1', 'g4'], cost: 2, label: '-85% 智敏' },
        max: { nodes: ['g1', 'g4', 'g6'], cost: 3, label: '-85% 智敏, +300% 力' }
    },
    'dex': {
        desc: '純敏底極易被敏智/力敏稀釋。最佳策略是砍斷力智來源。',
        cp: { nodes: ['g1', 'g5'], cost: 2, label: '-85% 力智' },
        max: { nodes: ['g1', 'g5', 'g3'], cost: 3, label: '-85% 力智, +300% 敏' }
    },
    'int': {
        desc: '純智底極易被力智/敏智稀釋。最佳策略是砍斷力敏來源。',
        cp: { nodes: ['g4', 'g5'], cost: 2, label: '-85% 力敏' },
        max: { nodes: ['g4', 'g5', 'g2'], cost: 3, label: '-85% 力敏, +300% 智' }
    },
    'str_dex': {
        desc: '力敏複合底。只需斷絕智力來源即可大幅提升機率。',
        cp: { nodes: ['g1'], cost: 1, label: '-85% 智' },
        max: { nodes: ['g1', 'g6', 'g3'], cost: 3, label: '-85% 智, +300% 力敏' }
    },
    'str_int': {
        desc: '力智複合底。只需斷絕敏捷來源即可大幅提升機率。',
        cp: { nodes: ['g4'], cost: 1, label: '-85% 敏' },
        max: { nodes: ['g4', 'g6', 'g2'], cost: 3, label: '-85% 敏, +300% 力智' }
    },
    'dex_int': {
        desc: '敏智複合底。只需斷絕力量來源即可大幅提升機率。',
        cp: { nodes: ['g5'], cost: 1, label: '-85% 力' },
        max: { nodes: ['g5', 'g3', 'g2'], cost: 3, label: '-85% 力, +300% 敏智' }
    }
};
