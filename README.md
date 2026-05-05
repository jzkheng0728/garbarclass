# garbarclass

這是一個前端垃圾分類手機網頁應用示範。使用已訓練好的 Teachable Machine 圖像模型，搭配相機拍照與圖片上傳功能，直接在瀏覽器中進行分類。

## 使用方式

1. 確保 `garbageclass/model.json`、`garbageclass/metadata.json` 與 `garbageclass/weights.bin` 存在。
2. 使用本機伺服器開啟專案根目錄，例如：
   - `python3 -m http.server 8000`
   - 或使用 VS Code Live Server
3. 在瀏覽器開啟 `http://127.0.0.1:8000/`
4. 點選「啟動相機」或「上傳照片」，即可進行垃圾分類。

## 支援功能

- 手機相機拍照
- 圖片上傳
- 預覽照片
- 顯示前五名辨識結果

## 專案檔案

- `index.html`：主頁面
- `styles.css`：響應式樣式
- `app.js`：模型載入與辨識邏輯
- `garbageclass/`：已訓練好的模型檔案
