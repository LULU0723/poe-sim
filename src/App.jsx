import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2, ShieldAlert, GitMerge, Settings2, Wand2, Upload, Download, Map as MapIcon, List, Target, FolderOpen, Unlock, Lock, RotateCcw, ZoomIn, ZoomOut, Database, CheckSquare, Zap, Target as TargetIcon } from 'lucide-react';

import { AffixRow } from './components/AffixRow.jsx';
import { AssumptionsPanel } from './components/AssumptionsPanel.jsx';
import { TreeNode } from './components/TreeNode.jsx';
import { BUILT_IN_PRESETS, BASE_STRATEGIES } from './data/presets.js';
import { EQUIPMENT_MAX_POINTS, INITIAL_COORDS, TREE_DATA } from './data/treeData.js';
import { optimizeTree } from './domain/optimizer.js';
import { calculateAffixChances } from './domain/probability.js';
import { getCost, getDescendants, getModifiers } from './domain/tree.js';

const readStoredJson = (key, fallbackValue) => {
    if (typeof localStorage === 'undefined') return fallbackValue;
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : fallbackValue;
    } catch (error) {
        console.warn(`Failed to parse ${key} from localStorage:`, error);
        return fallbackValue;
    }
};

export default function App() {
    const [activeNodes, setActiveNodes] = useState(new Set(['start'])); 
    const [affixes, setAffixes] = useState([]);
    const [toast, setToast] = useState('');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [viewMode, setViewMode] = useState('map'); 
    const [savedPresets, setSavedPresets] = useState(() => readStoredJson('poe_genesis_presets', {}));
    
    // 內建資料庫與策略顧問狀態
    const [builtInCat, setBuiltInCat] = useState('Helmet');
    const [builtInAttr, setBuiltInAttr] = useState('str');
    const [showAdvisor, setShowAdvisor] = useState(false);
    const [showAssumptions, setShowAssumptions] = useState(false);

    // 拖曳排序狀態
    const [dragId, setDragId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);

    const [zoom, setZoom] = useState(1);
    const [coords, setCoords] = useState(() => ({
        ...INITIAL_COORDS,
        ...readStoredJson('poe_genesis_coords', {})
    }));
    const [nodePrefs, setNodePrefs] = useState({ D: 0, E: 0, F: 0, K: 0 });
    const [optimizeWarnings, setOptimizeWarnings] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [draggingNode, setDraggingNode] = useState(null);
    const mapRef = useRef(null);
    const fileInputRef = useRef(null);
    const bulkInputRef = useRef(null);
    const toastTimerRef = useRef(null);

    useEffect(() => {
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
            
            setActiveNodes(() => {
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
            } catch {
                showToast(`⚠️ 詞綴庫尚未建檔！但已為您切換天賦基底與策略。`); 
            }
        } else { 
            showToast("⚠️ 此基底尚未設定檔案路徑！"); 
        }
    };

    const pointsUsed = useMemo(() => getCost(activeNodes), [activeNodes]);

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
            if (getCost(next) + node.cost > EQUIPMENT_MAX_POINTS) {
                showToast(`已達最高 ${EQUIPMENT_MAX_POINTS} 點限制！`);
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

    const currentModifiers = useMemo(() => getModifiers(activeNodes), [activeNodes]);
    const calculatedAffixes = useMemo(() => calculateAffixChances(affixes, currentModifiers), [affixes, currentModifiers]);

    const runOptimization = () => {
        if (isOptimizing) return;

        setIsOptimizing(true);
        setOptimizeWarnings([]);
        setTimeout(() => {
            try {
                const result = optimizeTree({
                    activeNodes,
                    affixes,
                    preferences: nodePrefs
                });
                setOptimizeWarnings(result.warnings);
                setActiveNodes(result.activeNodes);
                showToast("✨ 最佳化完成！已為您搭配出最高權重的天賦路徑。");
            } catch (error) {
                console.error(error);
                showToast("⚠️ 最佳化失敗，請檢查詞綴資料後再試一次。");
            } finally {
                setIsOptimizing(false);
            }
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
            } catch { showToast("❌ 檔案格式錯誤。"); }
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
            } catch {
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
                        <GitMerge className="shrink-0" />
                        <span className="min-w-0">Path of Exile 3.29 創生之樹｜策略最佳化模擬器</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">依照 16 點上限規劃路線、模擬詞綴權重，並一鍵找出評分最高的配置。</p>
                </div>
                
                <div className="flex flex-wrap justify-center items-center gap-3 bg-slate-900 p-2 lg:p-3 rounded-lg border border-slate-800 shadow-inner">
                    <div className="flex bg-slate-950 rounded border border-slate-700 overflow-hidden mr-2">
                        <button onClick={() => setViewMode('map')} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><MapIcon size={14}/> 視覺地圖</button>
                        <button onClick={() => setViewMode('list')} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><List size={14}/> 結構清單</button>
                    </div>
                    <div className="flex items-center gap-2"><Settings2 className="text-slate-400" size={18} /><span className="text-slate-300 text-sm font-medium">點數:</span><span className={`text-lg font-mono font-bold ${pointsUsed === EQUIPMENT_MAX_POINTS ? 'text-red-400' : 'text-purple-400'}`}>{pointsUsed}/{EQUIPMENT_MAX_POINTS}</span></div>
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
                                        const nodeX = coords[id]?.x ?? node.x;
                                        const nodeY = coords[id]?.y ?? node.y;
                                        const tipPos = nodeX < 25
                                            ? "left-full ml-2 top-0"    // 左側節點 → tooltip 往右
                                            : nodeX > 78
                                            ? "right-full mr-2 top-0"   // 右側節點 → tooltip 往左
                                            : nodeY < 22
                                            ? "top-full mt-2 left-0"    // 頂部節點 → tooltip 往下
                                            : "bottom-full mb-2 left-0"; // 預設 → tooltip 往上
                                        return (
                                            <div key={id} className={nodeClass} style={{ left: `${nodeX}%`, top: `${nodeY}%`, cursor: isEditMode ? (draggingNode === id ? 'grabbing' : 'grab') : (canActivate ? 'pointer' : 'not-allowed') }} onPointerDown={(e) => { if (isEditMode) { e.stopPropagation(); setDraggingNode(id); } else if (canActivate) { toggleNode(id); } }}>
                                                <span className={`font-bold select-none ${id === 'start' ? 'text-xs' : 'text-[9px]'} ${isActive ? 'text-white' : 'text-slate-300'}`}>{id === 'start' ? '起' : id}</span>
                                                <div className={`absolute ${tipPos} hidden group-hover:block bg-slate-900 text-slate-200 text-xs px-2 py-1.5 rounded border border-slate-700 pointer-events-none z-50 max-w-[200px] whitespace-normal`}>
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

                    <AssumptionsPanel
                        isOpen={showAssumptions}
                        onToggle={() => setShowAssumptions(value => !value)}
                    />

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
                                <p className="text-[11px] text-yellow-500/80 mb-3 leading-relaxed">
                                    此顧問只處理屬性需求基底的相對偏向；3.29 的高階基底傾向因官方未公布數值，暫不納入計算。
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
