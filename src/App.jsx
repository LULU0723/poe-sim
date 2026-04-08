import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Trash2, ShieldAlert, GitMerge, Settings2, Info, Wand2, Upload, Download, Map as MapIcon, List, Target, FolderOpen } from 'lucide-react';

// --- 天賦樹靜態數據 (座標已根據 1083x951 原圖精確校準) ---
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
    'g1': { name: 'g1 (-85%智)', cost: 1, req: 'g', x: 58.5, y: 65.2 },
    'g2': { name: 'g2 (+300%智)', cost: 1, req: 'g', x: 68.6, y: 62.9 },
    'g3': { name: 'g3 (+300%敏)', cost: 1, req: 'g', x: 72.5, y: 71.4 },
    'g4': { name: 'g4 (-85%敏)', cost: 1, req: 'g', x: 69.1, y: 79.7 },
    'g5': { name: 'g5 (-85%力)', cost: 1, req: 'g', x: 60.6, y: 79.5 },
    'g6': { name: 'g6 (+300%力)', cost: 1, req: 'g', x: 56.3, y: 72.3 },
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

const DEFAULT_AFFIXES = [
    { id: '1', type: 'prefix', name: '最大生命', tags: '生命', baseWeight: 9000, category: 'target' },
    { id: '2', type: 'prefix', name: '最大魔力', tags: '魔力', baseWeight: 12000, category: 'unwanted' },
    { id: '3', type: 'prefix', name: '移動速度', tags: '速度', baseWeight: 6000, category: 'target' },
    { id: '4', type: 'prefix', name: '閃避與能量護盾', tags: '防禦', baseWeight: 7000, category: 'neutral' },
    { id: '5', type: 'suffix', name: '敏捷', tags: '屬性', baseWeight: 4500, category: 'unwanted' },
    { id: '6', type: 'suffix', name: '智慧', tags: '屬性', baseWeight: 4500, category: 'unwanted' },
    { id: '7', type: 'suffix', name: '火焰抗性', tags: '元素, 抗性, 火焰', baseWeight: 8000, category: 'neutral' },
    { id: '8', type: 'suffix', name: '冰冷抗性', tags: '元素, 抗性, 冰冷', baseWeight: 8000, category: 'neutral' },
    { id: '9', type: 'suffix', name: '閃電抗性', tags: '元素, 抗性, 閃電', baseWeight: 8000, category: 'neutral' },
    { id: '10', type: 'suffix', name: '混沌抗性', tags: '混沌, 抗性', baseWeight: 1500, category: 'target' },
    { id: '11', type: 'suffix', name: '壓抑法術傷害率', tags: '', baseWeight: 2500, category: 'target' },
    { id: '12', type: 'suffix', name: '暈眩恢復', tags: '', baseWeight: 6000, category: 'neutral' }
];

const AffixRow = ({ affix, updateAffix, removeAffix }) => (
    <div className={`flex items-center gap-2 mb-2 p-2 rounded-lg border shadow-sm text-sm transition-colors ${
        affix.category === 'target' ? 'bg-green-900/20 border-green-800/50' :
        affix.category === 'acceptable' ? 'bg-blue-900/20 border-blue-800/50' :
        affix.category === 'unwanted' ? 'bg-red-900/20 border-red-800/50' :
        'bg-slate-800 border-slate-700'
    }`}>
        <select
            value={affix.category}
            onChange={(e) => updateAffix(affix.id, 'category', e.target.value)}
            className={`w-28 border rounded px-1 py-1.5 text-xs font-bold outline-none cursor-pointer ${
                affix.category === 'target' ? 'bg-green-950 text-green-400 border-green-700' :
                affix.category === 'acceptable' ? 'bg-blue-950 text-blue-400 border-blue-700' :
                affix.category === 'unwanted' ? 'bg-red-950 text-red-400 border-red-700' :
                'bg-slate-900 text-slate-400 border-slate-600'
            }`}
        >
            <option value="neutral">➖ 無 (Neutral)</option>
            <option value="target">🎯 目標詞</option>
            <option value="acceptable">✅ 可接受</option>
            <option value="unwanted">❌ 不想要</option>
        </select>

        <input 
            value={affix.name} 
            onChange={(e) => updateAffix(affix.id, 'name', e.target.value)}
            className="w-1/4 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200" 
            placeholder="詞綴名稱"
        />
        <input 
            value={affix.tags} 
            onChange={(e) => updateAffix(affix.id, 'tags', e.target.value)}
            className="w-1/4 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200" 
            placeholder="標籤(支援頓號分隔)"
        />
        <input 
            type="number" 
            value={affix.baseWeight} 
            onChange={(e) => updateAffix(affix.id, 'baseWeight', Number(e.target.value))}
            className="w-20 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200 text-right" 
        />
        
        <div className="flex-1 flex items-center justify-end gap-3 text-slate-300 px-2">
            <span className="w-16 text-right font-mono" title={`倍率: ${affix.multiplier.toFixed(1)}x`}>
                {affix.currentWeight}
            </span>
            <span className={`w-16 text-right font-mono font-bold ${
                affix.chance >= 20 ? 'text-green-400' : 
                affix.chance > 0 ? 'text-blue-300' : 'text-slate-600'
            }`}>
                {affix.chance.toFixed(2)}%
            </span>
        </div>
        
        <button onClick={() => removeAffix(affix.id)} className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded transition-colors">
            <Trash2 size={16} />
        </button>
    </div>
);

// 傳統清單節點組件
const TreeNode = ({ nodeId, depth = 0, activeNodes, toggleNode }) => {
    const node = TREE_DATA[nodeId];
    if (!node) return null; // 防護機制：節點不存在時不渲染

    const isActive = activeNodes.has(nodeId);
    const canActivate = nodeId === 'start' || activeNodes.has(node.req);

    let bgClass = isActive ? 'bg-purple-600 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'bg-slate-800 border-slate-600 hover:bg-slate-700';
    if (!canActivate && !isActive) bgClass = 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed';
    if (nodeId === 'start') bgClass = 'bg-blue-600 border-blue-400 font-bold shadow-[0_0_10px_rgba(59,130,246,0.4)]';

    return (
        <div className="flex flex-col relative">
            <div 
                className={`flex items-center w-fit px-3 py-1.5 my-1 rounded-md border-2 transition-all ${bgClass} ${canActivate ? 'cursor-pointer' : ''}`}
                onClick={() => canActivate && toggleNode(nodeId)}
            >
                <span className="text-sm text-slate-100">{node.name}</span>
                {node.mods && isActive && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-purple-300 font-bold border border-purple-800">
                       生效中
                    </span>
                )}
            </div>
            {node.children && (
                <div className="flex flex-col pl-6 ml-4 border-l-2 border-slate-700">
                    {node.children.map(childId => (
                        <TreeNode key={childId} nodeId={childId} depth={depth + 1} activeNodes={activeNodes} toggleNode={toggleNode} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function App() {
    const [activeNodes, setActiveNodes] = useState(new Set(['start', 'a', 'G', 'G5'])); // 預設點亮鞋子
    const [affixes, setAffixes] = useState(DEFAULT_AFFIXES);
    const [toast, setToast] = useState('');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [viewMode, setViewMode] = useState('map'); // 'list' 或 'map'
    const [savedPresets, setSavedPresets] = useState({}); // 新增：儲存預設檔的 state
    const fileInputRef = useRef(null);
    const bulkInputRef = useRef(null); // 新增：批次匯入的 ref

    // --- 新增：初始化載入本地預設庫 ---
    useEffect(() => {
        const loaded = localStorage.getItem('poe_genesis_presets');
        if (loaded) {
            try {
                setSavedPresets(JSON.parse(loaded));
            } catch (e) {
                console.error("載入預設失敗");
            }
        }
    }, []);

    // --- 安全的輔助讀取函數 (防護機制升級) ---
    const getDescendants = (nodeId) => {
        let descendants = [];
        const node = TREE_DATA[nodeId];
        if (node && node.children) {
            for (let childId of node.children) {
                descendants.push(childId);
                descendants = descendants.concat(getDescendants(childId));
            }
        }
        return descendants;
    };

    const getCost = (nodeSet) => {
        let total = 0;
        if (!nodeSet) return 0;
        nodeSet.forEach(id => {
            const node = TREE_DATA[id];
            if (node && typeof node.cost === 'number') {
                total += node.cost;
            }
        });
        return total;
    };
    
    const pointsUsed = useMemo(() => getCost(activeNodes), [activeNodes]);

    const hasMutex = (nodeSet, mutexName) => {
        if (!nodeSet) return false;
        for (let id of nodeSet) {
            const node = TREE_DATA[id];
            if (node && node.mutex === mutexName) return true;
        }
        return false;
    };

    // 自動推導目前的目標基底 (用於下拉選單顯示)
    const currentBase = useMemo(() => {
        const bases = ['G1', 'G2', 'G3', 'G4', 'G5', 'H1', 'H2', 'H3', 'i'];
        for (let b of bases) {
            if (activeNodes.has(b)) return b;
        }
        return 'none';
    }, [activeNodes]);

    // 切換目標裝備基底
    const handleBaseChange = (newBase) => {
        setActiveNodes(prev => {
            const next = new Set(prev);
            
            // 先清除所有基底節點
            const bases = ['G1', 'G2', 'G3', 'G4', 'G5', 'H1', 'H2', 'H3', 'i'];
            bases.forEach(b => next.delete(b));

            if (newBase !== 'none' && TREE_DATA[newBase]) {
                // 加入新基底，並自動往上尋找所有前置節點把它們點亮
                next.add(newBase);
                let curr = TREE_DATA[newBase];
                while(curr && curr.req && TREE_DATA[curr.req]) {
                    next.add(curr.req);
                    curr = TREE_DATA[curr.req];
                }
            }
            return next;
        });
    };

    const toggleNode = (nodeId) => {
        if (nodeId === 'start') return; 

        setActiveNodes(prev => {
            const next = new Set(prev);
            const node = TREE_DATA[nodeId];
            if (!node) return prev; // 防護機制

            if (next.has(nodeId)) {
                next.delete(nodeId);
                const descendants = getDescendants(nodeId);
                descendants.forEach(d => next.delete(d));
            } else {
                if (node.req && !next.has(node.req)) {
                    showToast(`請先點選前置節點: ${TREE_DATA[node.req]?.name || node.req}`);
                    return prev;
                }
                if (pointsUsed + node.cost > 20) {
                    showToast('已達最高 20 點限制！');
                    return prev;
                }
                if (node.mutex) {
                    let conflictRemoved = false;
                    for (let activeId of next) {
                        const activeNode = TREE_DATA[activeId];
                        if (activeId !== nodeId && activeNode && activeNode.mutex === node.mutex) {
                            next.delete(activeId);
                            const descendants = getDescendants(activeId);
                            descendants.forEach(d => next.delete(d));
                            conflictRemoved = true;
                        }
                    }
                }
                next.add(nodeId);
            }
            return next;
        });
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const getModifiers = (nodeSet) => {
        const mods = {};
        if (!nodeSet) return mods;
        nodeSet.forEach(id => {
            const node = TREE_DATA[id];
            if (node && node.mods) {
                for (const [tag, val] of Object.entries(node.mods)) {
                    mods[tag] = (mods[tag] || 0) + val;
                }
            }
        });
        return mods;
    };
    const currentModifiers = useMemo(() => getModifiers(activeNodes), [activeNodes]);

    const calculateAffixesChances = (affixList, mods) => {
        let preTotal = 0; let sufTotal = 0;
        const results = affixList.map(affix => {
            let multiplier = 1.0;
            const affixTags = affix.tags.split(/[,，、]+/).map(t => t.trim()).filter(t => t);
            affixTags.forEach(tag => {
                if (mods[tag]) multiplier += mods[tag];
            });
            multiplier = Math.max(0, multiplier);
            const currentWeight = Math.floor(affix.baseWeight * multiplier);

            if (affix.type === 'prefix') preTotal += currentWeight;
            if (affix.type === 'suffix') sufTotal += currentWeight;

            return { ...affix, currentWeight, multiplier };
        });

        return results.map(affix => {
            const total = affix.type === 'prefix' ? preTotal : sufTotal;
            const chance = total === 0 ? 0 : (affix.currentWeight / total) * 100;
            return { ...affix, chance };
        });
    };
    const calculatedAffixes = useMemo(() => calculateAffixesChances(affixes, currentModifiers), [affixes, currentModifiers]);

    const evaluateSetScore = (nodeSet, affixList) => {
        const mods = getModifiers(nodeSet);
        const evaluated = calculateAffixesChances(affixList, mods);
        let score = 0;
        evaluated.forEach(affix => {
            if (affix.category === 'target') score += affix.chance * 1000;
            else if (affix.category === 'acceptable') score += affix.chance * 100;
            else if (affix.category === 'unwanted') score -= affix.chance * 1000;
        });
        score -= getCost(nodeSet) * 0.1;
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
                    if (!node) continue; // 防護機制
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
        const dataToExport = {
            base: currentBase,
            affixes: affixes
        };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `poe_genesis_${currentBase !== 'none' ? currentBase : 'affixes'}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("💾 詞綴與基底設定已匯出！");
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    setAffixes(importedData);
                    showToast("✅ 成功匯入詞綴資料！");
                } else if (importedData.affixes && Array.isArray(importedData.affixes)) {
                    setAffixes(importedData.affixes);
                    if (importedData.base) handleBaseChange(importedData.base);
                    showToast(`✅ 成功匯入設定，已自動切換基底！`);
                } else {
                    throw new Error("Invalid format");
                }
            } catch (err) {
                showToast("❌ 檔案格式錯誤。");
            }
            event.target.value = null;
        };
        reader.readAsText(file);
    };

    // --- 新增：批次匯入多個 JSON 成為預設檔 ---
    const handleBulkImport = async (event) => {
        const files = event.target.files;
        if (!files.length) return;
        
        let newPresets = { ...savedPresets };
        let count = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const text = await file.text();
            try {
                const data = JSON.parse(text);
                const presetName = file.name.replace('.json', ''); // 用檔名當作預設名稱
                newPresets[presetName] = data;
                count++;
            } catch(e) {
                console.error("無法解析檔案: ", file.name);
            }
        }

        setSavedPresets(newPresets);
        localStorage.setItem('poe_genesis_presets', JSON.stringify(newPresets));
        showToast(`📂 成功將 ${count} 個檔案加入預設庫！`);
        event.target.value = null;
    };

    // --- 新增：載入選擇的預設檔 ---
    const handleLoadPreset = (presetName) => {
        if (!presetName || !savedPresets[presetName]) return;
        const data = savedPresets[presetName];
        
        if (Array.isArray(data)) {
            setAffixes(data);
        } else if (data.affixes) {
            setAffixes(data.affixes);
            if (data.base) handleBaseChange(data.base);
        }
        showToast(`✨ 已載入預設：${presetName}`);
    };

    // --- 新增：刪除單一預設檔 ---
    const handleDeletePreset = (presetName) => {
        const newPresets = { ...savedPresets };
        delete newPresets[presetName];
        setSavedPresets(newPresets);
        localStorage.setItem('poe_genesis_presets', JSON.stringify(newPresets));
        showToast(`🗑️ 已刪除預設：${presetName}`);
    };

    const addAffix = (type) => {
        const newId = Date.now().toString();
        setAffixes([...affixes, { id: newId, type, name: '新詞綴', tags: '', baseWeight: 1000, category: 'neutral' }]);
    };
    const updateAffix = (id, field, value) => {
        setAffixes(affixes.map(a => a.id === id ? { ...a, [field]: value } : a));
    };
    const removeAffix = (id) => {
        setAffixes(affixes.filter(a => a.id !== id));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 lg:p-8 font-sans selection:bg-purple-900">
            {toast && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-600 text-slate-100 px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce flex items-center gap-2">
                    {toast}
                </div>
            )}

            <header className="mb-6 pb-4 border-b border-slate-800 flex flex-col xl:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 flex items-center gap-2">
                        <GitMerge /> 創世之樹 策略最佳化模擬器
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        支援原圖 UI 熱區點擊與演算法最佳化配置
                    </p>
                </div>
                
                <div className="flex flex-wrap justify-center items-center gap-3 bg-slate-900 p-2 lg:p-3 rounded-lg border border-slate-800 shadow-inner">
                    
                    {/* --- 新增：目標基底選擇器 --- */}
                    <div className="flex items-center gap-2 bg-slate-950 rounded border border-slate-700 px-3 py-1.5 shadow-sm">
                        <Target className="text-purple-400" size={16} />
                        <span className="text-slate-400 text-xs font-bold hidden sm:inline">目標基底:</span>
                        <select
                            value={currentBase}
                            onChange={(e) => handleBaseChange(e.target.value)}
                            className="bg-transparent text-slate-100 text-sm font-bold outline-none cursor-pointer focus:ring-0"
                        >
                            <option value="none" className="bg-slate-900 text-slate-300">不指定 (Any)</option>
                            <optgroup label="防具 (Armour)" className="bg-slate-800 text-slate-400">
                                <option value="G1" className="text-slate-200">🛡️ 護盾 (Shield)</option>
                                <option value="G2" className="text-slate-200">🪖 頭盔 (Helmet)</option>
                                <option value="G3" className="text-slate-200">🦺 胸甲 (Body Armour)</option>
                                <option value="G4" className="text-slate-200">🧤 手套 (Gloves)</option>
                                <option value="G5" className="text-slate-200">🥾 鞋子 (Boots)</option>
                            </optgroup>
                            <optgroup label="飾品 (Jewellery)" className="bg-slate-800 text-slate-400">
                                <option value="H1" className="text-slate-200">📿 護身符 (Amulet)</option>
                                <option value="H2" className="text-slate-200">💍 戒指 (Ring)</option>
                                <option value="H3" className="text-slate-200">🧵 腰帶 (Belt)</option>
                            </optgroup>
                            <optgroup label="其他" className="bg-slate-800 text-slate-400">
                                <option value="i" className="text-slate-200">💎 珠寶 (Jewel)</option>
                            </optgroup>
                        </select>
                    </div>

                    <div className="h-5 w-px bg-slate-700 mx-1 hidden sm:block"></div>

                    {/* UI 切換按鈕 */}
                    <div className="flex bg-slate-950 rounded border border-slate-700 overflow-hidden mr-2">
                        <button 
                            onClick={() => setViewMode('map')}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                        >
                            <MapIcon size={14}/> 視覺地圖
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                        >
                            <List size={14}/> 結構清單
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Settings2 className="text-slate-400" size={18} />
                        <span className="text-slate-300 text-sm font-medium">點數:</span>
                        <span className={`text-lg font-mono font-bold ${pointsUsed === 20 ? 'text-red-400' : 'text-purple-400'}`}>
                            {pointsUsed}/20
                        </span>
                    </div>
                    
                    <div className="h-5 w-px bg-slate-700 mx-1 hidden xl:block"></div>

                    <button 
                        onClick={runOptimization}
                        disabled={isOptimizing}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-bold shadow-lg transition-all ${
                            isOptimizing ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-900/30 hover:scale-105'
                        }`}
                    >
                        <Wand2 size={14} className={isOptimizing ? "animate-spin" : ""} /> 
                        最佳化
                    </button>

                    <div className="flex gap-1">
                        <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-2 py-1.5 rounded" title="匯入 JSON">
                            <Upload size={14} /> 匯入
                        </button>
                        <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
                        <button onClick={handleExport} className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-2 py-1.5 rounded" title="匯出 JSON">
                            <Download size={14} /> 匯出
                        </button>
                    </div>

                    <button 
                        onClick={() => setActiveNodes(new Set(['start']))}
                        className="text-xs bg-slate-800 hover:bg-red-900 border border-slate-600 text-slate-300 hover:text-white px-2 py-1.5 rounded transition-colors"
                    >
                        重置
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 左側：天賦樹分配器 (地圖模式 or 清單模式) */}
                <div className="lg:col-span-6 xl:col-span-6 bg-slate-900/50 rounded-xl border border-slate-800 p-2 overflow-hidden flex flex-col h-[80vh]">
                    <h2 className="text-lg font-semibold text-purple-300 mb-2 px-2 flex items-center justify-between shrink-0">
                        <span>天賦樹 {viewMode === 'map' ? '(視覺地圖)' : '(結構清單)'}</span>
                    </h2>
                    
                    {viewMode === 'map' ? (
                        <div className="flex-1 relative overflow-auto custom-scrollbar bg-slate-950 rounded-lg border border-slate-800 flex justify-center items-center p-2 shadow-inner">
                            {/* 將容器比例由 aspect-[4/3] 修改為精確吻合圖片的 aspect-[1083/951] */}
                            <div className="relative w-full max-w-[800px] aspect-[1083/951] bg-gradient-to-tr from-slate-900 to-slate-950 rounded-lg">
                                {/* SVG 連線繪製層 */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <image href="/tree.jpg" x="0" y="0" width="100" height="100" preserveAspectRatio="none" opacity="0.4" style={{ mixBlendMode: 'screen' }} onError={(e) => e.target.style.display = 'none'} />
                                    {Object.entries(TREE_DATA).map(([id, node]) => {
                                        if (!node || !node.children) return null;
                                        return node.children.map(childId => {
                                            const childNode = TREE_DATA[childId];
                                            if (!childNode) return null;

                                            const isParentActive = activeNodes.has(id);
                                            const isChildActive = activeNodes.has(childId);
                                            const canActivateChild = isParentActive; // 只要父節點亮了，子節點就處於可點擊狀態
                                            
                                            // 決定線條樣式
                                            let strokeClass = "stroke-slate-800";
                                            let strokeWidth = 0.2;
                                            
                                            if (isParentActive && isChildActive) {
                                                strokeClass = "stroke-purple-500 drop-shadow-[0_0_2px_rgba(168,85,247,0.8)]";
                                                strokeWidth = 0.4;
                                            } else if (canActivateChild) {
                                                strokeClass = "stroke-slate-600";
                                                strokeWidth = 0.3;
                                            }

                                            return (
                                                <line 
                                                    key={`${id}-${childId}`}
                                                    x1={node.x} y1={node.y} 
                                                    x2={childNode.x} y2={childNode.y} 
                                                    className={`transition-all duration-300 ${strokeClass}`}
                                                    strokeWidth={strokeWidth}
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                            );
                                        });
                                    })}
                                </svg>

                                {/* 互動節點層 */}
                                {Object.entries(TREE_DATA).map(([id, node]) => {
                                    if (!node) return null;
                                    const isActive = activeNodes.has(id);
                                    const canActivate = id === 'start' || activeNodes.has(node.req);
                                    
                                    // 決定節點外觀
                                    let nodeClass = "absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center border-2 shadow-lg transition-all group ";
                                    if (isActive) nodeClass += "bg-purple-700 border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.8)] z-20 scale-110";
                                    else if (canActivate) nodeClass += "bg-slate-700 border-slate-400 hover:bg-blue-600 hover:border-blue-300 cursor-pointer z-10";
                                    else nodeClass += "bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed z-0";

                                    // 起點特別大
                                    if (id === 'start') nodeClass += isActive ? " !bg-blue-600 !border-blue-300 w-10 h-10 -ml-5 -mt-5" : " w-10 h-10 -ml-5 -mt-5";

                                    return (
                                        <div 
                                            key={id}
                                            className={nodeClass}
                                            style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                            onClick={() => canActivate && toggleNode(id)}
                                        >
                                            {/* 節點內的文字標籤 */}
                                            <span className={`font-bold select-none ${id === 'start' ? 'text-xs' : 'text-[9px]'} ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                                {id === 'start' ? '起' : id}
                                            </span>

                                            {/* Tooltip (滑鼠懸停顯示說明) */}
                                            <div className="absolute bottom-full mb-2 hidden group-hover:block whitespace-nowrap bg-slate-900 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 pointer-events-none z-50">
                                                <span className="font-bold text-purple-400">{id}</span>: {node.name}
                                                {!canActivate && <div className="text-[10px] text-red-400 mt-1">需解鎖前置節點</div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                            <TreeNode nodeId="start" activeNodes={activeNodes} toggleNode={toggleNode} />
                        </div>
                    )}
                </div>

                {/* 右側：詞綴權重計算機 */}
                <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh] custom-scrollbar pr-2">
                    
                    {/* --- 新增：本地預設庫操作區 --- */}
                    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <FolderOpen size={18} className="text-yellow-500 shrink-0" />
                            <span className="font-semibold text-slate-300 text-sm whitespace-nowrap">預設庫:</span>
                            <select 
                                onChange={(e) => {
                                    if(e.target.value) handleLoadPreset(e.target.value);
                                    e.target.value = ""; // 點選完重置，方便下次重複選
                                }} 
                                defaultValue=""
                                className="bg-slate-950 text-slate-200 border border-slate-700 rounded px-2 py-1.5 text-sm outline-none cursor-pointer flex-1 w-full max-w-[200px]"
                            >
                                <option value="" disabled>選擇預設檔...</option>
                                {Object.keys(savedPresets).map(presetName => (
                                    <option key={presetName} value={presetName}>{presetName}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                                onClick={() => bulkInputRef.current.click()} 
                                className="flex-1 sm:flex-none text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-600 text-slate-300 transition-colors whitespace-nowrap"
                            >
                                ➕ 批次匯入 (可多選)
                            </button>
                            <input type="file" multiple accept=".json" ref={bulkInputRef} onChange={handleBulkImport} className="hidden" />
                            
                            {/* 簡易刪除庫存按鈕 */}
                            <button 
                                onClick={() => {
                                    setSavedPresets({});
                                    localStorage.removeItem('poe_genesis_presets');
                                    showToast("🧹 已清空所有預設檔");
                                }}
                                className="text-xs bg-slate-800 hover:bg-red-900 px-2 py-1.5 rounded border border-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
                                title="清空預設庫"
                            >
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    </div>

                    {/* 前綴區域 */}
                    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                            <h2 className="text-base font-semibold text-blue-300 flex items-center gap-2">
                                <ShieldAlert size={16}/> 前綴 (Prefixes)
                            </h2>
                            <button onClick={() => addAffix('prefix')} className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/40 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                                <Plus size={14}/> 新增前綴
                            </button>
                        </div>
                        <div className="flex text-[11px] text-slate-500 mb-2 px-2 font-medium">
                            <div className="w-28 text-center">詞綴策略</div>
                            <div className="w-1/4">名稱</div>
                            <div className="w-1/4">標籤</div>
                            <div className="w-20 text-right">基礎權重</div>
                            <div className="flex-1 text-right flex justify-end gap-3">
                                <span className="w-16">目前</span>
                                <span className="w-16">機率</span>
                            </div>
                            <div className="w-6"></div>
                        </div>
                        <div className="space-y-2">
                            {calculatedAffixes.filter(a => a.type === 'prefix').map(affix => (
                                <AffixRow key={affix.id} affix={affix} updateAffix={updateAffix} removeAffix={removeAffix} />
                            ))}
                        </div>
                    </div>

                    {/* 後綴區域 */}
                    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                            <h2 className="text-base font-semibold text-red-300 flex items-center gap-2">
                                <ShieldAlert size={16}/> 後綴 (Suffixes)
                            </h2>
                            <button onClick={() => addAffix('suffix')} className="text-xs bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/40 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                                <Plus size={14}/> 新增後綴
                            </button>
                        </div>
                        <div className="space-y-2">
                            {calculatedAffixes.filter(a => a.type === 'suffix').map(affix => (
                                <AffixRow key={affix.id} affix={affix} updateAffix={updateAffix} removeAffix={removeAffix} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}} />
        </div>
    );
}