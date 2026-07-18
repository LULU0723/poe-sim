import { GripVertical, Trash2 } from 'lucide-react';

// ==========================================
// 💡 更新：AffixRow 加入拖曳支援
// ==========================================
export const AffixRow = ({ affix, updateAffix, removeAffix, onDragStart, onDragEnter, onDragOver, onDrop, onDragEnd, isDragging, isDragOver }) => (
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
