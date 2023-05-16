     let webcam, labelContainer, detector;

    init();

    // Load the image model and setup the webcam
    async function init() {

	const model = handPoseDetection.SupportedModels.MediaPipeHands;
	const detectorConfig = {
	  runtime: 'mediapipe', // or 'tfjs',
	  solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
	  modelType: 'lite'
	}
	detector = await handPoseDetection.createDetector(model, detectorConfig);	

        // Convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(400, 400, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append elements to the DOM
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
    }

    async function loop() {
        webcam.update(); // update the webcam frame
        await predict();
        window.requestAnimationFrame(loop);
    }

	const skipCount = 5;
	let frameCount = 0;

    // run the webcam image through the image model
  async function predict() {
  if (frameCount % skipCount == 0) {
    const hands = await detector.estimateHands(webcam.canvas);
    //console.log(hands);

    if (hands.length == 0)
      labelContainer.innerHTML = "Не бачу рук";
    else {
      if (hands[0].handedness == "Left")
        labelContainer.innerHTML = "Бачу ліву руку<br><br>";
      else
        labelContainer.innerHTML = "Бачу праву руку<br><br>";

      // Calculate finger lengths
      const fingerLengths = [];
      for (let i = 0; i < hands[0].annotations.indexFinger.length; i++) {
        const mcp = hands[0].annotations.indexFinger[i][0];
        const tip = hands[0].annotations.indexFinger[i][3];
        const length = Math.sqrt(Math.pow(tip[0] - mcp[0], 2) + Math.pow(tip[1] - mcp[1], 2));
        fingerLengths.push(length);
      }

      // Calculate angles between fingers
      const angles = [];
      for (let i = 0; i < fingerLengths.length - 1; i++) {
        const v1 = [          hands[0].annotations.indexFinger[i][3][0] - hands[0].annotations.indexFinger[i][0][0],
          hands[0].annotations.indexFinger[i][3][1] - hands[0].annotations.indexFinger[i][0][1]
        ];
        const v2 = [          hands[0].annotations.indexFinger[i + 1][3][0] - hands[0].annotations.indexFinger[i + 1][0][0],
          hands[0].annotations.indexFinger[i + 1][3][1] - hands[0].annotations.indexFinger[i + 1][0][1]
        ];
        const dot = v1[0] * v2[0] + v1[1] * v2[1];
        const mag1 = Math.sqrt(Math.pow(v1[0], 2) + Math.pow(v1[1], 2));
        const mag2 = Math.sqrt(Math.pow(v2[0], 2) + Math.pow(v2[1], 2));
        const angle = Math.acos(dot / (mag1 * mag2));
        angles.push(angle * 180 / Math.PI);
      }
    }
    frameCount++;
  }
}
