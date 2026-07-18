import { Info } from 'lucide-react';

export const AssumptionsPanel = ({ isOpen, onToggle }) => (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 shadow-sm">
        <button
            type="button"
            onClick={onToggle}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-900/80 rounded-xl transition-colors"
        >
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Info size={15} className="text-slate-400 shrink-0" /> 模擬依據與限制
                <span className="hidden sm:inline text-[11px] text-slate-500 font-normal">（區分官方資料、模型假設與未模擬項目）</span>
            </span>
            <span className={`text-slate-500 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {isOpen && (
            <div className="px-4 pb-4 pt-2 border-t border-slate-800 text-xs text-slate-400 leading-relaxed space-y-3">
                <div>
                    <p className="font-semibold text-emerald-400 mb-1">✓ 3.29 已確認並套用</p>
                    <ul className="list-disc list-outside ml-4 space-y-1">
                        <li>裝備分支上限 16 點、額外裝備小天賦 25%、指定詞綴類型核心天賦 +300%。</li>
                        <li>基底原本無法產生的詞綴，其基礎權重仍為 0，不會因機率加成而出現。</li>
                    </ul>
                </div>
                <div>
                    <p className="font-semibold text-yellow-400 mb-1">△ 模型假設（待實測）</p>
                    <ul className="list-disc list-outside ml-4 space-y-1">
                        <li>同一詞綴命中多個標籤時採相加：+300% + +300% = 7 倍；−60% + −60% 會降至 0。</li>
                        <li>詞綴基礎權重沿用 PoEDB 的一般物品權重表。</li>
                        <li>策略顧問假設六種屬性需求基底的初始權重相同；這不包含 3.29 已確認的高階基底偏向。</li>
                    </ul>
                </div>
                <div>
                    <p className="font-semibold text-sky-400 mb-1">○ 目前未模擬</p>
                    <ul className="list-disc list-outside ml-4 space-y-1">
                        <li>官方未公布數值的內建詞綴階級降低、高階基底偏向，以及較低的內建額外裝備機率。</li>
                        <li>珠寶基底分布、完整多詞綴生成、同群組互斥、前後綴數量與聯合出現機率。</li>
                        <li>面板百分比只代表「抽取一條前綴或後綴時」抽中該詞綴的相對機率。</li>
                    </ul>
                </div>
            </div>
        )}
    </div>
);
