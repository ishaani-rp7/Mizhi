let model;
let lastSpoken = "";

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
    model = await cocoSsd.load();
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
    const confidence = (object.score * 100).toFixed(2);

    result.innerText = name + " detected";
    confidenceText.innerText = "Confidence: " + confidence + "%";

    ctx.beginPath();
    ctx.rect(...object.bbox);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "lime";
    ctx.stroke();

    if (name !== lastSpoken) {
      speak(name);
      lastSpoken = name;
    }
  }

  requestAnimationFrame(detectObjects);
}

function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(speech);
}