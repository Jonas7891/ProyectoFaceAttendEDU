const Colors = {
  bg: "#F4F6FB",
  surface: "#FFFFFF",
  primary: "#3B6FE8",
  primaryHover: "#2D5ED4",
  primaryLight: "#EEF2FD",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E9F2",
};

export default Colors;
import { ViewStyle } from "react-native";

// Posiciones desktop (contenedor ~400x400)
const BadgePositions: Record<string, ViewStyle> = {
  topLeft:  { position: "absolute", top: "30%",    left: "5%"   },
  topRight: { position: "absolute", top: "10%",    right: "5%"  },
  bottom:   { position: "absolute", bottom: "15%", right: "5%"  },
};

// Posiciones mobile (contenedor ~260x260)
export const BadgePositionsMobile: Record<string, ViewStyle> = {
  topRight: { position: "absolute", top: "17%",    right: "-8%"  }, //first
  topLeft:  { position: "absolute", top: "49%",   left: "-28%"   }, //middle
  bottom:   { position: "absolute", bottom: "-2%", right: "0%"  },   //end
};

export default BadgePositions;
