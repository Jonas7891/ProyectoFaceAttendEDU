// ============================================================
//  FaceAttend EDU — ImportStudentsModal
//
//  Modal para importar estudiantes desde CSV o Excel.
//  Sin dependencias externas: parseo manual de CSV y uso de
//  la Web FileReader API (disponible en React Native Web).
//
//  Columnas esperadas (en cualquier orden, case-insensitive):
//    name | code | email | course | grade | attendance | registered | status
//
//  Las columnas mínimas requeridas son: name, code, email, course, grade.
// ============================================================

import React, { useState, useRef } from "react";
import {
    Modal, View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { UIButton, Badge } from "../ui/UI";
import { useTheme }       from "../hooks/useTheme";
import { useResponsive }  from "../hooks/useResponsive";
import { useTranslation } from "../../../i18n/hooks/useTranslation";
import type { Student }   from "../../../models/types";

// ── Tipos ─────────────────────────────────────────────────

interface ImportStudentsModalProps {
    visible:  boolean;
    onClose:  () => void;
    onImport: (drafts: Omit<Student, "id">[]) => Promise<number>;
}

type ParsedRow = Omit<Student, "id">;

type ImportStep = "idle" | "preview" | "importing" | "done" | "error";

// ── Helpers de parseo ─────────────────────────────────────

const ALIAS: Record<string, keyof ParsedRow> = {
    // name
    name: "name", nombre: "name", "nombre completo": "name",
    // code
    code: "code", codigo: "code", "código": "code", id: "code",
    // email
    email: "email", correo: "email", "correo electrónico": "email",
    // course
    course: "course", programa: "course", carrera: "course",
    // grade
    grade: "grade", semestre: "grade", grado: "grade",
    // attendance
    attendance: "attendance", asistencia: "attendance",
    // registered
    registered: "registered", facial: "registered",
    // status
    status: "status", estado: "status",
};

function normalizeHeader(h: string): keyof ParsedRow | null {
    return ALIAS[h.trim().toLowerCase()] ?? null;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
    const lines = text.replace(/\r/g, "").split("\n").filter(l => l.trim());
    if (lines.length < 2) return { headers: [], rows: [] };
    const split = (line: string) =>
        line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
    return { headers: split(lines[0]), rows: lines.slice(1).map(split) };
}

function rowToStudent(headers: string[], cells: string[]): ParsedRow | null {
    const obj: Partial<ParsedRow> = {};
    headers.forEach((h, i) => {
        const key = normalizeHeader(h);
        if (!key) return;
        const val = (cells[i] ?? "").trim();
        if (key === "attendance") {
            obj.attendance = Math.min(100, Math.max(0, parseInt(val, 10) || 100));
        } else if (key === "registered") {
            obj.registered = val === "true" || val === "1" || val === "sí" || val === "si";
        } else if (key === "status") {
            obj.status = val === "inactive" || val === "inactivo" ? "inactive" : "active";
        } else {
            (obj as any)[key] = val;
        }
    });
    if (!obj.name || !obj.code || !obj.email || !obj.course || !obj.grade) return null;
    return {
        name:       obj.name,
        code:       obj.code,
        email:      obj.email,
        course:     obj.course,
        grade:      obj.grade,
        attendance: obj.attendance ?? 100,
        registered: obj.registered ?? false,
        status:     obj.status     ?? "active",
    };
}

function parseFileContent(text: string): { rows: ParsedRow[]; errors: number } {
    const { headers, rows } = parseCSV(text);
    let errors = 0;
    const parsed: ParsedRow[] = [];
    rows.forEach(cells => {
        const r = rowToStudent(headers, cells);
        if (r) parsed.push(r);
        else errors++;
    });
    return { rows: parsed, errors };
}

// ── Template CSV descargable ──────────────────────────────

const CSV_TEMPLATE =
    "name,code,email,course,grade,attendance,registered,status\n" +
    "Ana García López,2024001,a.garcia@uni.edu,Ingeniería de Sistemas,3er semestre,95,false,active\n" +
    "Carlos Pérez,2024002,c.perez@uni.edu,Matemáticas,2do semestre,88,true,active\n";

function downloadTemplate() {
    if (Platform.OS !== "web") return;
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "plantilla_estudiantes.csv";
    a.click();
    URL.revokeObjectURL(url);
}

// ── Selector de archivo (Web only) ───────────────────────

function pickFile(): Promise<{ name: string; content: string } | null> {
    return new Promise(resolve => {
        if (Platform.OS !== "web") { resolve(null); return; }
        const input = document.createElement("input");
        input.type  = "file";
        input.accept = ".csv,.xlsx,.xls,.tsv,.txt";
        input.onchange = (e: any) => {
            const file = e.target?.files?.[0];
            if (!file) { resolve(null); return; }
            const reader = new FileReader();
            reader.onload = (evt) => {
                resolve({ name: file.name, content: evt.target?.result as string ?? "" });
            };
            reader.onerror = () => resolve(null);
            reader.readAsText(file, "utf-8");
        };
        input.click();
    });
}

// ── Componente principal ──────────────────────────────────

export default function ImportStudentsModal({
    visible, onClose, onImport,
}: ImportStudentsModalProps) {
    const { theme }   = useTheme();
    const { isSmall } = useResponsive();
    const { t }       = useTranslation();
    const c           = theme.colors;

    const [step,        setStep]        = useState<ImportStep>("idle");
    const [fileName,    setFileName]    = useState<string | null>(null);
    const [preview,     setPreview]     = useState<ParsedRow[]>([]);
    const [parseErrors, setParseErrors] = useState(0);
    const [imported,    setImported]    = useState(0);
    const [errorMsg,    setErrorMsg]    = useState<string | null>(null);

    const handleClose = () => {
        setStep("idle");
        setFileName(null);
        setPreview([]);
        setParseErrors(0);
        setImported(0);
        setErrorMsg(null);
        onClose();
    };

    const handlePickFile = async () => {
        const result = await pickFile();
        if (!result) return;
        const { rows, errors } = parseFileContent(result.content);
        setFileName(result.name);
        setParseErrors(errors);
        if (rows.length === 0) {
            setErrorMsg(t("El archivo no contiene filas válidas"));
            setStep("error");
            return;
        }
        setPreview(rows);
        setStep("preview");
        setErrorMsg(null);
    };

    const handleImport = async () => {
        setStep("importing");
        try {
            const count = await onImport(preview);
            setImported(count);
            setStep("done");
        } catch {
            setErrorMsg(t("Error al importar los estudiantes"));
            setStep("error");
        }
    };

    if (!visible) return null;

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
            <TouchableOpacity
                style={{
                    flex: 1, backgroundColor: c.background.overlay,
                    justifyContent: "center", alignItems: "center",
                    padding: isSmall ? 12 : 24,
                }}
                onPress={handleClose} activeOpacity={1}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={e => e.stopPropagation()}
                    style={{
                        backgroundColor: c.background.surface,
                        borderRadius: 14,
                        width: isSmall ? "100%" : 580,
                        maxHeight: "92%",
                        overflow: "hidden",
                        shadowColor: "#000",
                        shadowOpacity: 0.18,
                        shadowRadius: 24,
                        elevation: 14,
                    }}
                >
                    {/* Header */}
                    <View style={{
                        flexDirection: "row", alignItems: "center",
                        justifyContent: "space-between",
                        padding: 20,
                        borderBottomWidth: 1, borderBottomColor: c.border.primary,
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <View style={{
                                width: 36, height: 36, borderRadius: 8,
                                backgroundColor: "#EDE9FE",
                                alignItems: "center", justifyContent: "center",
                            }}>
                                <Feather name="upload" size={18} color="#7C3AED" />
                            </View>
                            <View>
                                <Text style={{ fontSize: 16, fontWeight: "700", color: c.text.primary }}>
                                    {t("Importar estudiantes")}
                                </Text>
                                <Text style={{ fontSize: 12, color: c.text.secondary }}>
                                    {t("Desde archivo CSV o Excel")}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleClose}>
                            <Feather name="x" size={20} color={c.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>

                        {/* ── STEP: idle ── */}
                        {step === "idle" && (
                            <View style={{ gap: 16 }}>
                                {/* Zona de arrastre / botón */}
                                <TouchableOpacity
                                    onPress={handlePickFile}
                                    style={{
                                        borderWidth: 2, borderStyle: "dashed",
                                        borderColor: c.brand.primary,
                                        borderRadius: 12, padding: 32,
                                        alignItems: "center", gap: 12,
                                        backgroundColor: c.brand.primaryLight,
                                    }}
                                >
                                    <Feather name="file-text" size={40} color={c.brand.primary} />
                                    <Text style={{ fontSize: 15, fontWeight: "600", color: c.brand.primary }}>
                                        {t("Seleccionar archivo")}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: c.text.secondary, textAlign: "center" }}>
                                        {t("Formatos soportados: CSV, Excel (.xlsx), TSV")}
                                    </Text>
                                </TouchableOpacity>

                                {/* Plantilla */}
                                <View style={{
                                    backgroundColor: c.background.app,
                                    borderRadius: 8, padding: 14,
                                    flexDirection: "row", alignItems: "center",
                                    justifyContent: "space-between",
                                }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 13, fontWeight: "600", color: c.text.primary }}>
                                            {t("¿Primera vez?")}
                                        </Text>
                                        <Text style={{ fontSize: 11, color: c.text.secondary, marginTop: 2 }}>
                                            {t("Descarga la plantilla con las columnas requeridas")}
                                        </Text>
                                    </View>
                                    <UIButton variant="ghost" size="sm" onPress={downloadTemplate}>
                                        <Feather name="download" size={12} color={c.text.secondary} />
                                        {"  "}{t("Plantilla CSV")}
                                    </UIButton>
                                </View>

                                {/* Columnas requeridas */}
                                <View style={{
                                    backgroundColor: c.background.app,
                                    borderRadius: 8, padding: 14,
                                }}>
                                    <Text style={{
                                        fontSize: 12, fontWeight: "600",
                                        color: c.text.secondary, marginBottom: 10,
                                        textTransform: "uppercase", letterSpacing: 0.5,
                                    }}>
                                        {t("Columnas requeridas")}
                                    </Text>
                                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                                        {(["col.name","col.code","col.email","col.course","col.grade"] as const).map(col => (
                                            <Badge key={col} variant="primary">{t(col)}</Badge>
                                        ))}
                                    </View>
                                    <Text style={{
                                        fontSize: 11, color: c.text.secondary, marginTop: 10,
                                    }}>
                                        {t("Columnas opcionales")}{`: ${t("col.attendance")}, ${t("col.registered")}, ${t("col.status")}`}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* ── STEP: preview ── */}
                        {step === "preview" && (
                            <View style={{ gap: 14 }}>
                                {/* Resumen */}
                                <View style={{
                                    backgroundColor: c.states.successLight,
                                    borderRadius: 8, padding: 14,
                                    flexDirection: "row", alignItems: "center", gap: 10,
                                }}>
                                    <Feather name="file" size={18} color={c.states.success} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 13, fontWeight: "600", color: "#065F46" }}>
                                            {fileName}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: "#065F46", marginTop: 2 }}>
                                            {preview.length} {t("estudiantes listos para importar")}
                                            {parseErrors > 0 && ` · ${parseErrors} ${t("filas con errores omitidas")}`}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setStep("idle")}>
                                        <Feather name="refresh-cw" size={14} color={c.text.secondary} />
                                    </TouchableOpacity>
                                </View>

                                {parseErrors > 0 && (
                                    <View style={{
                                        backgroundColor: c.states.warningLight,
                                        borderRadius: 8, padding: 10,
                                        flexDirection: "row", alignItems: "center", gap: 8,
                                    }}>
                                        <Feather name="alert-triangle" size={14} color={c.states.warning} />
                                        <Text style={{ fontSize: 12, color: "#92400E", flex: 1 }}>
                                            {parseErrors} {t("filas con errores omitidas")}
                                            {". "}{t("Verifica que tengan name, code, email, course y grade")}
                                        </Text>
                                    </View>
                                )}

                                {/* Tabla de vista previa */}
                                <Text style={{ fontSize: 12, fontWeight: "600", color: c.text.secondary }}>
                                    {t("Vista previa")} ({Math.min(5, preview.length)} {t("de")} {preview.length})
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View>
                                        {/* Encabezado */}
                                        <View style={{
                                            flexDirection: "row",
                                            backgroundColor: c.background.app,
                                            paddingVertical: 8, paddingHorizontal: 10,
                                            borderRadius: 6,
                                        }}>
                                            {(["col.name","col.code","col.email","col.course","col.grade","col.status"] as const).map(h => (
                                                <Text key={h} style={{
                                                    width: h === "col.name" || h === "col.email" || h === "col.course" ? 160 : 90,
                                                    fontSize: 11, fontWeight: "700",
                                                    color: c.text.secondary,
                                                    textTransform: "uppercase", letterSpacing: 0.4,
                                                }}>
                                                    {t(h)}
                                                </Text>
                                            ))}
                                        </View>
                                        {preview.slice(0, 5).map((row, i) => (
                                            <View key={i} style={{
                                                flexDirection: "row",
                                                paddingVertical: 8, paddingHorizontal: 10,
                                                borderBottomWidth: 1,
                                                borderBottomColor: c.border.primary,
                                            }}>
                                                {[
                                                    { v: row.name,   w: 160 },
                                                    { v: row.code,   w: 90  },
                                                    { v: row.email,  w: 160 },
                                                    { v: row.course, w: 160 },
                                                    { v: row.grade,  w: 90  },
                                                    { v: row.status, w: 90  },
                                                ].map(({ v, w }, j) => (
                                                    <Text key={j} style={{
                                                        width: w, fontSize: 12,
                                                        color: c.text.primary,
                                                    }} numberOfLines={1}>
                                                        {v}
                                                    </Text>
                                                ))}
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        )}

                        {/* ── STEP: importing ── */}
                        {step === "importing" && (
                            <View style={{ alignItems: "center", padding: 40, gap: 16 }}>
                                <ActivityIndicator size="large" color={c.brand.primary} />
                                <Text style={{ fontSize: 14, color: c.text.secondary }}>
                                    {t("Importando estudiantes…")}
                                </Text>
                            </View>
                        )}

                        {/* ── STEP: done ── */}
                        {step === "done" && (
                            <View style={{ alignItems: "center", padding: 40, gap: 14 }}>
                                <View style={{
                                    width: 64, height: 64, borderRadius: 32,
                                    backgroundColor: c.states.successLight,
                                    alignItems: "center", justifyContent: "center",
                                }}>
                                    <Feather name="check-circle" size={32} color={c.states.success} />
                                </View>
                                <Text style={{ fontSize: 18, fontWeight: "700", color: c.text.primary }}>
                                    {t("¡Importación exitosa!")}
                                </Text>
                                <Text style={{ fontSize: 14, color: c.text.secondary, textAlign: "center" }}>
                                    {imported} {t("estudiantes agregados al sistema")}
                                </Text>
                            </View>
                        )}

                        {/* ── STEP: error ── */}
                        {step === "error" && (
                            <View style={{ alignItems: "center", padding: 40, gap: 14 }}>
                                <View style={{
                                    width: 64, height: 64, borderRadius: 32,
                                    backgroundColor: c.states.dangerLight,
                                    alignItems: "center", justifyContent: "center",
                                }}>
                                    <Feather name="x-circle" size={32} color={c.states.danger} />
                                </View>
                                <Text style={{ fontSize: 15, fontWeight: "600", color: c.text.primary }}>
                                    {t("Error al importar")}
                                </Text>
                                <Text style={{ fontSize: 13, color: c.text.secondary, textAlign: "center" }}>
                                    {errorMsg}
                                </Text>
                                <UIButton variant="ghost" onPress={() => setStep("idle")}>
                                    {t("Intentar de nuevo")}
                                </UIButton>
                            </View>
                        )}

                    </ScrollView>

                    {/* Footer */}
                    <View style={{
                        flexDirection: "row", gap: 8,
                        justifyContent: "flex-end", padding: 16,
                        borderTopWidth: 1, borderTopColor: c.border.primary,
                    }}>
                        <UIButton variant="ghost" onPress={handleClose}>
                            {step === "done" ? t("Cerrar") : t("Cancelar")}
                        </UIButton>
                        {step === "preview" && (
                            <UIButton variant="primary" onPress={handleImport}>
                                <Feather name="upload" size={14} color="#fff" />
                                {"  "}{t("Importar")} {preview.length} {t("estudiantes")}
                            </UIButton>
                        )}
                        {step === "idle" && (
                            <UIButton variant="primary" onPress={handlePickFile}>
                                <Feather name="folder" size={14} color="#fff" />
                                {"  "}{t("Seleccionar archivo")}
                            </UIButton>
                        )}
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
