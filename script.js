const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement.getContext('2d');

let currentMode = "earring";
let selectedEarring = 'earring1.png';
let selectedNecklace = 'necklace1.png';

const earringImg = new Image();
const necklaceImg = new Image();
earringImg.src = 'earrings/' + selectedEarring;
necklaceImg.src = 'necklaces/' + selectedNecklace;

function changeMode(mode) {
  currentMode = mode;
  updateOptionsVisibility();
}

function changeEarring(filename) {
  selectedEarring = filename;
  earringImg.src = 'earrings/' + filename;
}

function changeNecklace(filename) {
  selectedNecklace = filename;
  necklaceImg.src = 'necklaces/' + filename;
}

function updateOptionsVisibility() {
  document.getElementById("earring-options").style.display = currentMode === "earring" ? "flex" : "none";
  document.getElementById("necklace-options").style.display = currentMode === "necklace" ? "flex" : "none";
}

const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

faceMesh.onResults((results) => {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];

    if (currentMode === "earring") {
      const offsetY = 20;
      const left = {
        x: landmarks[132].x * canvasElement.width,
        y: landmarks[132].y * canvasElement.height - offsetY,
      };
      const right = {
        x: landmarks[361].x * canvasElement.width,
        y: landmarks[361].y * canvasElement.height - offsetY,
      };
      if (earringImg.complete) {
        canvasCtx.drawImage(earringImg, left.x - 60, left.y, 100, 100);
        canvasCtx.drawImage(earringImg, right.x - 20, right.y, 100, 100);
      }
    }

    if (currentMode === "necklace") {
      const chin = {
        x: landmarks[152].x * canvasElement.width,
        y: landmarks[152].y * canvasElement.height,
      };
      if (necklaceImg.complete) {
        canvasCtx.drawImage(necklaceImg, chin.x - 100, chin.y - 10, 200, 100);
      }
    }
  }
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});
camera.start();

videoElement.addEventListener('loadedmetadata', () => {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
});

updateOptionsVisibility();
