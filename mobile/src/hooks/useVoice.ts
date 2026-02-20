import * as Speech from "expo-speech";
import { useCallback } from "react";

export function useVoice() {
  const speak = useCallback((text: string, rate = 0.9, pitch = 1.1) => {
    Speech.speak(text, { language: "en-US", pitch, rate });
  }, []);

  const stop = useCallback(() => Speech.stop(), []);

  return { speak, stop };
}
