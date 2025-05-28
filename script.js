const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement.getContext('2d');

const earringImg = new Image();
earringImg.src = 'earrings/earring1.png';

const necklaceImg = new Image();
necklaceImg.src = 'necklaces/necklace1.png';

let currentMode = 'earring'; // default

function changeEarring(filename) {
  earringImg.src = `earrings/${filename}`;
}

function changeNecklace(filename) {
  necklaceImg.src = `necklaces/${filename}`;
}

function selectMode(mode) {
  currentMode = mode;
  document.getElementById('earring-options').style.display = mode === 'earring' ? 'flex' : 'none';
  document.getElementById('necklace-options').style.display = mode === 'necklace' ? 'flex' : 'none';
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

let leftEarPositions = [];
let rightEarPositions = [];
let chinPositions = [];

function smooth(positions) {
  if (positions.length === 0) return null;
  const sum = positions.reduce((acc, pos) => ({ x: acc.x + pos.x, y: acc.y + pos.y }), { x: 0, y: 0 });
  return { x: sum.x / positions.length, y: sum.y / positions.length };
}

faceMesh.onResults((results) => {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];
    const offsetY = 20;

    const left = {
      x: landmarks[132].x * canvasElement.width,
      y: landmarks[132].y * canvasElement.height - offsetY,
    };
    const right = {
      x: landmarks[361].x * canvasElement.width,
      y: landmarks[361].y * canvasElement.height - offsetY,
    };
    const chin = {
      x: landmarks[152].x * canvasElement.width,
      y: landmarks[152].y * canvasElement.height + 10,
    };

    leftEarPositions.push(left);
    rightEarPositions.push(right);
    chinPositions.push(chin);
    if (leftEarPositions.length > 5) leftEarPositions.shift();
    if (rightEarPositions.length > 5) rightEarPositions.shift();
    if (chinPositions.length > 5) chinPositions.shift();

    const leftSmooth = smooth(leftEarPositions);
    const rightSmooth = smooth(rightEarPositions);
    const chinSmooth = smooth(chinPositions);

    if (currentMode === 'earring' && earringImg.complete) {
      if (leftSmooth) canvasCtx.drawImage(earringImg, leftSmooth.x - 60, leftSmooth.y, 100, 100);
      if (rightSmooth) canvasCtx.drawImage(earringImg, rightSmooth.x - 20, rightSmooth.y, 100, 100);
    }

    if (currentMode === 'necklace' && necklaceImg.complete && chinSmooth) {
      canvasCtx.drawImage(necklaceImg, chinSmooth.x - 100, chinSmooth.y, 200, 100);
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
