import { TREE_DATA } from '../data/treeData.js';

export const TreeNode = ({ nodeId, depth = 0, activeNodes, toggleNode }) => {
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
