// Pruebas de las funciones puras de tools/qa/lib.mjs. Datos sintéticos, sin red ni base de datos.
// Ejecutar: npm run qa:test   (node --test)

import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { emailKey, loadNegativeIds, parseAccounts, parseNegativeIds, pickLoginEmail } from "./lib.mjs";

test("parseAccounts: usuario=contraseña, ignora comentarios y vacías, conserva '=' del valor", () => {
    const accounts = parseAccounts("# nota\n\nuser.a=pass=1\r\n  user.b = x \ncorreo.user.a=a@example.test\nsinigual\n=huerfano");
    assert.deepEqual(accounts, { "user.a": "pass=1", "user.b": " x", "correo.user.a": "a@example.test" });
});

test("pickLoginEmail: descarta correos cifrados en reposo y valores que no son correo", () => {
    assert.equal(pickLoginEmail("enc:v1:AAAA=="), null);
    assert.equal(pickLoginEmail("fermin"), null);
    assert.equal(pickLoginEmail(null, undefined, ""), null);
    assert.equal(pickLoginEmail("enc:v1:AAAA", " persona@example.test "), "persona@example.test");
});

test("pickLoginEmail: la primera opción válida gana (archivo de cuentas antes que API)", () => {
    assert.equal(pickLoginEmail("a@example.test", "b@example.test"), "a@example.test");
});

test("emailKey: clave del archivo de cuentas", () => {
    assert.equal(emailKey("est.ict"), "correo.est.ict");
});

test("parseNegativeIds: solo la parte A, filas NEG-A..E de dos dígitos", () => {
    const text = "## A. Matriz\n| ID | x |\n| NEG-A01 | ANON |\n| NEG-D12 | x |\n| NEG-B04b | x |\n## B. Casos de interfaz\n| NEG-F01 | x |\n";
    assert.deepEqual(parseNegativeIds(text), ["NEG-A01", "NEG-D12"]);
});

test("loadNegativeIds: archivo ausente → mensaje claro, no ENOENT", () => {
    assert.throws(() => loadNegativeIds(path.join(os.tmpdir(), "no-existe-05-negativos.md")), /Falta la matriz de negativos/);
});

test("loadNegativeIds: archivo sin filas NEG → error explícito; con filas → IDs", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "qa-neg-"));
    try {
        const empty = path.join(dir, "vacio.md");
        writeFileSync(empty, "# nada\n");
        assert.throws(() => loadNegativeIds(empty), /no contiene filas/);
        const ok = path.join(dir, "ok.md");
        writeFileSync(ok, "| NEG-A01 | a |\n| NEG-A02 | b |\n");
        assert.deepEqual(loadNegativeIds(ok), ["NEG-A01", "NEG-A02"]);
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test("la matriz versionada en el repo existe y tiene casos", () => {
    assert.ok(loadNegativeIds().length > 50);
});
