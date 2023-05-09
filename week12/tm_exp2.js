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
                           const fingers = hands[0].annotations.thumb.concat(
                 hands[0].annotations.indexFinger,
                 hands[0].annotations.middleFinger,
                 hands[0].annotations.ringFinger,
                 hands[0].annotations.pinky);

             for (let i = 0; i < fingers.length; i++) {
                 labelContainer.innerHTML += fingers[i][0] +
                     ": (" + Math.round(fingers[i][1][0]) +
                     ", " + Math.round(fingers[i][1][1]) + ")<br>";
             }

             const fingerConnections = [
                 [0, 1],
                 [1, 2],
                 [2, 3],
                 [3, 4],
                 [0, 5],
                 [5, 6],
                 [6, 7],
                 [7, 8],
                 [0, 9],
                 [9, 10],
                 [10, 11],
                 [11, 12],
                 [0, 13],
                 [13, 14],
                 [14, 15],
                 [15, 16],
                 [0, 17],
                 [17, 18],
                 [18, 19],
                 [19, 20],
             ];

             for (let i = 0; i < fingerConnections.length; i++) {
                 const fingerConnection = fingerConnections[i];
                 const fingerPoint1 = fingers[fingerConnection[0]];
                 const fingerPoint2 = fingers[fingerConnection[1]];
                 const distance = Math.sqrt(
                     Math.pow(fingerPoint2[1][0] - fingerPoint1[1][0], 2) +
                     Math.pow(fingerPoint2[1][1] - fingerPoint1[1][1], 2)
             );
              labelContainer.innerHTML += `Distance between ${fingerPoint1[0]} and ${fingerPoint2[0]}: ${distance.toFixed(2)}<br>`;
         }
     }
 }
 frameCount++;
}




