import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { DESIGN_TOKENS } from "../../../../core/config/theme.config";

const ITEM_HEIGHT = 44;
const SEARCH_HEIGHT = 56;

/**
 * Dropdown animado reutilizable
 * Se posiciona automáticamente debajo del trigger
 * 
 * @param {Array} items - Items: [{ value, label, icon?, description?, prefix? }]
 * @param {*} value - Valor seleccionado
 * @param {function} onSelect - Callback al seleccionar
 * @param {string} placeholder - Placeholder cuando no hay selección
 * @param {string} triggerIcon - Icono del trigger
 * @param {boolean} disabled - Si está deshabilitado
 * @param {boolean} error - Si hay error
 * @param {number} triggerHeight - Altura del trigger
 * @param {number} maxVisible - Máximo de items visibles
 * @param {boolean} searchable - Si permite búsqueda (default: false)
 * @param {string} searchPlaceholder - Placeholder del buscador
 * @param {function} renderTrigger - Custom render para el trigger (opcional)
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
  searchable = false,
  searchPlaceholder = "Buscar...",
  renderTrigger,
  style,
}) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Filtrar items según búsqueda
  const filteredItems = searchable && searchQuery.trim()
    ? items.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
          item.label?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.value?.toString().toLowerCase().includes(q)
        );
      })
    : items;

  const PANEL_HEIGHT = Math.min(filteredItems.length, maxVisible) * ITEM_HEIGHT + (searchable ? SEARCH_HEIGHT : 0);

  const animateOpen = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerRect({ x, y, width, height });
      setOpen(true);
      setSearchQuery("");
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start(() => {
        // Auto-focus en el buscador si está habilitado
        if (searchable) {
          setTimeout(() => searchInputRef.current?.focus(), 100);
        }
      });
    });
  }, [dropdownAnim, searchable]);

  const animateClose = useCallback(() => {
    Animated.timing(dropdownAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      setOpen(false);
      setSearchQuery("");
    });
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
        {renderTrigger ? (
          // Trigger personalizado
          <TouchableOpacity onPress={handleToggle} activeOpacity={0.8} disabled={disabled}>
            {renderTrigger({ selected, open, disabled })}
          </TouchableOpacity>
        ) : (
          // Trigger por defecto
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
            {selected?.prefix && (
              <Text style={{ fontSize: 16 }}>{selected.prefix}</Text>
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
        )}
      </View>

      {/* Panel - Usando Modal para garantizar que esté por encima de todo */}
      {open && triggerRect && (
        <Modal
          transparent
          animationType="none"
          visible={open}
          onRequestClose={animateClose}
          statusBarTranslucent
        >
          {/* Overlay transparente para cerrar al hacer clic fuera */}
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={animateClose}
          >
            {/* Panel flotante - posicionado absolutamente */}
            <Animated.View
              pointerEvents="box-none"
              style={[
                styles.panel,
                {
                  top: triggerRect.y + triggerRect.height - 1,
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
              {/* Contenedor interior para prevenir que los clics cierren el modal */}
              <TouchableOpacity activeOpacity={1}>
                {/* Campo de búsqueda (opcional) */}
                {searchable && (
                  <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    margin: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 2,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.border.primary,
                    backgroundColor: theme.colors.background.app,
                  }}>
                    <Feather name="search" size={13} color={theme.colors.text.secondary} />
                    <TextInput
                      ref={searchInputRef}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder={searchPlaceholder}
                      placeholderTextColor={theme.colors.text.secondary}
                      style={{
                        flex: 1,
                        fontSize: 13,
                        color: theme.colors.text.primary,
                        padding: 8,
                        // @ts-ignore — válido en web
                        outlineStyle: "none",
                      }}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setSearchQuery("")}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Feather name="x" size={13} color={theme.colors.text.secondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: Math.min(filteredItems.length, maxVisible) * ITEM_HEIGHT }}
                >
                  {filteredItems.length === 0 && searchable ? (
                    <View style={{ paddingVertical: 20, alignItems: "center" }}>
                      <Text style={{ fontSize: 13, color: theme.colors.text.secondary }}>
                        Sin resultados
                      </Text>
                    </View>
                  ) : (
                    filteredItems.map((item, i) => {
                      const active = value === item.value;
                      const isLast = i === filteredItems.length - 1;
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
                          {item.prefix && (
                            <Text style={{ fontSize: 16, width: 28, textAlign: "center" }}>
                              {item.prefix}
                            </Text>
                          )}
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
                                numberOfLines={1}
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
                    })
                  )}
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
