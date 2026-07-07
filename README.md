# AI Native Card Studio

心之所向系列的 AI 原生卡片產線. 這是一套用 Claude Code 建立的圖文卡片生成工作流, 把排版, 字體, 顏色, 截圖輸出交給程式碼處理, 把挑選插圖這類需要語意判斷的工作交給 AI Agent 處理.

如果想了解這個專案是怎麼透過與 Claude Code 對話一步步建立起來的, 可以參考 Develop.md.

## 這是什麼

這個專案會把一份 Markdown 內容檔, 套進對應的 HTML 版型, 再用無頭瀏覽器截圖, 輸出成 1080 x 1080 的 PNG 圖檔, 適合直接上傳到 Instagram 等社群平台.

整套流程分成兩層. 版面排版, 字體套用, 顏色系統, 圖片截圖輸出, 這一層是固定規則, 交給程式碼處理, 結果穩定又快速. 挑選跟內容情境相符的插圖, 這一層需要理解文字語意, 目前由 Claude Code 依內容判斷, 詳細原因寫在 Develop.md.

## 環境需求

Node.js 與 npm, 專案已經用 v24 測試過.

## 安裝

```
npm install
npx playwright install chromium
```

## 使用方式

一次產生 content 資料夾裡所有內容.

```
npm run generate
```

只產生單一檔案.

```
npm run generate -- content/檔名.md
```

產生的圖檔會輸出到 output 資料夾, 檔名跟來源的 Markdown 檔名相同.

## 專案結構

```
card-generator/
  templates/            六種版型的 HTML 與 CSS
  content/              Markdown 內容檔, 每篇對應一張卡片
  assets/illustrations/ 本機插圖素材庫, SVG 格式
  output/                產生出來的 PNG 圖檔
  render.js             核心引擎, 讀取內容, 套版型, 截圖輸出
  package.json
```

## 版型總覽

專案分成成人與兒童兩個系列, 各三種版型, 共用同一套 render.js 引擎.

### 成人系列

配色是米色底, 磚紅與橄欖綠雙輔色, 標題用襯線字, 走編輯感風格.

list, 重點列表屏. 必填 title, points 陣列, 每筆包含 heading 與 body. 選填 subtitle, eyebrow, series, brand, illustration.

quote, 引言金句屏. 必填 quote 或直接把句子寫在內文區. 選填 author, eyebrow, series, brand. 這個版型目前不支援插圖.

paragraph, 段落說明屏. 必填 title, 內文寫在 frontmatter 下方, 用空行分段. 選填 eyebrow, series, brand, illustration.

### 兒童系列

配色是薄荷綠底, 圓角粗框, 四角有彩色小圓點, 標題用粗黑體, 走童趣風格.

kids-list, 兒童重點列表屏. 必填 title, points 陣列, 每筆包含 heading 與 body, 建議 3 到 4 點. 選填 eyebrow, brand, illustration, 預設值是 growing.

kids-quote, 兒童金句屏. 必填 title, 內文寫在 frontmatter 下方. 選填 eyebrow, brand, illustration, 預設值是 growing.

kids-paragraph, 兒童段落屏. 必填 title, 內文寫在 frontmatter 下方, 用空行分段. 選填 eyebrow, brand, illustration, 預設值是 growing.

## 共用欄位

brand, 卡片右下角的品牌落款, 沒填的話預設是 心之所向.

illustration, 對應 assets/illustrations 資料夾裡的檔名, 不含副檔名.

series, 只有成人版型使用, 用來標示系列編號, 例如 01 / 03.

## 插圖素材庫

assets/illustrations 底下的 SVG 都來自開源插畫庫 unDraw, MIT 授權, 可以商用, 不需要標註來源. 每一張都已經把原本的主色替換成品牌色, 成人系列用磚紅 #C05B3F 或橄欖綠 #6F7F5D, 兒童系列用成長綠 #4CAF6D.

要新增插圖的時候, 步驟是先到 unDraw 或它的開源鏡像倉庫找一張情境相符的插畫, 下載 SVG, 用文字取代把主色換成品牌色, 存進 assets/illustrations, 最後在對應的 Markdown 檔案 frontmatter 填上 illustration 欄位. 這個挑選與調色的過程需要判斷文字語意, 建議請 Claude Code 協助完成, 理由寫在 Develop.md.

## 品牌色彩系統

成人系列.

--ink 深墨色文字, --ink-soft 淺墨色輔助文字, --cream 米色底, --rust 磚紅主色, --sage 橄欖綠輔色, --line 淺色分隔線.

兒童系列.

--kid-bg 薄荷綠底, --kid-ink 深藍灰文字, --kid-green 成長綠, --kid-blue 天空藍, --kid-yellow 陽光黃, --kid-coral 珊瑚橘.

## 新增一篇內容

在 content 資料夾新增一份 .md 檔, 參考現有範例填好 frontmatter 與內文, 存檔後執行 npm run generate 或指定檔名產生單張, 完成的圖檔會出現在 output 資料夾.
