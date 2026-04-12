import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2, ShieldAlert, GitMerge, Settings2, Info, Wand2, Upload, Download, Map as MapIcon, List, Target, FolderOpen, Unlock, Lock, RotateCcw, ZoomIn, ZoomOut, Database, CheckSquare, Zap, Target as TargetIcon, GripVertical } from 'lucide-react';

// ==========================================
// 1. 內建詞綴資料庫目錄
// ==========================================
const BUILT_IN_PRESETS = {
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
const BASE_STRATEGIES = {
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

// --- 天賦樹靜態數據 ---
const TREE_DATA = {
    'start': { name: '起點', cost: 0, children: ['a', 'g'], desc: '天賦樹起始節點', x: 80.8, y: 81.5 },
    'a': { name: 'a (連線×10取最佳)', cost: 1, req: 'start', children: ['b', 'G'], desc: '插槽與連線多擲10次，保留最佳結果', x: 82.2, y: 61.5 },
    'G': { name: 'G (防具機率×6)', cost: 1, req: 'a', children: ['G1', 'G2', 'G3', 'G4', 'G5'], desc: '掉落防具的機率+500%（increased，約×6）', x: 90.9, y: 36.6 },
    'G1': { name: 'G1 (鎖定護盾)', cost: 1, req: 'G', mutex: 'G', desc: '掉落鎖定為護盾（機率+5000%）', x: 83.8, y: 33.4 },
    'G2': { name: 'G2 (鎖定頭盔)', cost: 1, req: 'G', mutex: 'G', desc: '掉落鎖定為頭盔（機率+5000%）', x: 88.3, y: 27.3 },
    'G3': { name: 'G3 (鎖定胸甲)', cost: 1, req: 'G', mutex: 'G', desc: '掉落鎖定為胸甲（機率+5000%）', x: 96.3, y: 30.8 },
    'G4': { name: 'G4 (鎖定手套)', cost: 1, req: 'G', mutex: 'G', desc: '掉落鎖定為手套（機率+5000%）', x: 96.5, y: 40.5 },
    'G5': { name: 'G5 (鎖定鞋子)', cost: 1, req: 'G', mutex: 'G', desc: '掉落鎖定為鞋子（機率+5000%）', x: 92.2, y: 46.4 },
    'b': { name: 'b (詞綴評級+20)', cost: 1, req: 'a', children: ['c', 'F'], desc: '詞綴等級評分+20，有助於出現更高階詞綴', x: 68.6, y: 55.0 },
    'F': { name: 'F (隨機品質)', cost: 1, req: 'b', desc: '護甲掉落時品質為隨機數值（而非固定0%）', x: 64.8, y: 41.3 },
    'c': { name: 'c (25%機率物等+1)', cost: 1, req: 'b', children: ['d', 'e', 'f', 'D', 'E'], desc: '25%機率使裝備物品等級+1', x: 55.7, y: 44.2 },
    'D': { name: 'D (33%機率破裂)', cost: 1, req: 'c', desc: '33%機率使裝備獲得破裂詞綴（鎖定一個詞綴）', x: 33.2, y: 32.5 },
    'E': { name: 'E (連線×50取最佳)', cost: 1, req: 'c', desc: '插槽與連線多擲50次，保留最佳結果', x: 48.9, y: 19.6 },
    'd': { name: 'd (50%機率額外掉落)', cost: 1, req: 'c', children: ['A'], desc: '50%機率額外掉落一件裝備', x: 30.6, y: 41.0 },
    'A': { name: 'A (棄絕之魂)', cost: 0, req: 'd', children: ['A1', 'A2', 'A3', 'A4', 'A5'], desc: '解鎖棄絕系列（減少指定類別詞綴出現機率）', x: 18.2, y: 35.0 },
    'A1': { name: 'A1 (-60%防禦詞綴)', cost: 1, req: 'A', mutex: 'A', mods: { '防禦': -0.6 }, desc: '防禦類詞綴機率-60%（reduced，與其他reduced相加）', x: 24.1, y: 40.4 },
    'A2': { name: 'A2 (-60%屬性詞綴)', cost: 1, req: 'A', mutex: 'A', mods: { '屬性': -0.6 }, desc: '屬性類詞綴機率-60%（reduced，與其他reduced相加）', x: 15.1, y: 41.5 },
    'A3': { name: 'A3 (-60%抗性詞綴)', cost: 1, req: 'A', mutex: 'A', mods: { '抗性': -0.6 }, desc: '抗性類詞綴機率-60%（reduced，與其他reduced相加）', x: 10.8, y: 34.9 },
    'A4': { name: 'A4 (-60%魔力詞綴)', cost: 1, req: 'A', mutex: 'A', mods: { '魔力': -0.6 }, desc: '魔力類詞綴機率-60%（reduced，與其他reduced相加）', x: 13.9, y: 28.1 },
    'A5': { name: 'A5 (-60%生命詞綴)', cost: 1, req: 'A', mutex: 'A', mods: { '生命': -0.6 }, desc: '生命類詞綴機率-60%（reduced，與其他reduced相加）', x: 21.8, y: 28.3 },
    'e': { name: 'e (數值重骰取最佳)', cost: 1, req: 'c', children: ['B'], desc: '詞綴數值額外重骰一次，保留較高結果（不影響詞綴種類）', x: 43.6, y: 30.0 },
    'B': { name: 'B (棄絕熱誠)', cost: 0, req: 'e', children: ['B1', 'B2', 'B3', 'B4'], desc: '解鎖棄絕系列（減少指定類別詞綴出現機率）', x: 37.9, y: 16.5 },
    'B1': { name: 'B1 (-60%速度詞綴)', cost: 1, req: 'B', mutex: 'B', mods: { '速度': -0.6 }, desc: '速度類詞綴機率-60%（reduced，與其他reduced相加）', x: 31.4, y: 21.9 },
    'B2': { name: 'B2 (-60%施法詞綴)', cost: 1, req: 'B', mutex: 'B', mods: { '施法': -0.6 }, desc: '施法類詞綴機率-60%（reduced，與其他reduced相加）', x: 32.5, y: 13.5 },
    'B3': { name: 'B3 (-60%攻擊詞綴)', cost: 1, req: 'B', mutex: 'B', mods: { '攻擊': -0.6 }, desc: '攻擊類詞綴機率-60%（reduced，與其他reduced相加）', x: 40.7, y: 10.4 },
    'B4': { name: 'B4 (-60%暴擊詞綴)', cost: 1, req: 'B', mutex: 'B', mods: { '暴擊': -0.6 }, desc: '暴擊類詞綴機率-60%（reduced，與其他reduced相加）', x: 44.0, y: 19.0 },
    'f': { name: 'f (詞綴評級+20)', cost: 1, req: 'c', children: ['C'], desc: '詞綴等級評分+20，有助於出現更高階詞綴', x: 59.5, y: 28.6 },
    'C': { name: 'C (棄絕技術)', cost: 0, req: 'f', children: ['C1', 'C2', 'C3', 'C4', 'C5'], desc: '解鎖棄絕系列（減少指定類別詞綴出現機率）', x: 69.0, y: 14.0 },
    'C1': { name: 'C1 (-60%閃電詞綴)', cost: 1, req: 'C', mutex: 'C', mods: { '閃電': -0.6 }, desc: '閃電類詞綴機率-60%（reduced，與其他reduced相加）', x: 62.2, y: 14.4 },
    'C2': { name: 'C2 (-60%冰冷詞綴)', cost: 1, req: 'C', mutex: 'C', mods: { '冰冷': -0.6 }, desc: '冰冷類詞綴機率-60%（reduced，與其他reduced相加）', x: 65.0, y: 7.4 },
    'C3': { name: 'C3 (-60%火焰詞綴)', cost: 1, req: 'C', mutex: 'C', mods: { '火焰': -0.6 }, desc: '火焰類詞綴機率-60%（reduced，與其他reduced相加）', x: 73.1, y: 7.4 },
    'C4': { name: 'C4 (-60%物理詞綴)', cost: 1, req: 'C', mutex: 'C', mods: { '物理': -0.6 }, desc: '物理類詞綴機率-60%（reduced，與其他reduced相加）', x: 75.7, y: 14.2 },
    'C5': { name: 'C5 (-60%混沌詞綴)', cost: 1, req: 'C', mutex: 'C', mods: { '混沌': -0.6 }, desc: '混沌類詞綴機率-60%（reduced，與其他reduced相加）', x: 72.6, y: 20.8 },
    'g': { name: 'g (25%機率額外掉落)', cost: 1, req: 'start', children: ['j', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'h'], desc: '25%機率額外掉落一件裝備', x: 63.8, y: 71.7 },
    'g1': { name: 'g1 (×0.15 智力需求基底)', cost: 1, req: 'g', mods: { '智力': -0.85 }, desc: '智力需求裝備掉落機率×0.15（less，相乘計算，待驗證）', x: 58.5, y: 65.2 },
    'g2': { name: 'g2 (×4 智力需求基底)', cost: 1, req: 'g', mods: { '智力': 3.0 }, desc: '智力需求裝備掉落機率×4（more，相乘計算，待驗證）', x: 68.6, y: 62.9 },
    'g3': { name: 'g3 (×4 敏捷需求基底)', cost: 1, req: 'g', mods: { '敏捷': 3.0 }, desc: '敏捷需求裝備掉落機率×4（more，相乘計算，待驗證）', x: 72.5, y: 71.4 },
    'g4': { name: 'g4 (×0.15 敏捷需求基底)', cost: 1, req: 'g', mods: { '敏捷': -0.85 }, desc: '敏捷需求裝備掉落機率×0.15（less，相乘計算，待驗證）', x: 69.1, y: 79.7 },
    'g5': { name: 'g5 (×0.15 力量需求基底)', cost: 1, req: 'g', mods: { '力量': -0.85 }, desc: '力量需求裝備掉落機率×0.15（less，相乘計算，待驗證）', x: 60.6, y: 79.5 },
    'g6': { name: 'g6 (×4 力量需求基底)', cost: 1, req: 'g', mods: { '力量': 3.0 }, desc: '力量需求裝備掉落機率×4（more，相乘計算，待驗證）', x: 56.3, y: 72.3 },
    'h': { name: 'h (50%機率額外掉落)', cost: 1, req: 'g', children: ['H', 'i'], desc: '50%機率額外掉落一件裝備', x: 50.7, y: 79.3 },
    'i': { name: 'i (鎖定珠寶)', cost: 1, req: 'h', desc: '掉落鎖定為珠寶（機率+5000%）', x: 39.1, y: 74.9 },
    'H': { name: 'H (飾品機率×6)', cost: 1, req: 'h', children: ['H1', 'H2', 'H3'], desc: '掉落飾品的機率+500%（increased，約×6）', x: 43.7, y: 87.5 },
    'H1': { name: 'H1 (鎖定護身符)', cost: 1, req: 'H', mutex: 'H', desc: '掉落鎖定為護身符（機率+5000%）', x: 37.8, y: 81.6 },
    'H2': { name: 'H2 (鎖定戒指)', cost: 1, req: 'H', mutex: 'H', desc: '掉落鎖定為戒指（機率+5000%）', x: 36.7, y: 88.7 },
    'H3': { name: 'H3 (鎖定腰帶)', cost: 1, req: 'H', mutex: 'H', desc: '掉落鎖定為腰帶（機率+5000%）', x: 41.2, y: 94.4 },
    'j': { name: 'j (25%機率物等+1)', cost: 1, req: 'g', children: ['K', 'k', 'm', 'n'], desc: '25%機率使裝備物品等級+1', x: 49.3, y: 62.9 },
    'K': { name: 'K (移除最低詞綴)', cost: 1, req: 'j', desc: '移除裝備上等級最低的詞綴', x: 46.3, y: 52.8 },
    'k': { name: 'k (詞綴評級+20)', cost: 1, req: 'j', children: ['L'], desc: '詞綴等級評分+20，有助於出現更高階詞綴', x: 32.5, y: 53.6 },
    'L': { name: 'L (奉獻技術)', cost: 0, req: 'k', children: ['L1', 'L2', 'L3', 'L4', 'L5'], desc: '解鎖奉獻系列（大幅提升指定類別詞綴出現機率）', x: 13.7, y: 54.3 },
    'L1': { name: 'L1 (+500%混沌詞綴)', cost: 1, req: 'L', mutex: 'L', mods: { '混沌': 5.0 }, desc: '混沌類詞綴機率+500%（increased，與其他increased相加）', x: 19.3, y: 48.9 },
    'L2': { name: 'L2 (+500%物理詞綴)', cost: 1, req: 'L', mutex: 'L', mods: { '物理': 5.0 }, desc: '物理類詞綴機率+500%（increased，與其他increased相加）', x: 11.2, y: 47.8 },
    'L3': { name: 'L3 (+500%火焰詞綴)', cost: 1, req: 'L', mutex: 'L', mods: { '火焰': 5.0 }, desc: '火焰類詞綴機率+500%（increased，與其他increased相加）', x: 6.7, y: 53.8 },
    'L4': { name: 'L4 (+500%冰冷詞綴)', cost: 1, req: 'L', mutex: 'L', mods: { '冰冷': 5.0 }, desc: '冰冷類詞綴機率+500%（increased，與其他increased相加）', x: 8.8, y: 60.4 },
    'L5': { name: 'L5 (+500%閃電詞綴)', cost: 1, req: 'L', mutex: 'L', mods: { '閃電': 5.0 }, desc: '閃電類詞綴機率+500%（increased，與其他increased相加）', x: 16.8, y: 60.5 },
    'm': { name: 'm (數值重骰取最佳)', cost: 1, req: 'j', children: ['M'], desc: '詞綴數值額外重骰一次，保留較高結果（不影響詞綴種類）', x: 26.2, y: 62.9 },
    'M': { name: 'M (奉獻熱誠)', cost: 0, req: 'm', children: ['M1', 'M2', 'M3', 'M4'], desc: '解鎖奉獻系列（大幅提升指定類別詞綴出現機率）', x: 12.6, y: 69.7 },
    'M1': { name: 'M1 (+500%暴擊詞綴)', cost: 1, req: 'M', mutex: 'M', mods: { '暴擊': 5.0 }, desc: '暴擊類詞綴機率+500%（increased，與其他increased相加）', x: 18.8, y: 64.8 },
    'M2': { name: 'M2 (+500%攻擊詞綴)', cost: 1, req: 'M', mutex: 'M', mods: { '攻擊': 5.0 }, desc: '攻擊類詞綴機率+500%（increased，與其他increased相加）', x: 11.5, y: 62.6 },
    'M3': { name: 'M3 (+500%施法詞綴)', cost: 1, req: 'M', mutex: 'M', mods: { '施法': 5.0 }, desc: '施法類詞綴機率+500%（increased，與其他increased相加）', x: 7.8, y: 69.7 },
    'M4': { name: 'M4 (+500%速度詞綴)', cost: 1, req: 'M', mutex: 'M', mods: { '速度': 5.0 }, desc: '速度類詞綴機率+500%（increased，與其他increased相加）', x: 14.1, y: 75.7 },
    'n': { name: 'n (50%機率額外掉落)', cost: 1, req: 'j', children: ['N'], desc: '50%機率額外掉落一件裝備', x: 30.1, y: 73.8 },
    'N': { name: 'N (奉獻之魂)', cost: 0, req: 'n', children: ['N1', 'N2', 'N3', 'N4', 'N5'], desc: '解鎖奉獻系列（大幅提升指定類別詞綴出現機率）', x: 20.9, y: 83.6 },
    'N1': { name: 'N1 (+500%生命詞綴)', cost: 1, req: 'N', mutex: 'N', mods: { '生命': 5.0 }, desc: '生命類詞綴機率+500%（increased，與其他increased相加）', x: 16.3, y: 78.0 },
    'N2': { name: 'N2 (+500%魔力詞綴)', cost: 1, req: 'N', mutex: 'N', mods: { '魔力': 5.0 }, desc: '魔力類詞綴機率+500%（increased，與其他increased相加）', x: 13.1, y: 83.5 },
    'N3': { name: 'N3 (+500%防禦詞綴)', cost: 1, req: 'N', mutex: 'N', mods: { '防禦': 5.0 }, desc: '防禦類詞綴機率+500%（increased，與其他increased相加）', x: 17.2, y: 90.0 },
    'N4': { name: 'N4 (+500%屬性詞綴)', cost: 1, req: 'N', mutex: 'N', mods: { '屬性': 5.0 }, desc: '屬性類詞綴機率+500%（increased，與其他increased相加）', x: 24.9, y: 89.5 },
    'N5': { name: 'N5 (+500%抗性詞綴)', cost: 1, req: 'N', mutex: 'N', mods: { '抗性': 5.0 }, desc: '抗性類詞綴機率+500%（increased，與其他increased相加）', x: 26.7, y: 82.6 }
};

const INITIAL_COORDS = {};
Object.keys(TREE_DATA).forEach(k => { INITIAL_COORDS[k] = { x: TREE_DATA[k].x, y: TREE_DATA[k].y }; });

// ==========================================
// 💡 更新：AffixRow 加入拖曳支援
// ==========================================
const AffixRow = ({ affix, updateAffix, removeAffix, onDragStart, onDragEnter, onDragOver, onDrop, onDragEnd, isDragging, isDragOver }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, affix.id)}
        onDragEnter={(e) => onDragEnter(e, affix.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, affix.id)}
        onDragEnd={onDragEnd}
        className={`mb-2 p-2 rounded-lg border shadow-sm text-sm transition-all duration-200 ${
            isDragging ? 'opacity-40 scale-95 z-50' : 'opacity-100 scale-100'
        } ${
            isDragOver ? 'border-purple-500 bg-purple-900/40 border-dashed scale-[1.02] shadow-purple-900/50' :
            affix.category === 'target' ? 'bg-green-900/20 border-green-800/50' :
            affix.category === 'acceptable' ? 'bg-blue-900/20 border-blue-800/50' :
            affix.category === 'unwanted' ? 'bg-red-900/20 border-red-800/50' :
            'bg-slate-800 border-slate-700'
        }`}
    >
        {/* 第一行：拖曳 + 類別 + 名稱 + 標籤 + 刪除 */}
        <div className="flex items-center gap-2">
            <div className="cursor-grab hover:text-white text-slate-500 active:cursor-grabbing px-1 touch-none shrink-0">
                <GripVertical size={16} />
            </div>
            <select value={affix.category} onChange={(e) => updateAffix(affix.id, 'category', e.target.value)}
                className={`shrink-0 w-24 border rounded px-1 py-1 text-xs font-bold outline-none cursor-pointer ${
                    affix.category === 'target' ? 'bg-green-950 text-green-400 border-green-700' :
                    affix.category === 'acceptable' ? 'bg-blue-950 text-blue-400 border-blue-700' :
                    affix.category === 'unwanted' ? 'bg-red-950 text-red-400 border-red-700' : 'bg-slate-900 text-slate-400 border-slate-600'
                }`}
            >
                <option value="neutral">➖ 無</option>
                <option value="target">🎯 目標詞</option>
                <option value="acceptable">✅ 可接受</option>
                <option value="unwanted">❌ 不想要</option>
            </select>
            <input value={affix.name} onChange={(e) => updateAffix(affix.id, 'name', e.target.value)} className="min-w-0 flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200 text-xs" placeholder="詞綴名稱"/>
            <button onClick={() => removeAffix(affix.id)} className="shrink-0 p-1 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"><Trash2 size={16} /></button>
        </div>
        {/* 第二行：標籤 + 基礎權重 + 當前權重 + 機率 */}
        <div className="flex items-center gap-2 mt-1.5 pl-8">
            <input value={affix.tags} onChange={(e) => updateAffix(affix.id, 'tags', e.target.value)} className="min-w-0 flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200 text-xs" placeholder="標籤 (用逗號分隔)"/>
            <input type="number" value={affix.baseWeight} onChange={(e) => updateAffix(affix.id, 'baseWeight', Number(e.target.value))} className="w-20 shrink-0 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200 text-xs text-right" placeholder="權重"/>
            <span className="shrink-0 w-14 text-right font-mono text-xs text-slate-400" title={`倍率: ${affix.multiplier.toFixed(1)}x`}>{affix.currentWeight}</span>
            <span className={`shrink-0 w-14 text-right font-mono text-xs font-bold ${affix.chance >= 20 ? 'text-green-400' : affix.chance > 0 ? 'text-blue-300' : 'text-slate-600'}`}>
                {affix.chance.toFixed(2)}%
            </span>
        </div>
    </div>
);

const TreeNode = ({ nodeId, depth = 0, activeNodes, toggleNode }) => {
    const node = TREE_DATA[nodeId];
    if (!node) return null; 
    const isActive = activeNodes.has(nodeId);
    const canActivate = nodeId === 'start' || activeNodes.has(node.req);
    let bgClass = isActive ? 'bg-purple-600 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'bg-slate-800 border-slate-600 hover:bg-slate-700';
    if (!canActivate && !isActive) bgClass = 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed';
    if (nodeId === 'start') bgClass = 'bg-blue-600 border-blue-400 font-bold shadow-[0_0_10px_rgba(59,130,246,0.4)]';

    return (
        <div className="flex flex-col relative">
            <div className={`flex items-center w-fit px-3 py-1.5 my-1 rounded-md border-2 transition-all ${bgClass} ${canActivate ? 'cursor-pointer' : ''}`} onClick={() => canActivate && toggleNode(nodeId)}>
                <span className="text-sm text-slate-100">{node.name}</span>
                {node.mods && isActive && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-purple-300 font-bold border border-purple-800">生效中</span>}
            </div>
            {node.children && (
                <div className="flex flex-col pl-6 ml-4 border-l-2 border-slate-700">
                    {node.children.map(childId => <TreeNode key={childId} nodeId={childId} depth={depth + 1} activeNodes={activeNodes} toggleNode={toggleNode} />)}
                </div>
            )}
        </div>
    );
};

export default function App() {
    const [activeNodes, setActiveNodes] = useState(new Set(['start'])); 
    const [affixes, setAffixes] = useState([]);
    const [toast, setToast] = useState('');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [viewMode, setViewMode] = useState('map'); 
    const [savedPresets, setSavedPresets] = useState({});
    
    // 內建資料庫與策略顧問狀態
    const [builtInCat, setBuiltInCat] = useState('Helmet');
    const [builtInAttr, setBuiltInAttr] = useState('str');
    const [showAdvisor, setShowAdvisor] = useState(false);

    // 拖曳排序狀態
    const [dragId, setDragId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);

    const [zoom, setZoom] = useState(1);
    const [coords, setCoords] = useState(INITIAL_COORDS);
    const [nodePrefs, setNodePrefs] = useState({ D: 0, E: 0, F: 0, K: 0 });
    const [optimizeWarnings, setOptimizeWarnings] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [draggingNode, setDraggingNode] = useState(null);
    const mapRef = useRef(null);
    const fileInputRef = useRef(null);
    const bulkInputRef = useRef(null);
    const toastTimerRef = useRef(null);

    useEffect(() => {
        const loadedPresets = localStorage.getItem('poe_genesis_presets');
        if (loadedPresets) { try { setSavedPresets(JSON.parse(loadedPresets)); } catch (e) { console.warn('Failed to parse saved presets from localStorage:', e); } }
        const loadedCoords = localStorage.getItem('poe_genesis_coords');
        if (loadedCoords) { try { setCoords({ ...INITIAL_COORDS, ...JSON.parse(loadedCoords) }); } catch (e) { console.warn('Failed to parse saved coords from localStorage:', e); } }

        const handleGlobalPointerUp = () => setDraggingNode(null);
        window.addEventListener('pointerup', handleGlobalPointerUp);
        return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
    }, []);

    const handleMapPointerMove = (e) => {
        if (!isEditMode || !draggingNode || !mapRef.current) return;
        const rect = mapRef.current.getBoundingClientRect();
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;
        setCoords(prev => ({ ...prev, [draggingNode]: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } }));
    };
    const toggleEditMode = () => {
        if (isEditMode) { localStorage.setItem('poe_genesis_coords', JSON.stringify(coords)); showToast("💾 座標校準已自動儲存於本地！"); }
        else { showToast("🛠️ 已開啟座標校準模式，請拖曳節點！"); }
        setIsEditMode(!isEditMode);
    };

    const resetCoords = () => {
        setCoords(INITIAL_COORDS);
        localStorage.removeItem('poe_genesis_coords');
        showToast("🔄 座標已重置為預設值！");
    };

    // ==========================================
    // 💡 修復 Bug 4: 加入 useCallback 避免重複渲染造成的效能問題
    // ==========================================
    const handleDragStart = useCallback((e, id) => {
        setDragId(id);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id); // Firefox 需要這個才能拖曳
    }, []);

    const handleDragEnter = useCallback((e, id) => {
        e.preventDefault();
        setDragOverId(id);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault(); // 必須 preventDefault 才能觸發 drop
    }, []);

    const handleDrop = useCallback((e, targetId) => {
        e.preventDefault();
        if (!dragId || dragId === targetId) {
            setDragId(null);
            setDragOverId(null);
            return;
        }

        setAffixes(prevAffixes => {
            const draggedIndex = prevAffixes.findIndex(a => a.id === dragId);
            const targetIndex = prevAffixes.findIndex(a => a.id === targetId);

            if (draggedIndex === -1 || targetIndex === -1) return prevAffixes;

            // 防呆：禁止前綴與後綴跨區交換
            if (prevAffixes[draggedIndex].type !== prevAffixes[targetIndex].type) {
                showToast("⚠️ 只能在同類型（前綴或後綴）之間拖曳排序！");
                return prevAffixes;
            }

            // 重新排序陣列
            const newAffixes = [...prevAffixes];
            const [draggedItem] = newAffixes.splice(draggedIndex, 1);
            newAffixes.splice(targetIndex, 0, draggedItem);

            return newAffixes;
        });

        setDragId(null);
        setDragOverId(null);
    }, [dragId]);

    const handleDragEnd = useCallback(() => {
        setDragId(null);
        setDragOverId(null);
    }, []);
    // ==========================================

    const applyAdvisorStrategy = (strategyType) => {
        try {
            const targetBase = BUILT_IN_PRESETS[builtInCat].treeBase;
            const strategyNodes = BASE_STRATEGIES[builtInAttr]?.[strategyType]?.nodes || [];
            
            setActiveNodes(prev => {
                const next = new Set(['start']); 
                
                if (targetBase && TREE_DATA[targetBase]) {
                    next.add(targetBase);
                    let curr = TREE_DATA[targetBase];
                    while(curr && curr.req && TREE_DATA[curr.req]) {
                        next.add(curr.req);
                        curr = TREE_DATA[curr.req];
                    }
                }

                strategyNodes.forEach(nodeId => {
                    if (!TREE_DATA[nodeId]) return;
                    next.add(nodeId);
                    let curr = TREE_DATA[nodeId];
                    while(curr && curr.req && TREE_DATA[curr.req]) {
                        next.add(curr.req);
                        curr = TREE_DATA[curr.req];
                    }
                });

                return next;
            });
            showToast("✨ 策略已成功套用至天賦樹！");
        } catch (e) {
            showToast("⚠️ 策略套用失敗：" + e.message);
        }
    };

    const handleLoadBuiltIn = async () => {
        const presetData = BUILT_IN_PRESETS[builtInCat]?.attributes[builtInAttr];
        
        const targetBase = BUILT_IN_PRESETS[builtInCat].treeBase;
        if (targetBase) {
            setActiveNodes(prev => {
                const next = new Set(prev);
                const bases = ['G1', 'G2', 'G3', 'G4', 'G5', 'H1', 'H2', 'H3', 'i'];
                bases.forEach(b => next.delete(b));
                next.add(targetBase);
                let curr = TREE_DATA[targetBase];
                while(curr && curr.req && TREE_DATA[curr.req]) { next.add(curr.req); curr = TREE_DATA[curr.req]; }
                return next;
            });
        }
        
        if (BUILT_IN_PRESETS[builtInCat].isArmour) {
            setShowAdvisor(true);
        } else {
            setShowAdvisor(false);
        }

        if (presetData && presetData.file) {
            try {
                const response = await fetch(presetData.file);
                if (!response.ok) throw new Error('File not found');
                const data = await response.json();
                let loaded = false;
                if (Array.isArray(data)) { setAffixes(data); loaded = true; }
                else if (data.affixes && Array.isArray(data.affixes)) { setAffixes(data.affixes); loaded = true; }

                if (loaded) showToast(`📥 成功載入：${BUILT_IN_PRESETS[builtInCat].name} - ${presetData.name}`);
                else showToast("⚠️ 詞綴庫格式無效，天賦基底已切換但詞綴未載入。");
            } catch (error) { 
                showToast(`⚠️ 詞綴庫尚未建檔！但已為您切換天賦基底與策略。`); 
            }
        } else { 
            showToast("⚠️ 此基底尚未設定檔案路徑！"); 
        }
    };

    const getDescendants = (nodeId) => {
        let descendants = [];
        const node = TREE_DATA[nodeId];
        if (node && node.children) {
            for (let childId of node.children) { descendants.push(childId); descendants = descendants.concat(getDescendants(childId)); }
        }
        return descendants;
    };

    const getCost = (nodeSet) => {
        let total = 0;
        if (!nodeSet) return 0;
        nodeSet.forEach(id => { const node = TREE_DATA[id]; if (node && typeof node.cost === 'number') total += node.cost; });
        return total;
    };
    
    const pointsUsed = useMemo(() => getCost(activeNodes), [activeNodes]);

    const hasMutex = (nodeSet, mutexName) => {
        if (!nodeSet) return false;
        for (let id of nodeSet) { const node = TREE_DATA[id]; if (node && node.mutex === mutexName) return true; }
        return false;
    };

    const toggleNode = (nodeId) => {
        if (nodeId === 'start') return;
        const node = TREE_DATA[nodeId];
        if (!node) return;

        const next = new Set(activeNodes);

        if (next.has(nodeId)) {
            next.delete(nodeId);
            getDescendants(nodeId).forEach(d => next.delete(d));
        } else {
            if (node.req && !next.has(node.req)) {
                showToast(`請先點選前置: ${TREE_DATA[node.req]?.name || node.req}`);
                return;
            }
            if (getCost(next) + node.cost > 20) {
                showToast('已達最高 20 點限制！');
                return;
            }
            if (node.mutex) {
                for (const activeId of next) {
                    const activeNode = TREE_DATA[activeId];
                    if (activeId !== nodeId && activeNode?.mutex === node.mutex) {
                        next.delete(activeId);
                        getDescendants(activeId).forEach(d => next.delete(d));
                    }
                }
            }
            next.add(nodeId);
        }
        setActiveNodes(next);
    };

    const showToast = (msg) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast(msg);
        toastTimerRef.current = setTimeout(() => setToast(''), 3000);
    };

    const getModifiers = (nodeSet) => {
        const mods = {};
        if (!nodeSet) return mods;
        nodeSet.forEach(id => { const node = TREE_DATA[id]; if (node && node.mods) { for (const [tag, val] of Object.entries(node.mods)) { mods[tag] = (mods[tag] || 0) + val; } } });
        return mods;
    };
    const currentModifiers = useMemo(() => getModifiers(activeNodes), [activeNodes]);

    const calculateAffixesChances = (affixList, mods) => {
        try {
            if (!Array.isArray(affixList)) return [];
            let preTotal = 0; let sufTotal = 0;
            const results = affixList.map(affix => {
                let multiplier = 1.0;
                const affixTags = String(affix.tags || '').split(/[,，、]+/).map(t => t.trim()).filter(t => t);
                affixTags.forEach(tag => { if (mods[tag]) multiplier += mods[tag]; });
                multiplier = Math.max(0, multiplier);
                const currentWeight = Math.floor((Number(affix.baseWeight) || 0) * multiplier);
                if (affix.type === 'prefix') preTotal += currentWeight;
                if (affix.type === 'suffix') sufTotal += currentWeight;
                return { ...affix, currentWeight, multiplier };
            });
            return results.map(affix => {
                const total = affix.type === 'prefix' ? preTotal : sufTotal;
                const chance = total === 0 ? 0 : (affix.currentWeight / total) * 100;
                return { ...affix, chance };
            });
        } catch (e) {
            console.error(e);
            return [];
        }
    };
    const calculatedAffixes = useMemo(() => calculateAffixesChances(affixes, currentModifiers), [affixes, currentModifiers]);

    const evaluateSetScore = (testSet, affixList, prefs) => {
        const mods = getModifiers(testSet);
        const evaluated = calculateAffixesChances(affixList, mods);
        let score = 0;
        evaluated.forEach(affix => {
            if (affix.category === 'target') score += affix.chance * 1000;
            else if (affix.category === 'acceptable') score += affix.chance * 100;
            else if (affix.category === 'unwanted') score -= affix.chance * 1000;
        });
        score -= getCost(testSet) * 0.1;
        if (prefs) {
            ['D', 'E', 'F', 'K'].forEach(id => {
                if (testSet.has(id) && prefs[id]) score += prefs[id];
            });
        }
        return score;
    };

    const runOptimization = () => {
        if (isOptimizing) return;
        setIsOptimizing(true);
        setOptimizeWarnings([]);
        setTimeout(() => {
            let bestScore = -Infinity;
            let bestSet = new Set(['start']);
            const A_opts = [null, 'A1', 'A2', 'A3', 'A4', 'A5'];
            const B_opts = [null, 'B1', 'B2', 'B3', 'B4'];
            const C_opts = [null, 'C1', 'C2', 'C3', 'C4', 'C5'];
            const L_opts = [null, 'L1', 'L2', 'L3', 'L4', 'L5'];
            const M_opts = [null, 'M1', 'M2', 'M3', 'M4'];
            const N_opts = [null, 'N1', 'N2', 'N3', 'N4', 'N5'];

            // 只對有設定偏好的節點才枚舉（效能關鍵）
            const prefNodeIds = Object.entries(nodePrefs).filter(([, v]) => v > 0).map(([k]) => k);
            const funcCombos = [[]];
            for (const id of prefNodeIds) {
                const extended = funcCombos.map(combo => [...combo, id]);
                funcCombos.push(...extended);
            }

            for (let a of A_opts) { for (let b of B_opts) { for (let c of C_opts) {
            for (let l of L_opts) { for (let m of M_opts) { for (let n of N_opts) {
                for (const funcNodes of funcCombos) {
                    const useD = funcNodes.includes('D');
                    const useE = funcNodes.includes('E');
                    const useF = funcNodes.includes('F');
                    const useK = funcNodes.includes('K');

                    let testSet = new Set(['start']);
                    if (a || b || c || useD || useE) { testSet.add('a'); testSet.add('b'); testSet.add('c'); }
                    if (useF) { testSet.add('a'); testSet.add('b'); testSet.add('F'); }
                    if (useD) testSet.add('D');
                    if (useE) testSet.add('E');
                    if (a) { testSet.add('d'); testSet.add('A'); testSet.add(a); }
                    if (b) { testSet.add('e'); testSet.add('B'); testSet.add(b); }
                    if (c) { testSet.add('f'); testSet.add('C'); testSet.add(c); }
                    if (l || m || n || useK) { testSet.add('g'); testSet.add('j'); }
                    if (useK) testSet.add('K');
                    if (l) { testSet.add('k'); testSet.add('L'); testSet.add(l); }
                    if (m) { testSet.add('m'); testSet.add('M'); testSet.add(m); }
                    if (n) { testSet.add('n'); testSet.add('N'); testSet.add(n); }

                    const cost = getCost(testSet);
                    if (cost <= 20) {
                        const score = evaluateSetScore(testSet, affixes, nodePrefs);
                        if (score > bestScore) { bestScore = score; bestSet = testSet; }
                    }
                }
            }}}}}}

            let finalSet = new Set(bestSet);
            let currentCost = getCost(finalSet);
            let utilityNodes = Array.from(activeNodes).filter(id => !finalSet.has(id));
            let addedAny = true;
            while(addedAny) {
                addedAny = false;
                for (let id of utilityNodes) {
                    if (finalSet.has(id)) continue;
                    let node = TREE_DATA[id];
                    if (!node) continue;
                    if (node.req && !finalSet.has(node.req)) continue;
                    if (node.mutex && hasMutex(finalSet, node.mutex)) continue;
                    if (currentCost + node.cost <= 20) { finalSet.add(id); currentCost += node.cost; addedAny = true; }
                }
            }

            // === 警告分析 ===
            const warnings = [];
            const resultMods = getModifiers(finalSet);
            const resultAffixes = calculateAffixesChances(affixes, resultMods);

            // 1. 目標詞機率過低
            resultAffixes.filter(a => a.category === 'target' && a.chance < 10).forEach(a => {
                warnings.push({ type: 'low_chance', msg: `「${a.name}」目標詞機率偏低（${a.chance.toFixed(1)}%），可能難以達成` });
            });

            // 2. 有偏好但沒被納入的功能節點（點數不足）
            prefNodeIds.forEach(id => {
                if (nodePrefs[id] > 0 && !finalSet.has(id)) {
                    const labels = { D: 'D (破裂)', E: 'E (連線+50)', F: 'F (隨機品質)', K: 'K (移最低詞)' };
                    warnings.push({ type: 'node_skipped', msg: `${labels[id]} 因點數不足無法納入，建議降低其他偏好或減少目標詞` });
                }
            });

            setOptimizeWarnings(warnings);
            setActiveNodes(finalSet);
            setIsOptimizing(false);
            showToast("✨ 最佳化完成！已為您搭配出最高權重的天賦路徑。");
        }, 50);
    };

    const handleExport = () => {
        const dataToExport = { affixes: affixes };
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `poe_genesis_affixes.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("💾 詞綴設定已匯出！");
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                let imported = false;
                if (Array.isArray(importedData)) { setAffixes(importedData); imported = true; }
                else if (importedData.affixes && Array.isArray(importedData.affixes)) { setAffixes(importedData.affixes); imported = true; }
                if (imported) showToast("✅ 成功匯入詞綴資料！");
                else showToast("⚠️ 檔案格式無效，未找到詞綴資料。");
            } catch (err) { showToast("❌ 檔案格式錯誤。"); }
            event.target.value = null;
        };
        reader.readAsText(file);
    };

    // ==========================================
    // 💡 修復 Bug 2: 批次匯入的多線程塞車問題 (使用 Promise.all)
    // ==========================================
    const handleBulkImport = async (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;
        
        const newPresetsData = {};

        await Promise.all(files.map(async (file) => {
            try {
                const data = JSON.parse(await file.text());
                newPresetsData[file.name.replace('.json', '')] = data;
            } catch(e) {
                console.error(`無法解析檔案: ${file.name}`);
            }
        }));

        const count = Object.keys(newPresetsData).length;
        if (count > 0) {
            const finalPresets = { ...savedPresets, ...newPresetsData };
            setSavedPresets(finalPresets);
            localStorage.setItem('poe_genesis_presets', JSON.stringify(finalPresets));
            showToast(`📂 成功將 ${count} 個檔案加入個人預設庫！`);
        }
        
        event.target.value = null;
    };

    const handleLoadPreset = (presetName) => {
        const data = savedPresets[presetName];
        if (data) {
            let loaded = false;
            if (Array.isArray(data)) { setAffixes(data); loaded = true; }
            else if (data.affixes && Array.isArray(data.affixes)) { setAffixes(data.affixes); loaded = true; }
            if (loaded) showToast(`✨ 已載入個人預設：${presetName}`);
            else showToast("⚠️ 預設資料格式無效。");
        }
    };

    const addAffix = (type) => {
        setAffixes([...affixes, { id: Date.now().toString(), type, name: '新詞綴', tags: '', baseWeight: 1000, category: 'neutral' }]);
    };
    const updateAffix = (id, field, value) => {
        setAffixes(affixes.map(a => a.id === id ? { ...a, [field]: value } : a));
    };
    const removeAffix = (id) => {
        setAffixes(affixes.filter(a => a.id !== id));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 lg:p-8 font-sans selection:bg-purple-900">
            {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-600 text-slate-100 px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce">{toast}</div>}

            <header className="mb-6 pb-4 border-b border-slate-800 flex flex-col xl:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 flex items-center gap-2">
                        <GitMerge /> 創世之樹 策略最佳化模擬器
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">支援原圖 UI 熱區點擊與演算法最佳化配置</p>
                </div>
                
                <div className="flex flex-wrap justify-center items-center gap-3 bg-slate-900 p-2 lg:p-3 rounded-lg border border-slate-800 shadow-inner">
                    <div className="flex bg-slate-950 rounded border border-slate-700 overflow-hidden mr-2">
                        <button onClick={() => setViewMode('map')} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><MapIcon size={14}/> 視覺地圖</button>
                        <button onClick={() => setViewMode('list')} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><List size={14}/> 結構清單</button>
                    </div>
                    <div className="flex items-center gap-2"><Settings2 className="text-slate-400" size={18} /><span className="text-slate-300 text-sm font-medium">點數:</span><span className={`text-lg font-mono font-bold ${pointsUsed === 20 ? 'text-red-400' : 'text-purple-400'}`}>{pointsUsed}/20</span></div>
                    <div className="h-5 w-px bg-slate-700 mx-1 hidden xl:block"></div>
                    <button onClick={runOptimization} disabled={isOptimizing || isEditMode} className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-bold shadow-lg transition-all ${isOptimizing || isEditMode ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-900/30 hover:scale-105'}`}><Wand2 size={14} className={isOptimizing ? "animate-spin" : ""} /> 最佳化</button>
                    <div className="flex gap-1">
                        <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-2 py-1.5 rounded" title="匯入 JSON"><Upload size={14} /> 匯入</button>
                        <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
                        <button onClick={handleExport} className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-2 py-1.5 rounded" title="匯出 JSON"><Download size={14} /> 匯出</button>
                    </div>
                    <button onClick={() => {setActiveNodes(new Set(['start'])); setShowAdvisor(false);}} className="text-xs bg-slate-800 hover:bg-red-900 border border-slate-600 text-slate-300 hover:text-white px-2 py-1.5 rounded transition-colors">重置</button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 地圖區域 */}
                <div className="lg:col-span-6 xl:col-span-6 bg-slate-900/50 rounded-xl border border-slate-800 p-2 overflow-hidden flex flex-col h-[80vh]">
                    <h2 className="text-lg font-semibold text-purple-300 mb-2 px-2 flex items-center justify-between shrink-0">
                        <span>天賦樹 {viewMode === 'map' ? '(視覺地圖)' : '(結構清單)'}</span>
                        {viewMode === 'map' && (
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center bg-slate-950 rounded border border-slate-700 shadow-sm">
                                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-l transition-colors"><ZoomOut size={16} /></button>
                                    <span className="text-[11px] font-mono w-10 text-center text-slate-300 font-bold select-none">{Math.round(zoom * 100)}%</span>
                                    <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-r transition-colors"><ZoomIn size={16} /></button>
                                </div>
                                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                                {isEditMode && <button onClick={resetCoords} className="flex items-center gap-1 text-[11px] bg-red-900/50 hover:bg-red-800 text-red-200 px-2 py-1 rounded border border-red-700 transition-colors"><RotateCcw size={12}/> 重置座標</button>}
                                <button onClick={toggleEditMode} className={`flex items-center gap-1 text-[11px] px-2 py-1.5 rounded border shadow-sm transition-colors ${isEditMode ? 'bg-yellow-600/30 text-yellow-300 border-yellow-500' : 'bg-slate-800 text-slate-400 border-slate-600 hover:bg-slate-700'}`}>
                                    {isEditMode ? <Unlock size={12}/> : <Lock size={12}/>} {isEditMode ? '完成校準 (自動儲存)' : '解鎖節點以手動校準'}
                                </button>
                            </div>
                        )}
                    </h2>
                    
                    {viewMode === 'map' ? (
                        <div className="flex-1 overflow-auto custom-scrollbar bg-slate-950 rounded-lg border border-slate-800 shadow-inner p-2 md:p-4">
                            <div className="w-full flex justify-center items-start min-w-max">
                                <div ref={mapRef} className={`relative aspect-[1083/951] touch-none transition-all duration-200 ease-out ${isEditMode ? 'outline outline-2 outline-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : ''}`} style={{ width: `${zoom * 100}%`, maxWidth: `${zoom * 800}px`, minWidth: `${zoom * 300}px` }} onPointerMove={handleMapPointerMove}>
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <image href="/tree.jpg" x="0" y="0" width="100" height="100" preserveAspectRatio="none" opacity="0.4" style={{ mixBlendMode: 'screen' }} onError={(e) => e.target.style.display = 'none'} />
                                        {Object.entries(TREE_DATA).map(([id, node]) => {
                                            if (!node || !node.children) return null;
                                            return node.children.map(childId => {
                                                const childNode = TREE_DATA[childId];
                                                if (!childNode) return null;
                                                const isParentActive = activeNodes.has(id);
                                                const isChildActive = activeNodes.has(childId);
                                                const canActivateChild = isParentActive; 
                                                let strokeClass = "stroke-slate-800", strokeWidth = 0.2;
                                                if (isParentActive && isChildActive) { strokeClass = "stroke-purple-500 drop-shadow-[0_0_2px_rgba(168,85,247,0.8)]"; strokeWidth = 0.4; } 
                                                else if (canActivateChild) { strokeClass = "stroke-slate-600"; strokeWidth = 0.3; }
                                                return <line key={`${id}-${childId}`} x1={coords[id]?.x ?? node.x} y1={coords[id]?.y ?? node.y} x2={coords[childId]?.x ?? childNode.x} y2={coords[childId]?.y ?? childNode.y} className={`transition-all duration-300 ${strokeClass}`} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />;
                                            });
                                        })}
                                    </svg>
                                    {Object.entries(TREE_DATA).map(([id, node]) => {
                                        if (!node) return null;
                                        const isActive = activeNodes.has(id);
                                        const canActivate = id === 'start' || activeNodes.has(node.req);
                                        let nodeClass = `absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center border-2 shadow-lg transition-all group ${isEditMode ? 'hover:scale-125' : ''} `;
                                        if (isActive) nodeClass += "bg-purple-700 border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.8)] z-20 scale-110";
                                        else if (canActivate || isEditMode) nodeClass += "bg-slate-700 border-slate-400 hover:bg-blue-600 hover:border-blue-300 z-10";
                                        else nodeClass += "bg-slate-900 border-slate-800 opacity-50 z-0";
                                        if (id === 'start') nodeClass += isActive ? " !bg-blue-600 !border-blue-300 w-10 h-10 -ml-5 -mt-5" : " w-10 h-10 -ml-5 -mt-5";
                                        return (
                                            <div key={id} className={nodeClass} style={{ left: `${coords[id]?.x ?? node.x}%`, top: `${coords[id]?.y ?? node.y}%`, cursor: isEditMode ? (draggingNode === id ? 'grabbing' : 'grab') : (canActivate ? 'pointer' : 'not-allowed') }} onPointerDown={(e) => { if (isEditMode) { e.stopPropagation(); setDraggingNode(id); } else if (canActivate) { toggleNode(id); } }}>
                                                <span className={`font-bold select-none ${id === 'start' ? 'text-xs' : 'text-[9px]'} ${isActive ? 'text-white' : 'text-slate-300'}`}>{id === 'start' ? '起' : id}</span>
                                                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-slate-200 text-xs px-2 py-1.5 rounded border border-slate-700 pointer-events-none z-50 max-w-[200px] whitespace-normal">
                                                    <div className="font-bold text-purple-400 whitespace-nowrap">{id}: {node.name}</div>
                                                    {node.desc && <div className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{node.desc}</div>}
                                                    {isEditMode && <div className="text-[10px] text-yellow-400 mt-1">拖曳以移動位置</div>}
                                                    {!canActivate && !isEditMode && <div className="text-[10px] text-red-400 mt-1">需解鎖前置節點</div>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2"><TreeNode nodeId="start" activeNodes={activeNodes} toggleNode={toggleNode} /></div>
                    )}
                </div>

                <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh] custom-scrollbar pr-2">
                    
                    {/* 🛠️ 智慧做裝顧問面板 */}
                    <div className="bg-slate-900/80 rounded-xl border-2 border-blue-900/50 flex flex-col shadow-lg shadow-blue-900/10">
                        <div className="p-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <TargetIcon size={18} className="text-blue-400 shrink-0" />
                                <span className="font-semibold text-blue-200 text-sm whitespace-nowrap">目標設定:</span>
                                <select 
                                    value={builtInCat}
                                    onChange={(e) => {
                                        setBuiltInCat(e.target.value);
                                        setBuiltInAttr(Object.keys(BUILT_IN_PRESETS[e.target.value].attributes)[0]);
                                        setShowAdvisor(false);
                                    }} 
                                    className="bg-slate-950 text-slate-200 border border-blue-800/50 rounded px-2 py-1.5 text-sm outline-none cursor-pointer"
                                >
                                    {Object.entries(BUILT_IN_PRESETS).map(([catKey, catData]) => (
                                        <option key={catKey} value={catKey}>{catData.name}</option>
                                    ))}
                                </select>
                                <select 
                                    value={builtInAttr}
                                    onChange={(e) => {
                                        setBuiltInAttr(e.target.value);
                                        setShowAdvisor(false);
                                    }} 
                                    className="bg-slate-950 text-slate-200 border border-blue-800/50 rounded px-2 py-1.5 text-sm outline-none cursor-pointer flex-1 min-w-[120px]"
                                >
                                    {Object.entries(BUILT_IN_PRESETS[builtInCat]?.attributes || {}).map(([attrKey, attrData]) => (
                                        <option key={attrKey} value={attrKey}>{attrData.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="button" onClick={handleLoadBuiltIn} className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded shadow-lg transition-colors whitespace-nowrap">
                                <CheckSquare size={14}/> 讀取詞綴與策略
                            </button>
                        </div>

                        {showAdvisor && BUILT_IN_PRESETS[builtInCat].isArmour && BASE_STRATEGIES[builtInAttr] && (
                            <div className="border-t border-blue-900/50 bg-blue-950/20 p-4">
                                <h3 className="text-sm font-bold text-yellow-400 mb-1 flex items-center gap-1">
                                    <Zap size={16}/> 基底機率策略顧問
                                </h3>
                                <p className="text-xs text-blue-200 mb-3 leading-relaxed">
                                    {BASE_STRATEGIES[builtInAttr].desc}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <button type="button" onClick={() => applyAdvisorStrategy('cp')} className="flex flex-col items-start bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-yellow-600/50 p-2.5 rounded transition-all group">
                                        <span className="text-xs font-bold text-slate-300 group-hover:text-yellow-400 mb-1 flex items-center gap-1">
                                            <span>💰 推薦策略：防污染法</span>
                                            <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">消耗 {BASE_STRATEGIES[builtInAttr].cp.cost} 點</span>
                                        </span>
                                        <span className="text-sm text-yellow-100 font-mono">{BASE_STRATEGIES[builtInAttr].cp.label}</span>
                                    </button>
                                    <button type="button" onClick={() => applyAdvisorStrategy('max')} className="flex flex-col items-start bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-red-500/50 p-2.5 rounded transition-all group">
                                        <span className="text-xs font-bold text-slate-300 group-hover:text-red-400 mb-1 flex items-center gap-1">
                                            <span>🔥 暴力策略：極限機率</span>
                                            <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">消耗 {BASE_STRATEGIES[builtInAttr].max.cost} 點</span>
                                        </span>
                                        <span className="text-sm text-red-100 font-mono">{BASE_STRATEGIES[builtInAttr].max.label}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 功能節點偏好設定 */}
                    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-3 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1">
                            <Settings2 size={14} className="text-slate-400"/> 功能節點偏好 <span className="text-[11px] text-slate-500 font-normal ml-1">（影響最佳化時是否納入考慮）</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                                { id: 'D', label: 'D (33%機率破裂)', desc: '33%機率使裝備獲得破裂詞綴，鎖定一個詞綴' },
                                { id: 'E', label: 'E (連線×50取最佳)', desc: '插槽與連線多擲50次，保留最佳結果' },
                                { id: 'F', label: 'F (隨機品質)', desc: '護甲掉落時品質為隨機數值（而非固定0%）' },
                                { id: 'K', label: 'K (移除最低詞綴)', desc: '移除裝備上等級最低的詞綴' },
                            ].map(({ id, label, desc }) => (
                                <div key={id} className="flex items-center gap-2 bg-slate-950 rounded-lg p-2 border border-slate-800">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-bold text-slate-200 font-mono">{label}</div>
                                        <div className="text-[10px] text-slate-500 truncate">{desc}</div>
                                    </div>
                                    <div className="flex shrink-0 gap-1">
                                        {[{ val: 0, label: '不需要' }, { val: 2000, label: '普通' }, { val: 10000, label: '重要' }].map(opt => (
                                            <button
                                                key={opt.val}
                                                onClick={() => setNodePrefs(p => ({ ...p, [id]: opt.val }))}
                                                className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                                                    nodePrefs[id] === opt.val
                                                        ? opt.val === 0 ? 'bg-slate-700 border-slate-500 text-slate-200'
                                                          : opt.val === 2000 ? 'bg-blue-700 border-blue-500 text-white'
                                                          : 'bg-purple-700 border-purple-500 text-white'
                                                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                                                }`}
                                            >{opt.label}</button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 最佳化警告 */}
                    {optimizeWarnings.length > 0 && (
                        <div className="bg-yellow-950/30 rounded-xl border border-yellow-800/50 p-3">
                            <h2 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-1">
                                <ShieldAlert size={14}/> 最佳化提示
                            </h2>
                            <div className="flex flex-col gap-1.5">
                                {optimizeWarnings.map((w, i) => (
                                    <div key={i} className={`flex items-start gap-2 text-xs rounded px-2 py-1.5 ${
                                        w.type === 'low_chance' ? 'bg-red-950/40 text-red-300' : 'bg-yellow-950/40 text-yellow-300'
                                    }`}>
                                        <span className="shrink-0 mt-0.5">{w.type === 'low_chance' ? '⚠️' : '💡'}</span>
                                        <span>{w.msg}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 個人預設庫 */}
                    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <FolderOpen size={18} className="text-yellow-500 shrink-0" />
                            <span className="font-semibold text-slate-300 text-sm whitespace-nowrap">個人預設庫:</span>
                            <select onChange={(e) => { if(e.target.value) handleLoadPreset(e.target.value); e.target.value = ""; }} defaultValue="" className="bg-slate-950 text-slate-200 border border-slate-700 rounded px-2 py-1.5 text-sm outline-none cursor-pointer flex-1 w-full max-w-[200px]">
                                <option value="" disabled>選擇預設檔...</option>
                                {Object.keys(savedPresets).map(presetName => <option key={presetName} value={presetName}>{presetName}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button type="button" onClick={() => bulkInputRef.current.click()} className="flex-1 sm:flex-none text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-600 text-slate-300 transition-colors whitespace-nowrap">➕ 批次匯入</button>
                            <input type="file" multiple accept=".json" ref={bulkInputRef} onChange={handleBulkImport} className="hidden" />
                            <button type="button" onClick={() => { setSavedPresets({}); localStorage.removeItem('poe_genesis_presets'); showToast("🧹 已清空所有個人預設檔"); }} className="text-xs bg-slate-800 hover:bg-red-900 px-2 py-1.5 rounded border border-slate-600 text-slate-400 hover:text-slate-200 transition-colors" title="清空預設庫"><Trash2 size={14}/></button>
                        </div>
                    </div>

                    {/* ========================================== */}
                    {/* 💡 更新：前綴區域 (傳入拖曳事件 Props) */}
                    {/* ========================================== */}
                    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                            <h2 className="text-base font-semibold text-blue-300 flex items-center gap-2"><ShieldAlert size={16}/> 前綴 (Prefixes)</h2>
                            <button type="button" onClick={() => addAffix('prefix')} className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/40 px-2 py-1 rounded flex items-center gap-1 transition-colors"><Plus size={14}/> 新增前綴</button>
                        </div>
                        <div className="space-y-2">
                            {calculatedAffixes.filter(a => a.type === 'prefix').map(affix => (
                                <AffixRow 
                                    key={affix.id} affix={affix} updateAffix={updateAffix} removeAffix={removeAffix} 
                                    onDragStart={handleDragStart} onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDrop={handleDrop} onDragEnd={handleDragEnd}
                                    isDragging={dragId === affix.id} isDragOver={dragOverId === affix.id && dragId !== affix.id}
                                />
                            ))}
                        </div>
                    </div>

                    {/* ========================================== */}
                    {/* 💡 更新：後綴區域 (傳入拖曳事件 Props) */}
                    {/* ========================================== */}
                    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                            <h2 className="text-base font-semibold text-red-300 flex items-center gap-2"><ShieldAlert size={16}/> 後綴 (Suffixes)</h2>
                            <button type="button" onClick={() => addAffix('suffix')} className="text-xs bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/40 px-2 py-1 rounded flex items-center gap-1 transition-colors"><Plus size={14}/> 新增後綴</button>
                        </div>
                        <div className="space-y-2">
                            {calculatedAffixes.filter(a => a.type === 'suffix').map(affix => (
                                <AffixRow 
                                    key={affix.id} affix={affix} updateAffix={updateAffix} removeAffix={removeAffix} 
                                    onDragStart={handleDragStart} onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDrop={handleDrop} onDragEnd={handleDragEnd}
                                    isDragging={dragId === affix.id} isDragOver={dragOverId === affix.id && dragId !== affix.id}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}} />
        </div>
    );
}
