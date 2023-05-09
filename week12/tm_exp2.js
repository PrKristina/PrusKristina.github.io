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
            const keypoints = hands[0].keypoints;

// calculate the length of each finger based on the distance between MCP and TIP keypoints
const fingerLengths = [
    euclideanDistance(keypoints[0].position, keypoints[3].position), // thumb
    euclideanDistance(keypoints[5].position, keypoints[8].position), // index finger
    euclideanDistance(keypoints[9].position, keypoints[12].position), // middle finger
    euclideanDistance(keypoints[13].position, keypoints[16].position), // ring finger
    euclideanDistance(keypoints[17].position, keypoints[20].position), // pinky finger
];

// calculate the angle between each finger using the dot product formula
const fingerAngles = [
    angleBetweenVectors(getVector(keypoints[2].position, keypoints[3].position), getVector(keypoints[4].position, keypoints[3].position)), // thumb
    angleBetweenVectors(getVector(keypoints[6].position, keypoints[8].position), getVector(keypoints[10].position, keypoints[8].position)), // index finger
    angleBetweenVectors(getVector(keypoints[10].position, keypoints[12].position), getVector(keypoints[14].position, keypoints[12].position)), // middle finger
    angleBetweenVectors(getVector(keypoints[14].position, keypoints[16].position), getVector(keypoints[18].position, keypoints[16].position)), // ring finger
    angleBetweenVectors(getVector(keypoints[18].position, keypoints[20].position), getVector(keypoints[19].position, keypoints[20].position)), // pinky finger
];

// print the finger lengths and angles to the label container
for (let i = 0; i < fingerLengths.length; i++) {
    labelContainer.innerHTML += `Finger ${i + 1} length: ${fingerLengths[i].toFixed(2)}<br>`;
}
for (let i = 0; i < fingerAngles.length; i++) {
    labelContainer.innerHTML += `Angle between fingers ${i + 1} and ${i + 2}: ${(fingerAngles[i] * 180 / Math.PI).toFixed(2)} degrees<br>`;
}

// helper function to calculate the Euclidean distance between two points
function euclideanDistance(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

// helper function to calculate the vector between two points
function getVector(point1, point2) {
    return {
        x: point2.x - point1.x,
        y: point2.y - point1.y,
    };
}

// helper function to calculate the angle between two vectors using the dot product formula
function angleBetweenVectors(vector1, vector2) {
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const magnitudeProduct = Math.sqrt(vector1.x ** 2 + vector1.y ** 2) * Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
    return Math.acos(dotProduct / magnitudeProduct);
}
	frameCount++;
}
				




