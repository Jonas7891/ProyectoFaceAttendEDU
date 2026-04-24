import { useRef, useEffect } from "react";
import { Animated } from "react-native";

/**
 * Devuelve un Animated.Value con loop de flotación vertical.
 * @param delay  Milisegundos de retraso antes de iniciar el loop
 */
export function useFloatAnimation(delay = 0) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: -8,
          duration: 1800,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return anim;
}
