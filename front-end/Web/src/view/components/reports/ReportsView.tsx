// ============================================================
//  FaceAttend EDU — Reports View (View Layer)
//  Lógica completa en useReportsViewModel.
//  Incluye: panel de filtros, exportar PDF y exportar Excel.
// ============================================================

import React from "react";
import {
    View, Text, ScrollView, TouchableOpacity, Modal, Switch, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, Badge, PageHeader, UIButton, ProgressBar, StatCard } from "../ui/UI";
import { Avatar }        from "../ui/UI";
import { useTheme }      from "../hooks/useTheme";
import { useResponsive } from "../hooks/useResponsive";
import { useReportsViewModel, PERIOD_OPTIONS, DEFAULT_FILTERS } from "../../../viewmodels/useReportsViewModel";
import type { ReportFilters } from "../../../viewmodels/useReportsViewModel";
import { useTranslation } from "../../../i18n/hooks/useTranslation";
import type { DailyAttendance, WeeklyAttendance } from "../../../models/types";

// ── WeeklySparkline ──────────────────────────────────────────

function WeeklySparkline({ data }: { data: WeeklyAttendance[] }) {
    const { theme } = useTheme();
    const c = theme.colors;
    return (
        <View style={{ gap: 8 }}>
            {data.map((item, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={{ fontSize: 10, color: c.text.secondary, width: 44 }}>{item.week}</Text>
                    <View style={{ flex: 1, height: 6, backgroundColor: c.border.primary, borderRadius: 99 }}>
                        <View style={{
                            height: "100%", width: `${item.rate}%` as any,
                            backgroundColor: c.brand.primary, borderRadius: 99,
                        }} />
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: c.text.primary, width: 36, textAlign: "right" }}>
                        {item.rate}%
                    </Text>
                </View>
            ))}
        </View>
    );
}

// ── DailyBars ────────────────────────────────────────────────

function DailyBars({ data }: { data: DailyAttendance[] }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;
    return (
        <View style={{ gap: 10 }}>
            {data.map(item => (
                <View key={item.day} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: c.text.primary, width: 32 }}>
                        {item.day}
                    </Text>
                    <View style={{
                        flex: 1, flexDirection: "row", height: 10,
                        borderRadius: 5, overflow: "hidden",
                        backgroundColor: c.border.primary,
                    }}>
                        <View style={{ flex: item.present, backgroundColor: c.states.success }} />
                        <View style={{ flex: item.late,    backgroundColor: c.states.warning }} />
                        <View style={{ flex: item.absent,  backgroundColor: c.states.danger  }} />
                    </View>
                    <Text style={{ fontSize: 11, color: c.text.secondary, width: 70, textAlign: "right" }}>
                        {item.present}P · {item.absent}A
                    </Text>
                </View>
            ))}
            <View style={{ flexDirection: "row", gap: 14, marginTop: 4 }}>
                {[
                    [c.states.success, t("Presentes")],
                    [c.states.warning, t("Tardanzas")],
                    [c.states.danger,  t("Ausentes") ],
                ].map(([color, label]) => (
                    <View key={label as string} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color as string }} />
                        <Text style={{ fontSize: 11, color: c.text.secondary }}>{label as string}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ── FiltersPanel ─────────────────────────────────────────────

function FiltersPanel({
    visible, filters, onApply, onReset, onClose, availableCourses,
}: {
    visible:          boolean;
    filters:          ReportFilters;
    onApply:          (f: ReportFilters) => void;
    onReset:          () => void;
    onClose:          () => void;
    availableCourses: string[];
}) {
    const { theme } = useTheme();
    const { t }     = useTranslation();
    const c = theme.colors;

    // Estado local del panel (se confirma al presionar Aplicar)
    const [draft, setDraft] = React.useState<ReportFilters>(filters);

    // Sincroniza si cambian los filtros externos
    React.useEffect(() => { setDraft(filters); }, [filters]);

    const courseOptions = [
        { value: "", label: t("Todos los programas") },
        ...availableCourses.map(name => ({ value: name, label: name })),
    ];

    const statusOptions: { value: ReportFilters["statusFilter"]; label: string }[] = [
        { value: "all",      label: t("Todos")    },
        { value: "active",   label: t("Activos")  },
        { value: "inactive", label: t("Inactivos") },
    ];

    function FilterLabel({ label }: { label: string }) {
        return (
            <Text style={{ fontSize: 12, fontWeight: "600", color: c.text.secondary,
                           textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                {label}
            </Text>
        );
    }

    function ChipRow<T extends string>({
        options, value, onChange,
    }: {
        options: { value: T; label: string }[];
        value: T;
        onChange: (v: T) => void;
    }) {
        return (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {options.map(opt => {
                    const active = value === opt.value;
                    return (
                        <TouchableOpacity key={opt.value} onPress={() => onChange(opt.value)}
                            style={{
                                paddingVertical: 5, paddingHorizontal: 14, borderRadius: 99,
                                backgroundColor: active ? c.brand.primary : c.interactive.disabled,
                                borderWidth: active ? 0 : 1, borderColor: c.border.primary,
                            }}>
                            <Text style={{ fontSize: 12, fontWeight: active ? "600" : "400",
                                color: active ? c.text.onBrand : c.text.secondary }}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
                activeOpacity={1} onPress={onClose} />
            <View style={{
                position: "absolute", top: 0, right: 0, bottom: 0, width: 320,
                backgroundColor: c.background.surface,
                borderLeftWidth: 1, borderLeftColor: c.border.primary,
                padding: 20,
            }}>
                {/* Header */}
                <View style={{ flexDirection: "row", justifyContent: "space-between",
                               alignItems: "center", marginBottom: 24 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Feather name="sliders" size={16} color={c.brand.primary} />
                        <Text style={{ fontSize: 15, fontWeight: "700", color: c.text.primary }}>
                            {t("Filtros")}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onClose}>
                        <Feather name="x" size={18} color={c.text.secondary} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                    {/* Curso */}
                    <FilterLabel label={t("Programa")} />
                    <ChipRow
                        options={courseOptions}
                        value={draft.courseCode}
                        onChange={v => setDraft(d => ({ ...d, courseCode: v }))}
                    />

                    {/* Estado */}
                    <FilterLabel label={t("Estado del estudiante")} />
                    <ChipRow
                        options={statusOptions}
                        value={draft.statusFilter}
                        onChange={v => setDraft(d => ({ ...d, statusFilter: v }))}
                    />

                    {/* Rango de asistencia */}
                    <FilterLabel label={t("Rango de asistencia")} />
                    <View style={{ flexDirection: "row", gap: 12, marginBottom: 16, alignItems: "center" }}>
                        {[
                            { label: "Min", key: "attendanceMin" as const },
                            { label: "Max", key: "attendanceMax" as const },
                        ].map(item => (
                            <View key={item.key} style={{ flex: 1, alignItems: "center" }}>
                                <Text style={{ fontSize: 11, color: c.text.secondary, marginBottom: 4 }}>{item.label}</Text>
                                <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                                    {[0, 25, 50, 75, 100].filter(v =>
                                        item.key === "attendanceMin" ? v <= draft.attendanceMax : v >= draft.attendanceMin
                                    ).map(val => (
                                        <TouchableOpacity key={val}
                                            onPress={() => setDraft(d => ({ ...d, [item.key]: val }))}
                                            style={{
                                                paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6,
                                                backgroundColor: draft[item.key] === val ? c.brand.primary : c.interactive.disabled,
                                            }}>
                                            <Text style={{ fontSize: 11, color: draft[item.key] === val ? c.text.onBrand : c.text.secondary }}>
                                                {val}%
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Solo en riesgo */}
                    <View style={{ flexDirection: "row", justifyContent: "space-between",
                                   alignItems: "center", paddingVertical: 12,
                                   borderTopWidth: 1, borderTopColor: c.border.primary }}>
                        <View>
                            <Text style={{ fontSize: 13, fontWeight: "500", color: c.text.primary }}>
                                {t("Solo estudiantes en riesgo")}
                            </Text>
                            <Text style={{ fontSize: 11, color: c.text.secondary }}>{t("Asistencia < 75%")}</Text>
                        </View>
                        <Switch
                            value={draft.showAtRiskOnly}
                            onValueChange={v => setDraft(d => ({ ...d, showAtRiskOnly: v }))}
                            trackColor={{ false: c.interactive.disabled, true: c.brand.primary }}
                            thumbColor={c.text.onBrand}
                        />
                    </View>
                </ScrollView>

                {/* Acciones */}
                <View style={{ flexDirection: "row", gap: 10, paddingTop: 16,
                               borderTopWidth: 1, borderTopColor: c.border.primary }}>
                    <UIButton variant="ghost" size="sm" style={{ flex: 1 }}
                        onPress={() => { setDraft({ ...DEFAULT_FILTERS }); onReset(); }}>
                        {t("Limpiar")}
                    </UIButton>
                    <UIButton variant="primary" size="sm" style={{ flex: 1 }}
                        onPress={() => { onApply(draft); onClose(); }}>
                        {t("Aplicar")}
                    </UIButton>
                </View>
            </View>
        </Modal>
    );
}

// ── ReportsView ──────────────────────────────────────────────

export default function ReportsView() {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useReportsViewModel();
    const { t }       = useTranslation();

    if (vm.isLoading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
                <Feather name="loader" size={28} color={c.brand.primary} />
                <Text style={{ fontSize: 14, color: c.text.secondary }}>{t("Cargando datos...")}</Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView
                contentContainerStyle={{ padding: isSmall ? 16 : 28, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <PageHeader
                    title={t("Reportes y estadísticas")}
                    subtitle={t("Análisis de asistencia por período académico")}
                    actions={<>
                        {/* Botón Filtros — con indicador si hay filtros activos */}
                        <TouchableOpacity
                            onPress={vm.openFilters}
                            style={{
                                height: 30, paddingHorizontal: 12, borderRadius: 6,
                                alignItems: "center", justifyContent: "center",
                                backgroundColor: vm.filtersActive ? c.brand.primaryLight : "transparent",
                                borderWidth: 1, borderColor: vm.filtersActive ? c.brand.primary : c.border.primary,
                                flexDirection: "row", gap: 6,
                            }}
                        >
                            <Feather name="sliders" size={13}
                                color={vm.filtersActive ? c.brand.primary : c.text.secondary} />
                            <Text style={{
                                fontSize: 12, fontWeight: vm.filtersActive ? "600" : "500",
                                color: vm.filtersActive ? c.brand.primary : c.text.secondary,
                            }}>
                                {t("Filtros")}{vm.filtersActive ? " ●" : ""}
                            </Text>
                        </TouchableOpacity>

                        {/* Exportar PDF */}
                        <TouchableOpacity
                            onPress={vm.exportPDF}
                            style={{
                                height: 30, paddingHorizontal: 12, borderRadius: 6,
                                alignItems: "center", justifyContent: "center",
                                backgroundColor: "transparent",
                                borderWidth: 1, borderColor: c.border.primary,
                                flexDirection: "row", gap: 6,
                            }}
                        >
                            <Feather name="file-text" size={13} color={c.text.secondary} />
                            <Text style={{ fontSize: 12, fontWeight: "500", color: c.text.secondary }}>
                                {t("Exportar PDF")}
                            </Text>
                        </TouchableOpacity>

                        {/* Exportar Excel */}
                        <TouchableOpacity
                            onPress={vm.exportExcel}
                            style={{
                                height: 30, paddingHorizontal: 12, borderRadius: 6,
                                alignItems: "center", justifyContent: "center",
                                backgroundColor: c.brand.primary,
                                flexDirection: "row", gap: 6,
                            }}
                        >
                            <Feather name="download" size={13} color={c.text.onBrand} />
                            <Text style={{ fontSize: 12, fontWeight: "600", color: c.text.onBrand }}>
                                {t("Exportar Excel")}
                            </Text>
                        </TouchableOpacity>
                    </>}
                />

                {/* Selector de período */}
                <Card padding={14}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Feather name="calendar" size={14} color={c.text.secondary} />
                            <Text style={{ fontSize: 13, fontWeight: "500", color: c.text.secondary }}>{t("Período:")}</Text>
                        </View>
                        {PERIOD_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt.value}
                                onPress={() => vm.setPeriod(opt.value)}
                                style={{
                                    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 99,
                                    backgroundColor: vm.period === opt.value ? c.brand.primary : c.interactive.disabled,
                                }}
                            >
                                <Text style={{
                                    fontSize: 12,
                                    fontWeight: vm.period === opt.value ? "600" : "400",
                                    color: vm.period === opt.value ? c.text.onBrand : c.text.secondary,
                                }}>
                                    {t(opt.label)}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        {/* Indicador de filtros activos junto al período */}
                        {vm.filtersActive && (
                            <TouchableOpacity onPress={vm.resetFilters}
                                style={{ flexDirection: "row", alignItems: "center", gap: 4,
                                         paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
                                         backgroundColor: c.states.dangerLight }}>
                                <Text style={{ fontSize: 11, color: c.states.danger }}>{t("Filtros activos")}</Text>
                                <Feather name="x" size={11} color={c.states.danger} />
                            </TouchableOpacity>
                        )}
                    </View>
                </Card>

                {/* Stats */}
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                    {vm.stats.map(stat => (
                        <View key={stat.label} style={{ flexBasis: isSmall ? "47%" : "23%", flexGrow: 1 }}>
                            <StatCard
                                label={stat.label} value={stat.value}
                                change={stat.change} changeLabel={stat.changeLabel}
                                color={stat.color}
                                icon={<Feather name={stat.icon as any} size={18} color={stat.color} />}
                            />
                        </View>
                    ))}
                </View>

                {/* Evolución + Distribución */}
                <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                    <Card style={{ flex: 2 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary, marginBottom: 4 }}>
                            {t("Evolución de asistencia")}
                        </Text>
                        <Text style={{ fontSize: 12, color: c.text.secondary, marginBottom: 16 }}>
                            {t("Porcentaje por semana")}
                        </Text>
                        <WeeklySparkline data={vm.attendanceByWeek} />
                    </Card>

                    <Card style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary, marginBottom: 4 }}>
                            {t("Distribución")}
                        </Text>
                        <Text style={{ fontSize: 12, color: c.text.secondary, marginBottom: 16 }}>
                            {t("Estado de asistencia")}
                        </Text>
                        <View style={{ gap: 14 }}>
                            {vm.distribution.map(item => (
                                <View key={item.name} style={{ gap: 6 }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                            <View style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: item.color }} />
                                            <Text style={{ fontSize: 13, color: c.text.secondary }}>{item.name}</Text>
                                        </View>
                                        <Text style={{ fontSize: 13, fontWeight: "700", color: item.color }}>
                                            {item.value}%
                                        </Text>
                                    </View>
                                    <ProgressBar value={item.value} color={item.color} height={6} />
                                </View>
                            ))}
                        </View>
                    </Card>
                </View>

                {/* Asistencia diaria + Ranking */}
                <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                    <Card style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary, marginBottom: 4 }}>
                            {t("Asistencia por día")}
                        </Text>
                        <Text style={{ fontSize: 12, color: c.text.secondary, marginBottom: 16 }}>
                            {t("Esta semana")}
                        </Text>
                        <DailyBars data={vm.attendanceByDay} />
                    </Card>

                    <Card style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary, marginBottom: 4 }}>
                            {t("Ranking por curso")}
                        </Text>
                        <Text style={{ fontSize: 12, color: c.text.secondary, marginBottom: 16 }}>
                            {t("Asistencia promedio")}
                        </Text>
                        <View style={{ gap: 14 }}>
                            {vm.courseRanking.map(item => (
                                <View key={item.code} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                                    <View style={{
                                        width: 22, height: 22, borderRadius: 11,
                                        backgroundColor: item.rank === 1 ? c.states.warning : c.interactive.disabled,
                                        alignItems: "center", justifyContent: "center",
                                    }}>
                                        <Text style={{
                                            fontSize: 11, fontWeight: "700",
                                            color: item.rank === 1 ? c.text.onBrand : c.text.secondary,
                                        }}>
                                            {item.rank}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                                            <Text style={{
                                                fontSize: 12, fontWeight: "500",
                                                color: c.text.primary, flex: 1,
                                            }} numberOfLines={1}>
                                                {item.courseName}
                                            </Text>
                                            <Text style={{ fontSize: 12, fontWeight: "700", color: item.barColor, marginLeft: 8 }}>
                                                {item.rate}%
                                            </Text>
                                        </View>
                                        <ProgressBar value={item.rate} color={item.barColor} height={4} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </Card>
                </View>

                {/* Estudiantes en riesgo — responde a filtros */}
                <Card>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <View>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary }}>
                                {t("Estudiantes en riesgo")}
                            </Text>
                            <Text style={{ fontSize: 12, color: c.text.secondary }}>
                                {t("Asistencia por debajo del 75%")}
                                {vm.filtersActive
                                    ? ` · ${vm.atRiskStudents.length} ${t("resultado(s) con filtros")}`
                                    : ""}
                            </Text>
                        </View>
                        <UIButton variant="danger" size="sm">{t("Notificar a todos")}</UIButton>
                    </View>

                    {vm.atRiskStudents.length === 0 ? (
                        <Text style={{ fontSize: 13, color: c.text.secondary, textAlign: "center", paddingVertical: 24 }}>
                            {vm.filtersActive
                                ? t("Ningún estudiante coincide con los filtros aplicados")
                                : t("No hay estudiantes en riesgo actualmente")}
                        </Text>
                    ) : (
                        <View style={{ gap: 10 }}>
                            {vm.atRiskStudents.map(student => (
                                <View key={student.id} style={{
                                    flexDirection: "row", alignItems: "center", gap: 12,
                                    padding: 12, backgroundColor: c.states.dangerLight, borderRadius: 8,
                                }}>
                                    <Avatar name={student.name} size={36} color={c.states.danger} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 13, fontWeight: "600", color: c.text.primary }}>
                                            {student.name}
                                        </Text>
                                        <Text style={{ fontSize: 11, color: c.text.secondary }}>
                                            {student.course} · {student.grade}
                                        </Text>
                                    </View>
                                    <Badge variant="danger">{student.attendance}%</Badge>
                                    <UIButton variant="ghost" size="sm">{t("Notificar")}</UIButton>
                                </View>
                            ))}
                        </View>
                    )}
                </Card>

                {/* Tabla completa de aprendices — siempre visible */}
                <Card>
                    <View style={{ marginBottom: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary }}>
                            {t("Todos los aprendices")}
                        </Text>
                        <Text style={{ fontSize: 12, color: c.text.secondary }}>
                            {vm.filteredStudents.length}{" "}
                            {vm.filtersActive
                                ? t("resultado(s) con filtros aplicados")
                                : `${t("aprendices registrados")} · ${vm.availableCourses.length} ${t("programa(s)")}`}
                        </Text>
                    </View>
                    {vm.filteredStudents.length === 0 ? (
                        <Text style={{ fontSize: 13, color: c.text.secondary, textAlign: "center", paddingVertical: 24 }}>
                            {vm.filtersActive
                                ? t("Ningún aprendiz coincide con los filtros aplicados")
                                : t("No hay aprendices registrados")}
                        </Text>
                    ) : (
                        <View style={{ gap: 8 }}>
                            {vm.filteredStudents.map(student => (
                                <View key={student.id} style={{
                                    flexDirection: "row", alignItems: "center", gap: 12,
                                    padding: 10,
                                    backgroundColor: c.background.app,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: c.border.primary,
                                }}>
                                    <Avatar name={student.name} size={32} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 13, fontWeight: "500", color: c.text.primary }}>
                                            {student.name}
                                        </Text>
                                        <Text style={{ fontSize: 11, color: c.text.secondary }}>
                                            {student.code} · {student.course}
                                        </Text>
                                    </View>
                                    <Badge variant={student.attendance >= 75 ? "success" : "danger"}>
                                        {student.attendance}%
                                    </Badge>
                                </View>
                            ))}
                        </View>
                    )}
                </Card>

            </ScrollView>

            {/* Panel de filtros (slide-in lateral) */}
            <FiltersPanel
                visible={vm.showFilters}
                filters={vm.filters}
                onApply={vm.setFilters}
                onReset={vm.resetFilters}
                onClose={vm.closeFilters}
                availableCourses={vm.availableCourses}
            />
        </>
    );
}
