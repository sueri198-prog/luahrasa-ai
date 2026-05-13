const video = document.getElementById("video");
const statusText = document.getElementById("status");
const scanBtn = document.getElementById("scanBtn");

const snapshot =
  document.getElementById("snapshot");

const snapshotEmotion =
  document.getElementById("snapshotEmotion");

let canvas;
let ctx;

let scanning = false;

// =====================
// VOICE
// =====================

function speak(text){

  speechSynthesis.cancel();

  const speech =
    new SpeechSynthesisUtterance(text);

  speech.lang = "en-US";

  speech.rate = 1;

  speechSynthesis.speak(speech);

}

// =====================
// START CAMERA
// =====================

async function startVideo(){

  await faceapi.nets.ssdMobilenetv1.loadFromUri(
    "https://justadudewhohacks.github.io/face-api.js/models"
  );

  await faceapi.nets.faceExpressionNet.loadFromUri(
    "https://justadudewhohacks.github.io/face-api.js/models"
  );

  await faceapi.nets.faceLandmark68Net.loadFromUri(
    "https://justadudewhohacks.github.io/face-api.js/models"
  );

  const stream =
    await navigator.mediaDevices.getUserMedia({
      video:true
    });

  video.srcObject = stream;

}

startVideo();

// =====================
// VIDEO READY
// =====================

video.addEventListener("playing", () => {

  canvas =
    faceapi.createCanvasFromMedia(video);

  document
    .getElementById("container")
    .append(canvas);

  ctx =
    canvas.getContext("2d");

  canvas.width =
    video.videoWidth;

  canvas.height =
    video.videoHeight;

  realtimeScanner();

});

// =====================
// REALTIME DETECTION
// =====================

async function realtimeScanner(){

  if(scanning){

    requestAnimationFrame(
      realtimeScanner
    );

    return;

  }

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // DETECT FACE
  const detection =
    await faceapi
    .detectSingleFace(
      video,
      new faceapi.SsdMobilenetv1Options()
    )
    .withFaceLandmarks()
    .withFaceExpressions();

  // FACE FOUND
  if(detection){

    const box =
      detection.detection.box;

    // GLOW BOX
    ctx.strokeStyle =
      "cyan";

    ctx.lineWidth = 5;

    ctx.shadowColor =
      "cyan";

    ctx.shadowBlur = 25;

    ctx.strokeRect(
      box.x,
      box.y,
      box.width,
      box.height
    );

    // EXPRESSIONS
    const expressions =
      detection.expressions;

    let maxValue = 0;
    let emotion = "";

    for(let exp in expressions){

      if(expressions[exp] > maxValue){

        maxValue =
          expressions[exp];

        emotion = exp;

      }

    }

    // SHOW LIVE EMOTION
    statusText.innerHTML =
      "Detected: " +
      emotion.toUpperCase();

  }

  // NO FACE
  else{

    statusText.innerHTML =
      "Looking for face...";
  }

  requestAnimationFrame(
    realtimeScanner
  );

}

// =====================
// BUTTON CLICK
// =====================

scanBtn.addEventListener("click", async () => {

  if(scanning) return;

  scanning = true;

  speak(
    "Get ready for emotion scan"
  );

  // COUNTDOWN
  let countdown = 3;

  const timer =
    setInterval(() => {

      statusText.innerHTML =
        "Scanning in " +
        countdown;

      countdown--;

    },1000);

  // START SCAN
  setTimeout(async () => {

    clearInterval(timer);

    statusText.innerHTML =
      "Scanning...";

    // DETECT FACE
    const detection =
      await faceapi
      .detectSingleFace(
        video,
        new faceapi.SsdMobilenetv1Options()
      )
      .withFaceLandmarks()
      .withFaceExpressions();

    // NO FACE
    if(!detection){

      statusText.innerHTML =
        "No face detected";

      speak(
        "No face detected"
      );

      scanning = false;

      return;

    }

    const expressions =
      detection.expressions;

    const landmarks =
      detection.landmarks;

    // =====================
    // SAD BOOST
    // =====================

    const mouth =
      landmarks.getMouth();

    const mouthLeft =
      mouth[0].y;

    const mouthRight =
      mouth[6].y;

    const mouthCenter =
      mouth[3].y;

    // POUT DETECTION
    const mouthTop =
      mouth[13].y;

    const mouthBottom =
      mouth[17].y;

    const mouthHeight =
      Math.abs(
        mouthBottom - mouthTop
      );

    const mouthDrop =
      (
        mouthLeft +
        mouthRight
      ) / 2 - mouthCenter;

    // EXTRA SAD
    if(

      mouthDrop > 1.5 ||

      mouthHeight < 18

    ){

      expressions.sad *= 4.0;

    }

    // MULUT JATUH
    if(
      mouthLeft > mouthCenter + 2 &&
      mouthRight > mouthCenter + 2
    ){

      expressions.sad *= 5.0;

    }

    // =====================
    // ANGRY BOOST
    // =====================

    const leftBrow =
      landmarks.getLeftEyeBrow();

    const rightBrow =
      landmarks.getRightEyeBrow();

    const browDistance =
      Math.abs(
        leftBrow[4].x -
        rightBrow[0].x
      );

    if(browDistance < 25){

      expressions.angry *= 2.5;

    }

    // =====================
    // FIND EMOTION
    // =====================

    let maxValue = 0;
    let emotion = "";

    for(let exp in expressions){

      if(expressions[exp] > maxValue){

        maxValue =
          expressions[exp];

        emotion = exp;

      }

    }

    // =====================
    // EMOJI
    // =====================

    let emoji = "😐";

    if(emotion === "happy"){
      emoji = "😊";
    }

    else if(emotion === "sad"){
      emoji = "😢";
    }

    else if(emotion === "angry"){
      emoji = "😠";
    }

    else if(emotion === "surprised"){
      emoji = "😲";
    }

    else if(emotion === "fearful"){
      emoji = "😨";
    }

    else if(emotion === "disgusted"){
      emoji = "🤢";
    }

    // =====================
    // SNAP PHOTO
    // =====================

    const photoCanvas =
      document.createElement("canvas");

    photoCanvas.width =
      video.videoWidth;

    photoCanvas.height =
      video.videoHeight;

    const photoCtx =
      photoCanvas.getContext("2d");

    photoCtx.drawImage(
      video,
      0,
      0
    );

    // SAVE PHOTO
    snapshot.src =
      photoCanvas.toDataURL();

    snapshot.style.display =
      "block";

    // SHOW RESULT
    snapshotEmotion.innerHTML =
      emoji +
      " " +
      emotion.toUpperCase();

    statusText.innerHTML =
      emoji +
      " YOU ARE " +
      emotion.toUpperCase();

    // AI VOICE
    speak(
      "You are " +
      emotion
    );

    // BUTTON
    scanBtn.innerHTML =
      "SCAN AGAIN";

    scanning = false;

  },4000);

});