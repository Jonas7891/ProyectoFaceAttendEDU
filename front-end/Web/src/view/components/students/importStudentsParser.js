// ============================================================
//  FaceAttend EDU — importStudentsParser
//
//  Parseo puro (sin React ni React Native) de los archivos que
//  acepta "Importar estudiantes":
//  - .xlsx/.xls/.xlsm: binario, se lee con SheetJS (dependencies).
//  - .csv/.tsv/.txt: texto, con detección de delimitador
//    (, ; tab) y tolerancia a BOM UTF-8 y comillas.
//
//  Módulo separado del modal para que los tests lo importen sin
//  arrastrar el árbol de componentes (barrel ../common).
//
//  Columnas esperadas (en cualquier orden, case-insensitive):
//    name | code | email | course | grade | attendance | hasFacial |
//    hasFingerprint | status
//
//  Las columnas mínimas requeridas son: name, code, email, course, grade.
// ============================================================

const ALIAS = {
    // name
    name: "name",
    nombre: "name",
    "nombre completo": "name",
    // code
    code: "code",
    codigo: "code",
    "código": "code",
    id: "code",
    // email
    email: "email",
    correo: "email",
    "correo electrónico": "email",
    // course
    course: "course",
    programa: "course",
    carrera: "course",
    // grade
    grade: "grade",
    semestre: "grade",
    grado: "grade",
    // attendance
    attendance: "attendance",
    asistencia: "attendance",
    // hasFacial
    hasfacial: "hasFacial",
    facial: "hasFacial",
    rostro: "hasFacial",
    reconocimientofacial: "hasFacial",
    // hasFingerprint
    hasfingerprint: "hasFingerprint",
    huella: "hasFingerprint",
    huelladactilar: "hasFingerprint",
    dactilar: "hasFingerprint",
    fingerprint: "hasFingerprint",
    // status
    status: "status",
    estado: "status",
};

function normalizeHeader(h) {
    return ALIAS[h.trim().toLowerCase()] ?? null;
}

// Detecta el delimitador mirando la línea de encabezados:
// el Excel en español exporta ";" y TSV usa tab.
function detectDelimiter(headerLine) {
    const candidates = [",", ";", "\t"];
    let best = ",";
    let bestCount = -1;
    for (const d of candidates) {
        const count = headerLine.split(d).length - 1;
        if (count > bestCount) {
            best = d;
            bestCount = count;
        }
    }
    return best;
}

// Split de una línea respetando comillas ("campo, con coma").
function splitDelimitedLine(line, delim) {
    const out = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"') {
                if (line[i + 1] === '"') {
                    cur += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                cur += ch;
            }
        } else if (ch === '"') {
            inQuotes = true;
        } else if (ch === delim) {
            out.push(cur.trim());
            cur = "";
        } else {
            cur += ch;
        }
    }
    out.push(cur.trim());
    return out;
}

function parseCSV(text) {
    // BOM UTF-8 de Excel rompería el primer header ("name" → "﻿name")
    const clean = text.replace(/^\uFEFF/, "").replace(/\r/g, "");
    const lines = clean.split("\n").filter((l) => l.trim());
    if (lines.length < 2) return { headers: [], rows: [] };
    const delim = detectDelimiter(lines[0]);
    return {
        headers: splitDelimitedLine(lines[0], delim),
        rows: lines.slice(1).map((l) => splitDelimitedLine(l, delim)),
    };
}

// .xlsx/.xls: hoja de cálculo binaria — se lee con SheetJS.
function parseXLSX(buffer) {
    const XLSX = require("xlsx");
    const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const grid = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        raw: false,
        defval: "",
        blankrows: false,
    });
    if (grid.length < 2) return { headers: [], rows: [] };
    const headers = grid[0].map((h) => String(h ?? "").trim());
    const rows = grid
        .slice(1)
        .map((r) => (Array.isArray(r) ? r : []).map((c) => String(c ?? "").trim()))
        .filter((r) => r.some((c) => c));
    return { headers, rows };
}

function rowToStudent(headers, cells) {
    const obj = {};
    headers.forEach((h, i) => {
        const key = normalizeHeader(h);
        if (!key) return;
        const val = (cells[i] ?? "").trim();
        if (key === "attendance") {
            obj.attendance = Math.min(100, Math.max(0, parseInt(val, 10) || 100));
        } else if (key === "hasFacial") {
            obj.hasFacial = val === "true" || val === "1" || val === "sí" || val === "si" || val === "yes";
        } else if (key === "hasFingerprint") {
            obj.hasFingerprint = val === "true" || val === "1" || val === "sí" || val === "si" || val === "yes";
        } else if (key === "status") {
            obj.status = val === "inactive" || val === "inactivo" ? "inactive" : "active";
        } else {
            obj[key] = val;
        }
    });
    if (!obj.name || !obj.code || !obj.email || !obj.course || !obj.grade) return null;
    return {
        name: obj.name,
        code: obj.code,
        email: obj.email,
        course: obj.course,
        grade: obj.grade,
        attendance: obj.attendance ?? 100,
        hasFacial: obj.hasFacial ?? false,
        hasFingerprint: obj.hasFingerprint ?? false,
        status: obj.status ?? "active",
    };
}

// Punto de entrada: binario de Excel jamás se lee como texto (se
// convertía en basura que el parser CSV descartaba sin filas válidas).
export function parseFileContent(name, buffer) {
    const isExcel = /\.(xlsx|xls|xlsm)$/i.test(name || "");
    const { headers, rows } = isExcel
        ? parseXLSX(buffer)
        : parseCSV(typeof buffer === "string" ? buffer : new TextDecoder("utf-8").decode(buffer));
    let errors = 0;
    const parsed = [];
    rows.forEach((cells) => {
        const r = rowToStudent(headers, cells);
        if (r) parsed.push(r);
        else errors++;
    });
    return { rows: parsed, errors };
}
