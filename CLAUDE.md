# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 這個專案在做什麼

把 Markdown 內容檔套進 HTML 版型, 用無頭瀏覽器截圖, 輸出成 1080 x 1080 PNG, 給 心之所向 系列社群卡片使用. 詳細背景與設計脈絡見 README.md 與 Develop.md, 這份文件只放操作與架構重點, 不重複那兩份文件已經寫清楚的內容.

## 常用指令

```
npm install
npx playwright install chromium
```

產生 content 資料夾裡所有內容.

```
npm run generate
```

只產生單一檔案, 也可以指向 content.tkd 或其他資料夾.

```
npm run generate -- content/檔名.md
npm run generate -- content.tkd/檔名.md
```

輸出的 PNG 會出現在 output/, 檔名跟來源 Markdown 檔名相同.

package.json 裡的 test 指令只是佔位符, 目前沒有實際測試套件.

## 架構重點

render.js 是唯一的核心引擎, 三段式流程:

1. 用 gray-matter 解析 Markdown 的 frontmatter (`data`) 與內文 (`content`).
2. 依 `data.template` 呼叫 buildView(), 組出對應版型需要的 view 物件, 再用 Mustache 套進 templates/ 底下同名的 .html 檔.
3. 用 Playwright 開一個 1080x1080, deviceScaleFactor 2 的頁面載入渲染後的 HTML, 等字型與網路都就緒後截圖存到 output/.

六種版型共用同一個 render.js 與同一套顏色系統, 差異只在 buildView() 裡各自的分支邏輯, 以及 templates/ 底下對應的 HTML/CSS:

- 成人系列, list / quote / paragraph, 米色底, 磚紅與橄欖綠雙輔色.
- 兒童系列, kids-list / kids-quote / kids-paragraph, 薄荷綠底, 童趣風格, illustration 欄位沒填時預設用 growing.

新增或調整版型時, 修改點通常同時牽涉 buildView() 裡的對應分支跟 templates/ 裡的 HTML/CSS, 兩邊要一起看.

## 插圖 (assets/illustrations) 的處理原則

這是這個專案裡少數刻意不寫死成規則的部分, 選圖需要對內容語意判斷, 每次都要重新判斷, 不能套關鍵字對照表.

判斷順序: 先看 assets/illustrations 現有的 SVG 裡有沒有情境相符的, 有就直接在 frontmatter 填 illustration 欄位引用檔名 (不含副檔名). 沒有貼合的才去 unDraw 或它的開源鏡像倉庫找新的, 確認授權後下載, 用文字取代把主色換成品牌色 (成人系列用磚紅 #C05B3F 或橄欖綠 #6F7F5D, 兒童系列用成長綠 #4CAF6D), 存進 assets/illustrations, 再回頭把 illustration 欄位填上.

quote 版型不支援插圖. render.js 找不到對應 SVG 檔案時會直接丟錯, 不會靜默失敗.
