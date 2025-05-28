
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement.getContext('2d');

const earringImg = new Image();
const necklaceImg = new Image();

function changeEarring(filename) {
  earringImg.src = `earrings/${filename}`;
}
function changeNecklace(filename) {
  necklaceImg.src = `necklaces/${filename}`;
}

function toggleCategory(category) {
  document.getElementById('earring-options').style.display = category === 'earring' ? 'flex' : 'none';
  document.getElementById('necklace-options').style.display = category === 'necklace' ? 'flex' : 'none';
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

    const left = {
      x: landmarks[132].x * canvasElement.width,
      y: landmarks[132].y * canvasElement.height - 20,
    };
    const right = {
      x: landmarks[361].x * canvasElement.width,
      y: landmarks[361].y * canvasElement.height - 20,
    };

    const chin = {
      x: landmarks[152].x * canvasElement.width,
      y: landmarks[152].y * canvasElement.height + 10,
    };

    if (earringImg.complete) {
      canvasCtx.drawImage(earringImg, left.x - 60, left.y, 100, 100);
      canvasCtx.drawImage(earringImg, right.x - 20, right.y, 100, 100);
    }

    if (necklaceImg.complete) {
      canvasCtx.drawImage(necklaceImg, chin.x - 75, chin.y, 150, 80);
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
