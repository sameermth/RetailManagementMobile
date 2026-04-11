import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { PropsWithChildren, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";

import { theme } from "../theme/theme";

export function TitleBlock({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.titleBlock}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

export function GlassCard({
  children,
  style,
}: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, theme.shadow.card, style]}>{children}</View>;
}

export function GradientCard({
  children,
  colors,
  style,
}: PropsWithChildren<{ colors: [string, string]; style?: ViewStyle }>) {
  return (
    <LinearGradient colors={colors} style={[styles.gradientCard, style]}>
      {children}
    </LinearGradient>
  );
}

export function Pill({
  label,
  tone = "blue",
}: {
  label: string;
  tone?: "blue" | "green" | "orange";
}) {
  const backgroundColor =
    tone === "green"
      ? theme.colors.chipGreen
      : tone === "orange"
        ? theme.colors.chipOrange
        : theme.colors.chipBlue;

  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

export function MetricCard({
  label,
  value,
  delta,
  tone = "blue",
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "blue" | "green" | "orange";
}) {
  return (
    <GlassCard style={styles.metricCard}>
      <Pill label={label} tone={tone} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDelta}>{delta}</Text>
    </GlassCard>
  );
}

export function ActionButton({
  label,
  icon,
  inverted = false,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  inverted?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        inverted ? styles.secondaryButton : styles.primaryButton,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={inverted ? theme.colors.textPrimary : "#FFFFFF"}
        />
      ) : null}
      <Text
        style={[
          styles.buttonText,
          inverted ? styles.secondaryButtonText : undefined,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function InputField({
  placeholder,
  secureTextEntry,
}: {
  placeholder: string;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.inputShell}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

export function BackButton({
  label = "Back",
  onPress,
}: {
  label?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.backButton}>
      <Ionicons name="arrow-back" size={18} color={theme.colors.textPrimary} />
      <Text style={styles.backButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SearchableSelect({
  label,
  placeholder,
  selectedLabel,
  options,
  onSelect,
}: {
  label: string;
  placeholder: string;
  selectedLabel?: string;
  options: { id: string; label: string; meta?: string }[];
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return options.slice(0, 8);
    }
    return options
      .filter((option) => `${option.label} ${option.meta ?? ""}`.toLowerCase().includes(term))
      .slice(0, 8);
  }, [options, query]);

  return (
    <View style={styles.selectWrap}>
      <Text style={styles.selectLabel}>{label}</Text>
      <Pressable style={styles.selectTrigger} onPress={() => setOpen(true)}>
        <View style={styles.selectTriggerTextWrap}>
          <Text style={styles.selectTriggerText} numberOfLines={1}>
            {selectedLabel || placeholder}
          </Text>
          {selectedLabel ? <Text style={styles.selectMeta}>Tap to change</Text> : null}
        </View>
        <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
      </Pressable>

      <Modal transparent animationType="slide" visible={open} onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismissArea} onPress={() => setOpen(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>{label}</Text>
            </View>
            <View style={styles.inputShell}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
            </View>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.selectOptions} showsVerticalScrollIndicator={false}>
              {filtered.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    onSelect(option.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  style={styles.selectOption}
                >
                  <Text style={styles.selectOptionText}>{option.label}</Text>
                  {option.meta ? <Text style={styles.selectOptionMeta}>{option.meta}</Text> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function ActionSheet({
  label,
  visible,
  actions,
  onClose,
}: {
  label: string;
  visible: boolean;
  actions: Array<{
    id: string;
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
    description?: string;
    onPress: () => void;
  }>;
  onClose: () => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalDismissArea} onPress={onClose} />
        <View style={[styles.modalSheet, styles.actionSheet]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{label}</Text>
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.actionSheetContent} showsVerticalScrollIndicator={false}>
            {actions.map((action) => (
              <Pressable
                key={action.id}
                onPress={() => {
                  action.onPress();
                  onClose();
                }}
                style={styles.actionSheetItem}
              >
                <View style={styles.actionSheetIcon}>
                  {action.icon ? <Ionicons name={action.icon} size={18} color={theme.colors.accent} /> : null}
                </View>
                <View style={styles.actionSheetText}> 
                  <Text style={styles.actionSheetLabel}>{action.label}</Text>
                  {action.description ? <Text style={styles.actionSheetMeta}>{action.description}</Text> : null}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  titleBlock: {
    gap: 10,
    marginBottom: theme.spacing.lg,
  },
  eyebrow: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.textPrimary,
    ...theme.typography.display,
  },
  description: {
    color: theme.colors.textSecondary,
    ...theme.typography.body,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  gradientCard: {
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  pill: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  metricCard: {
    gap: 14,
    width: 220,
    marginRight: 14,
  },
  metricValue: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
  },
  metricDelta: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 18,
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
  },
  inputShell: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 58,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  input: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    ...theme.typography.section,
  },
  sectionAction: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  selectWrap: {
    gap: 8,
  },
  selectTrigger: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: 16,
  },
  selectTriggerTextWrap: {
    flex: 1,
    gap: 2,
    paddingRight: 12,
  },
  selectTriggerText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  selectLabel: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  selectMeta: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  selectOptions: {
    gap: 8,
  },
  selectOption: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectOptionText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  selectOptionMeta: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  modalBackdrop: {
    backgroundColor: "rgba(15,23,42,0.28)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalDismissArea: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    maxHeight: "78%",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  modalHeader: {
    alignItems: "center",
    gap: 10,
    paddingBottom: theme.spacing.sm,
  },
  modalHandle: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    height: 4,
    width: 48,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  modalScroll: {
    marginTop: theme.spacing.sm,
  },
  actionSheet: {
    maxHeight: "60%",
  },
  actionSheetContent: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  actionSheetItem: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    flexDirection: "row",
    gap: 12,
    padding: theme.spacing.md,
  },
  actionSheetIcon: {
    alignItems: "center",
    backgroundColor: theme.colors.accentSoft,
    borderRadius: 14,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  actionSheetText: {
    flex: 1,
  },
  actionSheetLabel: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  actionSheetMeta: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
});
