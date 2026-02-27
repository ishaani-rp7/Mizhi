let model;
let lastSpokenTime = 0;

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const result = document.getElementById("result");
const confidenceText = document.getElementById("confidence");

async function startApp() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  video.onloadedmetadata = async () => {
    video.play();
    result.innerText = "Loading AI model...";
    model = await cocoSsd.load();
    result.innerText = "Vision Activated";
    detectObjects();
  };
}

async function detectObjects() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const predictions = await model.detect(video);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (predictions.length > 0) {
    const object = predictions[0];

    const name = object.class;
    const confidence = (object.score * 100).toFixed(1);

    const [x, y, width, height] = object.bbox;
    const centerX = x + width / 2;

    let direction = centerX < canvas.width / 2 ? "left" : "right";

    result.innerText = `${name} detected on ${direction}`;
    confidenceText.innerText = `Confidence: ${confidence}%`;

    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "lime";
    ctx.stroke();

    // Danger detection (simulate closeness)
    if (width > 250) {
      speak("Very close! Stop!");
    } else {
      speak(`${name} on ${direction}`);
    }
  } else {
    result.innerText = "Path clear";
    confidenceText.innerText = "";
  }

  requestAnimationFrame(detectObjects);
}

function speak(text) {
  const now = Date.now();

  // 3 second cooldown
  if (now - lastSpokenTime > 3000) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    window.speechSynthesis.speak(speech);
    lastSpokenTime = now;
  }
}