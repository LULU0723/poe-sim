// 內建預設曾使用不同的中文標籤名稱；在計算前統一成天賦樹採用的標籤。
const TAG_EXPANSIONS = {
    '能力': ['屬性'],
    '法術': ['施法'],
    '攻擊速度': ['攻擊', '速度']
};

export const normalizeAffixTags = (rawTags) => {
    const tags = String(rawTags || '').split(/[,，、]+/).map(tag => tag.trim()).filter(Boolean);
    return [...new Set(tags.flatMap(tag => TAG_EXPANSIONS[tag] || [tag]))];
};
