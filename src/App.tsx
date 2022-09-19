import "./App.css";
import {
  Holistic,
  FACEMESH_LEFT_EYE,
  FACEMESH_LIPS,
  FACEMESH_RIGHT_EYE,
  Results,
} from "@mediapipe/holistic";
import { useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { button, useControls } from "leva";
import { draw } from "./utils/drawCanvas";
import * as Kalidokit from "kalidokit";
import { useSendMessage } from "./hooks/useSendMessage";

function App() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultsRef = useRef<Results>();

  const { input, setInput, send } = useSendMessage();

  const datas = useControls({
    bgImage: false,
    landmark: {
      min: 0,
      max: 477,
      step: 1,
      value: 0,
    },
    result: button(() => {
      OutputData();
    }),
  });

  const OutputData = () => {
    const results = resultsRef.current!;
    console.log(results.faceLandmarks); // 顔のランドマーク
    console.log(results.poseLandmarks); // ポーズのランドマーク
    // console.log("FACEMESH_LEFT_EYE", FACEMESH_LEFT_EYE);
    // console.log("FACEMESH_RIGHT_EYE", FACEMESH_RIGHT_EYE);
    // console.log("FACEMESH_LIPS", FACEMESH_LIPS);
  };

  const onResults = useCallback(
    (results: Results) => {
      // 検出結果の格納
      resultsRef.current = results;
      let facelm = results.faceLandmarks;
      let poselm = results.poseLandmarks;
      let poselm2d = poselm?.map((elm) => {
        return { x: elm.x, y: elm.y };
      }) as Omit<Kalidokit.TFVectorPose, "z">;

      let rightHandlm = results.rightHandLandmarks;
      let leftHandlm = results.leftHandLandmarks;
      // 描画処理
      const ctx = canvasRef.current!.getContext("2d")!;
      draw(ctx, results, datas.bgImage, datas.landmark);
      let faceRig = Kalidokit.Face.solve(facelm, {
        runtime: "mediapipe",
        video: webcamRef.current!.video!,
      });
      let poseRig = Kalidokit.Pose.solve(poselm, poselm2d, {
        runtime: "mediapipe",
        video: webcamRef.current!.video!,
      });
      let leftHandRig = Kalidokit.Hand.solve(leftHandlm);
      let rightHandRig = Kalidokit.Hand.solve(rightHandlm);
      console.log(faceRig);
      console.log(poseRig);
      console.log(leftHandRig);
      console.log(rightHandRig);
      setInput(JSON.stringify({ faceRig, poseRig, leftHandRig, rightHandRig }));
      send();
    },
    [datas]
  );
  useEffect(() => {
    const holistic = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      },
    });
    holistic.setOptions({
      selfieMode: true,
      modelComplexity: 0,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    holistic.onResults(onResults);

    if (webcamRef.current) {
      const camera = new Camera(webcamRef.current.video!, {
        onFrame: async () => {
          await holistic.send({ image: webcamRef.current!.video! });
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    }

    return () => {
      holistic.close();
    };
  }, [onResults]);

  return (
    <div className={""}>
      {/* capture */}
      <Webcam
        ref={webcamRef}
        style={{ visibility: "hidden" }}
        audio={false}
        width={1280}
        height={720}
        mirrored
        screenshotFormat="image/jpeg"
        videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
      />
      {/* draw */}
      <canvas ref={canvasRef} className={""} width={1280} height={720} />
    </div>
  );
}

export default App;
