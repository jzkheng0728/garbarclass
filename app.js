const modelURL = "garbageclass/model.json";
const metadataURL = "garbageclass/metadata.json";
const statusText = document.getElementById("status-text");
const videoPreview = document.getElementById("video-preview");
const photoPreview = document.getElementById("photo-preview");
const captureButton = document.getElementById("capture-photo");
const uploadInput = document.getElementById("image-upload");
const startCameraButton = document.getElementById("start-camera");
const predictionList = document.getElementById("prediction-list");
const hiddenCanvas = document.getElementById("hidden-canvas");
let model = null;
let stream = null;

async function loadModel() {
  try {
    statusText.textContent = "正在載入模型，請稍候…";
    model = await tmImage.load(modelURL, metadataURL);
    statusText.textContent = "模型已準備好，請拍照或上傳圖片。";
  } catch (error) {
    console.error(error);
    statusText.textContent = "模型載入失敗，請確認檔案是否存在並使用本機伺服器。";
  }
}

function setStatus(message) {
  statusText.textContent = message;
}

function showPredictions(predictions) {
  predictionList.innerHTML = "";
  const sorted = predictions.slice().sort((a, b) => b.probability - a.probability);
  sorted.slice(0, 5).forEach((prediction) => {
    const item = document.createElement("li");
    item.className = "prediction-item";
    item.innerHTML = `
      <span class="prediction-label">${prediction.className}</span>
      <span class="prediction-score">${(prediction.probability * 100).toFixed(1)}%</span>
    `;
    predictionList.appendChild(item);
  });
}

async function classifyImageElement(imageElement) {
  if (!model) {
    setStatus("模型尚未載入，請稍後再試。");
    return;
  }
  setStatus("正在辨識中…");
  try {
    const predictions = await model.predict(imageElement, false);
    showPredictions(predictions);
    setStatus("完成辨識，請查看結果。" );
  } catch (error) {
    console.error(error);
    setStatus("辨識失敗，請重試或換一張圖片。" );
  }
}

function updatePreviewImage(dataUrl) {
  photoPreview.src = dataUrl;
  photoPreview.style.display = "block";
}

function loadImageFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    updatePreviewImage(reader.result);
    const image = new Image();
    image.onload = () => classifyImageElement(image);
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setStatus("本裝置不支援相機，請使用上傳功能。" );
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    videoPreview.srcObject = stream;
    videoPreview.classList.add("active");
    captureButton.disabled = false;
    setStatus("相機已啟動，請拍照或上傳圖片。" );
  } catch (error) {
    console.error(error);
    setStatus("無法啟動相機，請檢查權限或改用上傳照片。" );
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
    videoPreview.srcObject = null;
    captureButton.disabled = true;
  }
}

function captureFromCamera() {
  if (!stream) {
    setStatus("尚未啟動相機，請先按「啟動相機」。" );
    return;
  }

  const videoWidth = videoPreview.videoWidth;
  const videoHeight = videoPreview.videoHeight;
  if (!videoWidth || !videoHeight) {
    setStatus("等待相機啟動中，請稍候再拍照。" );
    return;
  }

  hiddenCanvas.width = videoWidth;
  hiddenCanvas.height = videoHeight;
  const ctx = hiddenCanvas.getContext("2d");
  ctx.drawImage(videoPreview, 0, 0, videoWidth, videoHeight);
  const dataUrl = hiddenCanvas.toDataURL("image/jpeg");
  updatePreviewImage(dataUrl);

  const image = new Image();
  image.onload = () => classifyImageElement(image);
  image.src = dataUrl;
}

uploadInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  loadImageFile(file);
});

captureButton.addEventListener("click", captureFromCamera);
startCameraButton.addEventListener("click", startCamera);
window.addEventListener("beforeunload", stopCamera);

loadModel();
