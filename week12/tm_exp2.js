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
	if(frameCount % skipCount == 0)
	{
		const hands = await detector.estimateHands(webcam.canvas);
		//console.log(hands);

		if(hands.length == 0)
			labelContainer.innerHTML = "Не бачу рук";
		else
		{
			if(hands[0].handedness == "Left")
				labelContainer.innerHTML = "Бачу ліву руку<br><br>";
			else
				labelContainer.innerHTML = "Бачу праву руку<br><br>";

			{
            const fingers = hands[0].landmarks.filter((lm, index) => index % 4 != 0);

            // Calculate finger lengths
            const fingerLengths = fingers.map((finger, index) => {
                const prevJoint = finger[index];
                const nextJoint = finger[index + 1];
                const length = Math.sqrt(
                    (nextJoint[0] - prevJoint[0]) ** 2 +
                    (nextJoint[1] - prevJoint[1]) ** 2 +
                    (nextJoint[2] - prevJoint[2]) ** 2
                );
                return length;
            });

            // Calculate angles between fingers
            const angles = [angleBetweenFingers(fingerLengths[0], fingerLengths[1], fingerLengths[2]),
                angleBetweenFingers(fingerLengths[1], fingerLengths[2], fingerLengths[3]),
                angleBetweenFingers(fingerLengths[2], fingerLengths[3], fingerLengths[4]),
                angleBetweenFingers(fingerLengths[0], fingerLengths[1], fingerLengths[3]),
                angleBetweenFingers(fingerLengths[1], fingerLengths[3], fingerLengths[4])
            ];

            // Display angles
            labelContainer.innerHTML = `Кути між пальцями: ${angles[0].toFixed(2)} градусів, ${angles[1].toFixed(2)} градусів, ${angles[2].toFixed(2)} градусів, ${angles[3].toFixed(2)} градусів, ${angles[4].toFixed(2)} градусів`;
        }
    }

    frameCount++;
    window.requestAnimationFrame(loop);
}

function angleBetweenFingers(a, b, c) {
    const cosAngle = (a ** 2 + b ** 2 - c ** 2) / (2 * a * b);
    return Math.acos(cosAngle) * 180 / Math.PI;
}




