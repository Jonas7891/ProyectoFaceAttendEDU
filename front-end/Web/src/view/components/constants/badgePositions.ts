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
