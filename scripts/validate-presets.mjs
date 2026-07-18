import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PRESETS_DIR = path.join(ROOT, 'public', 'presets');
const VALID_TYPES = new Set(['prefix', 'suffix']);
const VALID_CATEGORIES = new Set(['neutral', 'target', 'acceptable', 'unwanted']);

const files = fs.readdirSync(PRESETS_DIR).filter(file => file.endsWith('.json')).sort();
const errors = [];
let rowCount = 0;

for (const file of files) {
    const filePath = path.join(PRESETS_DIR, file);
    let rows;

    try {
        rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        errors.push(`${file}: JSON 無法解析（${error.message}）`);
        continue;
    }

    if (!Array.isArray(rows)) {
        errors.push(`${file}: 根層必須是陣列`);
        continue;
    }

    const ids = new Set();
    rows.forEach((row, index) => {
        const location = `${file}[${index}]`;
        rowCount += 1;

        if (!row || typeof row !== 'object' || Array.isArray(row)) {
            errors.push(`${location}: 必須是物件`);
            return;
        }
        if (typeof row.id !== 'string' || row.id.length === 0) errors.push(`${location}: id 必須是非空字串`);
        else if (ids.has(row.id)) errors.push(`${location}: id ${row.id} 在檔案內重複`);
        else ids.add(row.id);

        if (!VALID_TYPES.has(row.type)) errors.push(`${location}: type 必須是 prefix 或 suffix`);
        if (typeof row.name !== 'string' || row.name.length === 0) errors.push(`${location}: name 必須是非空字串`);
        if (typeof row.tags !== 'string') errors.push(`${location}: tags 必須是字串`);
        if (!Number.isFinite(Number(row.baseWeight)) || Number(row.baseWeight) < 0) errors.push(`${location}: baseWeight 必須是非負數字`);
        if (!VALID_CATEGORIES.has(row.category)) errors.push(`${location}: category 無效`);
    });
}

if (errors.length > 0) {
    console.error(`預設資料驗證失敗，共 ${errors.length} 個問題：`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log(`預設資料驗證通過：${files.length} 個檔案、${rowCount} 筆詞綴。`);
}
