// 1. 初始化 Fabric 畫布
const canvas = new fabric.Canvas('collage-canvas', {
  backgroundColor: '#f9f9f9',
  selection: true
});

// 2. 將單品圖片放入畫布
function addImageToCanvas(imgUrl) {
  fabric.Image.fromURL(imgUrl, (img) => {
    img.scaleToWidth(200); // 預設縮放大小
    img.set({
      left: 150,
      top: 150,
      cornerStyle: 'circle',
      cornerColor: '#007bff'
    });
    canvas.add(img);
    canvas.setActiveObject(img);
  }, { crossOrigin: 'anonymous' });
}

// 3. 按鈕事件：層級與刪除控制
document.getElementById('btn-bring-front').onclick = () => {
  const active = canvas.getActiveObject();
  if (active) canvas.bringToFront(active);
};

document.getElementById('btn-send-back').onclick = () => {
  const active = canvas.getActiveObject();
  if (active) canvas.sendToBack(active);
};

document.getElementById('btn-delete').onclick = () => {
  const active = canvas.getActiveObject();
  if (active) canvas.remove(active);
};

// 4. 匯出畫布為圖片
document.getElementById('btn-export').onclick = () => {
  const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
  const link = document.createElement('a');
  link.download = 'my-outfit-collage.png';
  link.href = dataURL;
  link.click();
};
const uploadInput = document.getElementById('upload-input');
const wardrobeList = document.getElementById('wardrobe-list');

uploadInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  console.log('正在去除背景中...');
  try {
    // 純前端 AI 自動去背 (免 API Key，完全免費)
    const blob = await imglyRemoveBackground(file);
    const cleanImgUrl = URL.createObjectURL(blob);

    // 建立衣櫥縮圖按鈕
    const imgEl = document.createElement('img');
    imgEl.src = cleanImgUrl;
    imgEl.className = 'closet-item';
    imgEl.onclick = () => addImageToCanvas(cleanImgUrl); // 點擊加到畫布

    wardrobeList.appendChild(imgEl);
  } catch (err) {
    console.error('去背失敗:', err);
  }
});
const OPENROUTER_API_KEY = "YOUR_OPENROUTER_API_KEY"; // 從 OpenRouter 獲取免費 Key

document.getElementById('btn-ai-suggest').onclick = async () => {
  // 獲取畫布當前所有物件的穿搭清單或描述（若模型支援 Vision，可直接傳 DataURL）
  const prompt = "我搭配了一套穿搭：白色T恤 + 藍色牛仔褲 + 白球鞋，請用 100 字評估這套穿搭的風格與適用場合。";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.3-70b-instruct:free", // 或 openrouter/free 路由
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  alert("AI 穿搭建議：\n" + data.choices[0].message.content);
};
