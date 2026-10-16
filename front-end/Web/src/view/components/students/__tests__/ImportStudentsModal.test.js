// ============================================================
//  Tests del parser de ImportStudentsModal (importStudentsParser)
//  Cubre los 3 formatos que fallaban en "Importar estudiantes":
//  - CSV con "," (happy path)
//  - CSV con ";" + BOM UTF-8 (export de Excel en español)
//  - .xlsx binario (SheetJS)
// ============================================================

import { parseFileContent } from "../importStudentsParser";
import * as XLSX from "xlsx";

const HEADERS = ["name", "code", "email", "course", "grade"];

const expectOneRow = (result) => {
    expect(result.errors).toBe(0);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
        name: "Ana García",
        code: "EST-1001",
        email: "ana@mail.com",
        course: "ADSI",
        grade: "3",
    });
};

describe("ImportStudentsModal — parseFileContent", () => {
    test("CSV con comas", () => {
        const csv = [
            HEADERS.join(","),
            '"Ana García",EST-1001,ana@mail.com,ADSI,3',
        ].join("\n");
        expectOneRow(parseFileContent("estudiantes.csv", csv));
    });

    test("CSV con punto y coma y BOM UTF-8 (Excel español)", () => {
        const csv = "\uFEFF" + [
            HEADERS.join(";"),
            "Ana García;EST-1001;ana@mail.com;ADSI;3",
        ].join("\r\n");
        expectOneRow(parseFileContent("estudiantes.csv", csv));
    });

    test("CSV con comas dentro de comillas", () => {
        const csv = [
            HEADERS.join(","),
            '"García, Ana",EST-1001,ana@mail.com,ADSI,3',
        ].join("\n");
        const result = parseFileContent("estudiantes.csv", csv);
        expect(result.errors).toBe(0);
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0]).toMatchObject({
            name: "García, Ana", // la coma no parte la columna
            code: "EST-1001",
            email: "ana@mail.com",
            course: "ADSI",
            grade: "3",
        });
    });

    test(".xlsx binario se parsea con SheetJS", () => {
        const ws = XLSX.utils.aoa_to_sheet([
            HEADERS,
            ["Ana García", "EST-1001", "ana@mail.com", "ADSI", "3"],
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Hoja1");
        const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
        expectOneRow(parseFileContent("estudiantes.xlsx", buf));
    });

    test("filas incompletas se contabilizan como error, no se descartan en silencio", () => {
        const csv = [
            HEADERS.join(","),
            "Ana García,EST-1001,ana@mail.com,ADSI,3",
            ",EST-1002,,, ,",
        ].join("\n");
        const result = parseFileContent("estudiantes.csv", csv);
        expect(result.rows).toHaveLength(1);
        expect(result.errors).toBe(1);
    });
});
