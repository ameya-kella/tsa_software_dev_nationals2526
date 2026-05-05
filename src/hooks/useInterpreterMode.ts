import { useRef } from "react";
import { aslSocket } from "../ws/aslSocket";

export function useInterpreterMode() {
  const isRunningRef = useRef(true);

  const start = () => {
    isRunningRef.current = true;
    aslSocket.sendContext({ flow: "interpreter" });
  };

  const stop = () => {
    isRunningRef.current = false;
  };

  const sendLandmarks = (landmarks: number[][]) => {
    if (!isRunningRef.current) return;
    aslSocket.sendLandmarks(landmarks, false);
  };

  const generateSentence = (landmarks: number[][]) => {
    aslSocket.sendLandmarks(landmarks, true);
  };

  return {
    start,
    stop,
    sendLandmarks,
    generateSentence,
  };
}