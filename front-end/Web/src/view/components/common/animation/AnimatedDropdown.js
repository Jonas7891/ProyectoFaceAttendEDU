import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { DESIGN_TOKENS } from "../../../../core/config/theme.config";

const ITEM_HEIGHT = 44;

/**
 * Dropdown animado reutilizable
 * Se posiciona automáticamente debajo del trigger
 * 
 * @param {Array} items - Items: [{ value, label, icon?, description? }]
 * @param {*} value - Valor seleccionado
 * @param {function} onSelect - Callback al seleccionar
 * @param {string} placeholder - Placeholder cuando no hay selección
 * @param {string} triggerIcon - Icono del trigger
 * @param {boolean} disabled - Si está deshabilitado
 * @param {boolean} error - Si hay error
 * @param {number} triggerHeight - Altura del trigger
 * @param {number} maxVisible - Máximo de items visibles
 */
export function AnimatedDropdown({
  items,
  value,
  onSelect,
  placeholder = "Seleccionar...",
  triggerIcon,
  disabled = false,
  error = false,
  triggerHeight = 40,
  maxVisible = 6,
  style,
}) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState(null);
  const triggerRef = useRef(null);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const PANEL_HEIGHT = Math.min(items.length, maxVisible) * ITEM_HEIGHT;

  const animateOpen = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerRect({ x, y, width, height });
      setOpen(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    });
  }, [dropdownAnim]);

  const animateClose = useCallback(() => {
    Animated.timing(dropdownAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.quad),
      useNativeDriver: false,
    }).start(() => setOpen(false));
  }, [dropdownAnim]);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    open ? animateClose() : animateOpen();
  }, [open, disabled, animateOpen, animateClose]);

  const handleSelect = useCallback(
    (v) => {
      onSelect(v);
      animateClose();
    },
    [onSelect, animateClose]
  );

  const panelHeight = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, PANEL_HEIGHT],
  });

  const panelOpacity = dropdownAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 1, 1],
  });

  const selected = items.find((i) => i.value === value);
  const label = selected?.label ?? placeholder;

  const borderColor = error
    ? theme.colors.status.error
    : open
    ? theme.colors.brand.primary
    : theme.colors.border.primary;

  return (
    <View style={style}>
      {/* Trigger */}
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={0.8}
          style={[
            styles.trigger,
            {
              height: triggerHeight,
              borderWidth: open ? 2 : 1.5,
              borderColor,
              backgroundColor: open
                ? theme.colors.brand.primaryLight
                : error
                ? theme.colors.status.errorLight
                : theme.colors.background.surface,
              borderBottomLeftRadius: open ? 0 : DESIGN_TOKENS.borderRadius.lg,
              borderBottomRightRadius: open ? 0 : DESIGN_TOKENS.borderRadius.lg,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          {(triggerIcon || selected?.icon) && (
            <Feather
              name={triggerIcon ?? selected?.icon}
              size={14}
              color={
                open
                  ? theme.colors.brand.primary
                  : theme.colors.text.secondary
              }
            />
          )}
          <View style={styles.labelContainer}>
            <Text
              style={[
                styles.label,
                {
                  fontWeight: selected ? "600" : "400",
                  color: open
                    ? theme.colors.brand.primary
                    : selected
                    ? theme.colors.text.primary
                    : theme.colors.text.secondary,
                },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: dropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            }}
          >
            <Feather
              name="chevron-down"
              size={14}
              color={
                open
                  ? theme.colors.brand.primary
                  : theme.colors.text.secondary
              }
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Panel */}
      {open && triggerRect && (
        <Modal
          transparent
          animationType="none"
          visible={open}
          onRequestClose={animateClose}
          statusBarTranslucent
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={animateClose}
          >
            <Animated.View
              pointerEvents="box-none"
              style={[
                styles.panel,
                {
                  top: triggerRect.y + triggerRect.height,
                  left: triggerRect.x,
                  width: triggerRect.width,
                  height: panelHeight,
                  opacity: panelOpacity,
                  borderColor: theme.colors.brand.primary,
                  backgroundColor: theme.colors.background.surface,
                  ...DESIGN_TOKENS.shadows.lg,
                },
              ]}
            >
              <TouchableOpacity activeOpacity={1}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: PANEL_HEIGHT }}
                >
                  {items.map((item, i) => {
                    const active = value === item.value;
                    const isLast = i === items.length - 1;
                    return (
                      <TouchableOpacity
                        key={item.value}
                        onPress={() => handleSelect(item.value)}
                        activeOpacity={0.7}
                        style={[
                          styles.item,
                          {
                            backgroundColor: active
                              ? theme.colors.brand.primaryLight
                              : "transparent",
                            borderBottomWidth: isLast ? 0 : 1,
                            borderBottomColor: theme.colors.border.primary,
                          },
                        ]}
                      >
                        {item.icon && (
                          <Feather
                            name={item.icon}
                            size={13}
                            color={
                              active
                                ? theme.colors.brand.primary
                                : theme.colors.text.secondary
                            }
                          />
                        )}
                        <View style={styles.itemLabel}>
                          <Text
                            style={[
                              styles.itemText,
                              {
                                fontWeight: active ? "600" : "400",
                                color: active
                                  ? theme.colors.brand.primary
                                  : theme.colors.text.primary,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {item.label}
                          </Text>
                          {item.description && (
                            <Text
                              style={[
                                styles.itemDescription,
                                { color: theme.colors.text.secondary },
                              ]}
                            >
                              {item.description}
                            </Text>
                          )}
                        </View>
                        {active && (
                          <Feather
                            name="check"
                            size={13}
                            color={theme.colors.brand.primary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN_TOKENS.spacing.sm,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
  },
  panel: {
    position: "absolute",
    overflow: "hidden",
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: DESIGN_TOKENS.borderRadius.lg,
    borderBottomRightRadius: DESIGN_TOKENS.borderRadius.lg,
    zIndex: DESIGN_TOKENS.zIndex.dropdown,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN_TOKENS.spacing.sm,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    height: ITEM_HEIGHT,
  },
  itemLabel: {
    flex: 1,
  },
  itemText: {
    fontSize: 13,
  },
  itemDescription: {
    fontSize: 11,
  },
});

export default AnimatedDropdown;
