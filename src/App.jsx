import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Trash2, ShieldAlert, GitMerge, Settings2, Info, Wand2, Upload, Download, Map as MapIcon, List, Target, FolderOpen, Unlock, Lock, RotateCcw, ZoomIn, ZoomOut, Database, CheckSquare, Zap, Target as TargetIcon } from 'lucide-react';

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
    'start': { name: '起點', cost: 0, children: ['a', 'g'], x: 80.8, y: 81.5 },
    'a': { name: 'a (連線+10)', cost: 1, req: 'start', children: ['b', 'G'], x: 82.2, y: 61.5 },
    'G': { name: 'G (鎖定防具)', cost: 1, req: 'a', children: ['G1', 'G2', 'G3', 'G4', 'G5'], x: 90.9, y: 36.6 },
    'G1': { name: 'G1 (護盾)', cost: 1, req: 'G', mutex: 'G', x: 83.8, y: 33.4 },
    'G2': { name: 'G2 (頭盔)', cost: 1, req: 'G', mutex: 'G', x: 88.3, y: 27.3 },
    'G3': { name: 'G3 (胸甲)', cost: 1, req: 'G', mutex: 'G', x: 96.3, y: 30.8 },
    'G4': { name: 'G4 (手套)', cost: 1, req: 'G', mutex: 'G', x: 96.5, y: 40.5 },
    'G5': { name: 'G5 (鞋子)', cost: 1, req: 'G', mutex: 'G', x: 92.2, y: 46.4 },
    'b': { name: 'b (評分+20)', cost: 1, req: 'a', children: ['c', 'F'], x: 68.6, y: 55.0 },
    'F': { name: 'F (隨機品質)', cost: 1, req: 'b', x: 64.8, y: 41.3 },
    'c': { name: 'c (物等+1)', cost: 1, req: 'b', children: ['d', 'e', 'f', 'D', 'E'], x: 55.7, y: 44.2 },
    'D': { name: 'D (破裂)', cost: 1, req: 'c', x: 33.2, y: 32.5 },
    'E': { name: 'E (連線+50)', cost: 1, req: 'c', x: 48.9, y: 19.6 },
    'd': { name: 'd (額外裝備)', cost: 1, req: 'c', children: ['A'], x: 30.6, y: 41.0 },
    'A': { name: 'A (棄絕之魂)', cost: 0, req: 'd', children: ['A1', 'A2', 'A3', 'A4', 'A5'], x: 18.2, y: 35.0 },
    'A1': { name: 'A1 (-60%防禦)', cost: 1, req: 'A', mutex: 'A', mods: { '防禦': -0.6 }, x: 24.1, y: 40.4 },
    'A2': { name: 'A2 (-60%屬性)', cost: 1, req: 'A', mutex: 'A', mods: { '屬性': -0.6 }, x: 15.1, y: 41.5 },
    'A3': { name: 'A3 (-60%抗性)', cost: 1, req: 'A', mutex: 'A', mods: { '抗性': -0.6 }, x: 10.8, y: 34.9 },
    'A4': { name: 'A4 (-60%魔力)', cost: 1, req: 'A', mutex: 'A', mods: { '魔力': -0.6 }, x: 13.9, y: 28.1 },
    'A5': { name: 'A5 (-60%生命)', cost: 1, req: 'A', mutex: 'A', mods: { '生命': -0.6 }, x: 21.8, y: 28.3 },
    'e': { name: 'e (神聖滾動)', cost: 1, req: 'c', children: ['B'], x: 43.6, y: 30.0 },
    'B': { name: 'B (棄絕熱誠)', cost: 0, req: 'e', children: ['B1', 'B2', 'B3', 'B4'], x: 37.9, y: 16.5 },
    'B1': { name: 'B1 (-60%速度)', cost: 1, req: 'B', mutex: 'B', mods: { '速度': -0.6 }, x: 31.4, y: 21.9 },
    'B2': { name: 'B2 (-60%施法)', cost: 1, req: 'B', mutex: 'B', mods: { '施法': -0.6 }, x: 32.5, y: 13.5 },
    'B3': { name: 'B3 (-60%攻擊)', cost: 1, req: 'B', mutex: 'B', mods: { '攻擊': -0.6 }, x: 40.7, y: 10.4 },
    'B4': { name: 'B4 (-60%暴擊)', cost: 1, req: 'B', mutex: 'B', mods: { '暴擊': -0.6 }, x: 44.0, y: 19.0 },
    'f': { name: 'f (評分+20)', cost: 1, req: 'c', children: ['C'], x: 59.5, y: 28.6 },
    'C': { name: 'C (棄絕技術)', cost: 0, req: 'f', children: ['C1', 'C2', 'C3', 'C4', 'C5'], x: 69.0, y: 14.0 },
    'C1': { name: 'C1 (-60%閃電)', cost: 1, req: 'C', mutex: 'C', mods: { '閃電': -0.6 }, x: 62.2, y: 14.4 },
    'C2': { name: 'C2 (-60%冰冷)', cost: 1, req: 'C', mutex: 'C', mods: { '冰冷': -0.6 }, x: 65.0, y: 7.4 },
    'C3': { name: 'C3 (-60%火焰)', cost: 1, req: 'C', mutex: 'C', mods: { '火焰': -0.6 }, x: 73.1, y: 7.4 },
    'C4': { name: 'C4 (-60%物理)', cost: 1, req: 'C', mutex: 'C', mods: { '物理': -0.6 }, x: 75.7, y: 14.2 },
    'C5': { name: 'C5 (-60%混沌)', cost: 1, req: 'C', mutex: 'C', mods: { '混沌': -0.6 }, x: 72.6, y: 20.8 },
    'g': { name: 'g (額外裝備)', cost: 1, req: 'start', children: ['j', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'h'], x: 63.8, y: 71.7 },
    'g1': { name: 'g1 (-85%智)', cost: 1, req: 'g', mods: { '智力': -0.85 }, x: 58.5, y: 65.2 },
    'g2': { name: 'g2 (+300%智)', cost: 1, req: 'g', mods: { '智力': 3.0 }, x: 68.6, y: 62.9 },
    'g3': { name: 'g3 (+300%敏)', cost: 1, req: 'g', mods: { '敏捷': 3.0 }, x: 72.5, y: 71.4 },
    'g4': { name: 'g4 (-85%敏)', cost: 1, req: 'g', mods: { '敏捷': -0.85 }, x: 69.1, y: 79.7 },
    'g5': { name: 'g5 (-85%力)', cost: 1, req: 'g', mods: { '力量': -0.85 }, x: 60.6, y: 79.5 },
    'g6': { name: 'g6 (+300%力)', cost: 1, req: 'g', mods: { '力量': 3.0 }, x: 56.3, y: 72.3 },
    'h': { name: 'h (額外裝備)', cost: 1, req: 'g', children: ['H', 'i'], x: 50.7, y: 79.3 },
    'i': { name: 'i (珠寶)', cost: 1, req: 'h', x: 39.1, y: 74.9 },
    'H': { name: 'H (飾品)', cost: 1, req: 'h', children: ['H1', 'H2', 'H3'], x: 43.7, y: 87.5 },
    'H1': { name: 'H1 (護身符)', cost: 1, req: 'H', mutex: 'H', x: 37.8, y: 81.6 },
    'H2': { name: 'H2 (戒指)', cost: 1, req: 'H', mutex: 'H', x: 36.7, y: 88.7 },
    'H3': { name: 'H3 (腰帶)', cost: 1, req: 'H', mutex: 'H', x: 41.2, y: 94.4 },
    'j': { name: 'j (物等+1)', cost: 1, req: 'g', children: ['K', 'k', 'm', 'n'], x: 49.3, y: 62.9 },
    'K': { name: 'K (移最低詞)', cost: 1, req: 'j', x: 46.3, y: 52.8 },
    'k': { name: 'k (評分+20)', cost: 1, req: 'j', children: ['L'], x: 32.5, y: 53.6 },
    'L': { name: 'L (奉獻技術)', cost: 0, req: 'k', children: ['L1', 'L2', 'L3', 'L4', 'L5'], x: 13.7, y: 54.3 },
    'L1': { name: 'L1 (+500%混沌)', cost: 1, req: 'L', mutex: 'L', mods: { '混沌': 5.0 }, x: 19.3, y: 48.9 },
    'L2': { name: 'L2 (+500%物理)', cost: 1, req: 'L', mutex: 'L', mods: { '物理': 5.0 }, x: 11.2, y: 47.8 },
    'L3': { name: 'L3 (+500%火焰)', cost: 1, req: 'L', mutex: 'L', mods: { '火焰': 5.0 }, x: 6.7, y: 53.8 },
    'L4': { name: 'L4 (+500%冰冷)', cost: 1, req: 'L', mutex: 'L', mods: { '冰冷': 5.0 }, x: 8.8, y: 60.4 },
    'L5': { name: 'L5 (+500%閃電)', cost: 1, req: 'L', mutex: 'L', mods: { '閃電': 5.0 }, x: 16.8, y: 60.5 },
    'm': { name: 'm (神聖滾動)', cost: 1, req: 'j', children: ['M'], x: 26.2, y: 62.9 },
    'M': { name: 'M (奉獻熱誠)', cost: 0, req: 'm', children: ['M1', 'M2', 'M3', 'M4'], x: 12.6, y: 69.7 },
    'M1': { name: 'M1 (+500%暴擊)', cost: 1, req: 'M', mutex: 'M', mods: { '暴擊': 5.0 }, x: 18.8, y: 64.8 },
    'M2': { name: 'M2 (+500%攻擊)', cost: 1, req: 'M', mutex: 'M', mods: { '攻擊': 5.0 }, x: 11.5, y: 62.6 },
    'M3': { name: 'M3 (+500%施法)', cost: 1, req: 'M', mutex: 'M', mods: { '施法': 5.0 }, x: 7.8, y: 69.7 },
    'M4': { name: 'M4 (+500%速度)', cost: 1, req: 'M', mutex: 'M', mods: { '速度': 5.0 }, x: 14.1, y: 75.7 },
    'n': { name: 'n (額外裝備)', cost: 1, req: 'j', children: ['N'], x: 30.1, y: 73.8 },
    'N': { name: 'N (奉獻之魂)', cost: 0, req: 'n', children: ['N1', 'N2', 'N3', 'N4', 'N5'], x: 20.9, y: 83.6 },
    'N1': { name: 'N1 (+500%生命)', cost: 1, req: 'N', mutex: 'N', mods: { '生命': 5.0 }, x: 16.3, y: 78.0 },
    'N2': { name: 'N2 (+500%魔力)', cost: 1, req: 'N', mutex: 'N', mods: { '魔力': 5.0 }, x: 13.1, y: 83.5 },
    'N3': { name: 'N3 (+500%防禦)', cost: 1, req: 'N', mutex: 'N', mods: { '防禦': 5.0 }, x: 17.2, y: 90.0 },
    'N4': { name: 'N4 (+500%屬性)', cost: 1, req: 'N', mutex: 'N', mods: { '屬性': 5.0 }, x: 24.9, y: 89.5 },
    'N5': { name: 'N5 (+500%抗性)', cost: 1, req: 'N', mutex: 'N', mods: { '抗性': 5.0 }, x: 26.7, y: 82.6 }
};

const INITIAL_COORDS = {};
Object.keys(TREE_DATA).forEach(k => { INITIAL_COORDS[k] = { x: TREE_DATA[k].x, y: TREE_DATA[k].y }; });

const AffixRow = ({ affix, updateAffix, removeAffix }) => (
    <div className={`flex items-center gap-2 mb-2 p-2 rounded-lg border shadow-sm text-sm transition-colors ${
        affix.category === 'target' ? 'bg-green-900/20 border-green-800/50' :
        affix.category === 'acceptable' ? 'bg-blue-900/20 border-blue-800/50' :
        affix.category === 'unwanted' ? 'bg-red-900/20 border-red-800/50' :
        'bg-slate-800 border-slate-700'
    }`}>
        <select value={affix.category} onChange={(e) => updateAffix(affix.id, 'category', e.target.value)}
            className={`w-28 border rounded px-1 py-1.5 text-xs font-bold outline-none cursor-pointer ${
                affix.category === 'target' ? 'bg-green-950 text-green-400 border-green-700' :
                affix.category === 'acceptable' ? 'bg-blue-950 text-blue-400 border-blue-700' :
                affix.category === 'unwanted' ? 'bg-red-950 text-red-400 border-red-700' : 'bg-slate-900 text-slate-400 border-slate-600'
            }`}
        >
            <option value="neutral">➖ 無 (Neutral)</option>
            <option value="target">🎯 目標詞</option>
            <option value="acceptable">✅ 可接受</option>
            <option value="unwanted">❌ 不想要</option>
        </select>
        <input value={affix.name} onChange={(e) => updateAffix(affix.id, 'name', e.target.value)} className="w-1/4 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200" placeholder="詞綴名稱"/>
        <input value={affix.tags} onChange={(e) => updateAffix(affix.id, 'tags', e.target.value)} className="w-1/4 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200" placeholder="標籤"/>
        <input type="number" value={affix.baseWeight} onChange={(e) => updateAffix(affix.id, 'baseWeight', Number(e.target.value))} className="w-20 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200 text-right" />
        
        <div className="flex-1 flex items-center justify-end gap-3 text-slate-300 px-2">
            <span className="w-16 text-right font-mono" title={`倍率: ${affix.multiplier.toFixed(1)}x`}>{affix.currentWeight}</span>
            <span className={`w-16 text-right font-mono font-bold ${affix.chance >= 20 ? 'text-green-400' : affix.chance > 0 ? 'text-blue-300' : 'text-slate-600'}`}>
                {affix.chance.toFixed(2)}%
            </span>
        </div>
        <button onClick={() => removeAffix(affix.id)} className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"><Trash2 size={16} /></button>
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

    const [zoom, setZoom] = useState(1);
    const [coords, setCoords] = useState(INITIAL_COORDS);
    const [isEditMode, setIsEditMode] = useState(false);
    const [draggingNode, setDraggingNode] = useState(null);
    const mapRef = useRef(null);
    const fileInputRef = useRef(null);
    const bulkInputRef = useRef(null);
    const toastTimerRef = useRef(null);

    useEffect(() => {
        const loadedPresets = localStorage.getItem('poe_genesis_presets');
        if (loadedPresets) { try { setSavedPresets(JSON.parse(loadedPresets)); } catch (e) { } }
        const loadedCoords = localStorage.getItem('poe_genesis_coords');
        if (loadedCoords) { try { setCoords({ ...INITIAL_COORDS, ...JSON.parse(loadedCoords) }); } catch (e) { } }

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

    // --- 修正後的 讀取詞綴與策略 功能 ---
    const handleLoadBuiltIn = async () => {
        const presetData = BUILT_IN_PRESETS[builtInCat]?.attributes[builtInAttr];
        
        // 1. 優先更新 UI 與天賦樹 (就算找不到 JSON 檔案也能作用)
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

        // 2. 嘗試去讀取對應的 JSON 檔案
        if (presetData && presetData.file) {
            try {
                const response = await fetch(presetData.file);
                if (!response.ok) throw new Error('File not found');
                const data = await response.json();
                if (Array.isArray(data)) setAffixes(data);
                else if (data.affixes) setAffixes(data.affixes);
                
                showToast(`📥 成功載入：${BUILT_IN_PRESETS[builtInCat].name} - ${presetData.name}`);
            } catch (error) { 
                // 檔案不存在時不會再中斷程式，只會跳出這個溫馨提示
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

    const evaluateSetScore = (testSet, affixList) => {
        const mods = getModifiers(testSet);
        const evaluated = calculateAffixesChances(affixList, mods);
        let score = 0;
        evaluated.forEach(affix => {
            if (affix.category === 'target') score += affix.chance * 1000;
            else if (affix.category === 'acceptable') score += affix.chance * 100;
            else if (affix.category === 'unwanted') score -= affix.chance * 1000;
        });
        score -= getCost(testSet) * 0.1;
        return score;
    };

    const runOptimization = () => {
        setIsOptimizing(true);
        setTimeout(() => {
            let bestScore = -Infinity;
            let bestSet = new Set(['start']);
            const A_opts = [null, 'A1', 'A2', 'A3', 'A4', 'A5'];
            const B_opts = [null, 'B1', 'B2', 'B3', 'B4'];
            const C_opts = [null, 'C1', 'C2', 'C3', 'C4', 'C5'];
            const L_opts = [null, 'L1', 'L2', 'L3', 'L4', 'L5'];
            const M_opts = [null, 'M1', 'M2', 'M3', 'M4'];
            const N_opts = [null, 'N1', 'N2', 'N3', 'N4', 'N5'];

            for (let a of A_opts) { for (let b of B_opts) { for (let c of C_opts) {
            for (let l of L_opts) { for (let m of M_opts) { for (let n of N_opts) {
                let testSet = new Set(['start']);
                if (a || b || c) { testSet.add('a'); testSet.add('b'); testSet.add('c'); }
                if (a) { testSet.add('d'); testSet.add('A'); testSet.add(a); }
                if (b) { testSet.add('e'); testSet.add('B'); testSet.add(b); }
                if (c) { testSet.add('f'); testSet.add('C'); testSet.add(c); }
                if (l || m || n) { testSet.add('g'); testSet.add('j'); }
                if (l) { testSet.add('k'); testSet.add('L'); testSet.add(l); }
                if (m) { testSet.add('m'); testSet.add('M'); testSet.add(m); }
                if (n) { testSet.add('n'); testSet.add('N'); testSet.add(n); }

                const cost = getCost(testSet);
                if (cost <= 20) {
                    const score = evaluateSetScore(testSet, affixes);
                    if (score > bestScore) {
                        bestScore = score;
                        bestSet = testSet;
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
                    if (currentCost + node.cost <= 20) {
                        finalSet.add(id);
                        currentCost += node.cost;
                        addedAny = true;
                    }
                }
            }
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
                if (Array.isArray(importedData)) setAffixes(importedData);
                else if (importedData.affixes && Array.isArray(importedData.affixes)) setAffixes(importedData.affixes);
                showToast("✅ 成功匯入詞綴資料！");
            } catch (err) { showToast("❌ 檔案格式錯誤。"); }
            event.target.value = null;
        };
        reader.readAsText(file);
    };

    const handleBulkImport = async (event) => {
        const files = event.target.files;
        if (!files.length) return;
        let newPresets = { ...savedPresets };
        let count = 0;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const data = JSON.parse(await file.text());
                newPresets[file.name.replace('.json', '')] = data;
                count++;
            } catch(e) {}
        }
        setSavedPresets(newPresets);
        localStorage.setItem('poe_genesis_presets', JSON.stringify(newPresets));
        showToast(`📂 成功將 ${count} 個檔案加入個人預設庫！`);
        event.target.value = null;
    };

    const handleLoadPreset = (presetName) => {
        const data = savedPresets[presetName];
        if (data) {
            if (Array.isArray(data)) setAffixes(data);
            else if (data.affixes) setAffixes(data.affixes);
            showToast(`✨ 已載入個人預設：${presetName}`);
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
                            {/* --- 修正：使用 items-start 避免 Flexbox 裁切超出畫面的地圖 --- */}
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
                                                <div className="absolute bottom-full mb-2 hidden group-hover:block whitespace-nowrap bg-slate-900 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 pointer-events-none z-50">
                                                    <span className="font-bold text-purple-400">{id}</span>: {node.name}
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
                    
                    {/* ========================================== */}
                    {/* 🛠️ 智慧做裝顧問面板 */}
                    {/* ========================================== */}
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
                                    {Object.entries(BUILT_IN_PRESETS[builtInCat].attributes).map(([attrKey, attrData]) => (
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

                    {/* 前綴區域 */}
                    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                            <h2 className="text-base font-semibold text-blue-300 flex items-center gap-2"><ShieldAlert size={16}/> 前綴 (Prefixes)</h2>
                            <button type="button" onClick={() => addAffix('prefix')} className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/40 px-2 py-1 rounded flex items-center gap-1 transition-colors"><Plus size={14}/> 新增前綴</button>
                        </div>
                        <div className="space-y-2">{calculatedAffixes.filter(a => a.type === 'prefix').map(affix => (<AffixRow key={affix.id} affix={affix} updateAffix={updateAffix} removeAffix={removeAffix} />))}</div>
                    </div>

                    {/* 後綴區域 */}
                    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                            <h2 className="text-base font-semibold text-red-300 flex items-center gap-2"><ShieldAlert size={16}/> 後綴 (Suffixes)</h2>
                            <button type="button" onClick={() => addAffix('suffix')} className="text-xs bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/40 px-2 py-1 rounded flex items-center gap-1 transition-colors"><Plus size={14}/> 新增後綴</button>
                        </div>
                        <div className="space-y-2">{calculatedAffixes.filter(a => a.type === 'suffix').map(affix => (<AffixRow key={affix.id} affix={affix} updateAffix={updateAffix} removeAffix={removeAffix} />))}</div>
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
