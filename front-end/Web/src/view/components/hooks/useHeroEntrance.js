import { useRef, useEffect } from "react";
import { Animated } from "react-native";

/**
 * Devuelve los valores animados para el fade+slide de entrada del Hero.
 * Se ejecuta una sola vez al montar el componente.
 */
export function useHeroEntrance() {
  const fadeLeft = useRef(new Animated.Value(0)).current;
  const slideLeft = useRef(new Animated.Value(-30)).current;
  const fadeRight = useRef(new Animated.Value(0)).current;
  const slideRight = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeLeft, {
        toValue,
        duration,
        delay,
        useNativeDriver,
      }),
      Animated.timing(slideLeft, {
        toValue,
        duration,
        delay,
        useNativeDriver,
      }),
      Animated.timing(fadeRight, {
        toValue,
        duration,
        delay,
        useNativeDriver,
      }),
      Animated.timing(slideRight, {
        toValue,
        duration,
        delay,
        useNativeDriver,
      }),
    ]).start();
  }, []);

  return { fadeLeft, slideLeft, fadeRight, slideRight };
}
