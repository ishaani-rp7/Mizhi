let model;
let lastSpokenTime = 0;
let recognition;
let isRunning = false;

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const result = document.getElementById("result");
const confidenceText = document.getElementById("confidence");


// 🎤 Speak function with cooldown
function speak(text) {
  const now = Date.now();

  if (now - lastSpokenTime > 3000) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    window.speechSynthesis.speak(speech);
    lastSpokenTime = now;
  }
}


// 🚀 Start Vision
async function startApp() {
  if (isRunning) return;

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  video.onloadedmetadata = async () => {
    video.play();

    result.innerText = "Loading AI model...";
    model = await cocoSsd.load();

    result.innerText = "Vision Activated";
    speak("Vision Activated");

    isRunning = true;
    detectObjects();
  };
}


// 🛑 Stop Vision
function stopVision() {
  if (!isRunning) return;

  const stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }

  result.innerText = "Vision Stopped";
  confidenceText.innerText = "";
  speak("Vision Stopped");

  isRunning = false;
}


// 🔍 Object Detection Loop
async function detectObjects() {

  if (!isRunning || !model) return;

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
      speak("Very close! Stop immediately!");
    } else {
      speak(`${name} on ${direction}`);
    }

  } else {
    result.innerText = "Path clear";
    confidenceText.innerText = "";
  }

  requestAnimationFrame(detectObjects);
}


// 🎙 Voice Command Recognition
function setupVoiceCommands() {

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-IN";

  recognition.onresult = function (event) {
    const transcript =
      event.results[event.results.length - 1][0].transcript
        .toLowerCase()
        .trim();

    console.log("Heard:", transcript);

    if (
      transcript.includes("start vision") ||
      transcript.includes("shuru karo")
    ) {
      speak("Starting vision");
      startApp();
    }

    if (
      transcript.includes("stop vision") ||
      transcript.includes("band karo")
    ) {
      speak("Stopping vision");
      stopVision();
    }
  };

  recognition.start();
}


// 🎬 Initialize voice listener on page load
setupVoiceCommands();
speak("Say start vision to begin.");