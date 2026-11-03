// AUD-13: ninguna clave de endpoints.js ni función de services/api/*Api.js puede quedar sin llamador.
// El catálogo y los servicios son contratos con el backend: una entrada sin uso se desactualiza en silencio
// (rutas que Kong ya no enruta, flujos biométricos legados). Si una prueba falla aquí, o se usa la entrada
// o se borra; no se deja «por si acaso».
//
// Una referencia es `grupo.clave` (endpoints.identity.login, e.identity.login en las pruebas de contrato) o
// `objetoApi.funcion` en src, tools o scripts, pruebas incluidas.
const fs = require("fs");
const path = require("path");

const WEB_ROOT = path.resolve(__dirname, "../../..");
const ENDPOINTS_FILE = path.join(WEB_ROOT, "src/api/endpoints.js");
const SELF = path.resolve(__filename);

function walk(dir, out) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(entry.name)) out.push(full);
    }
    return out;
}

const sources = [];
for (const dir of ["src", "tools", "scripts"]) {
    const abs = path.join(WEB_ROOT, dir);
    if (fs.existsSync(abs)) walk(abs, sources);
}
const texts = sources
    .filter((f) => path.resolve(f) !== SELF && path.resolve(f) !== ENDPOINTS_FILE)
    .map((f) => ({ file: f, text: fs.readFileSync(f, "utf8") }));
const apiTexts = sources
    .filter((f) => path.resolve(f) !== SELF)
    .map((f) => ({ file: f, text: fs.readFileSync(f, "utf8") }));

const used = (re, pool) => pool.some(({ text }) => re.test(text));

function catalogKeys() {
    const keys = [];
    let group = null;
    for (const line of fs.readFileSync(ENDPOINTS_FILE, "utf8").split(/\r?\n/)) {
        let m = line.match(/^ {4}(\w+): \{$/);
        if (m) { group = m[1]; continue; }
        if (/^ {4}\},?$/.test(line)) { group = null; continue; }
        m = line.match(/^ {8}(\w+): /);
        if (m && group) { keys.push({ group, key: m[1] }); continue; }
        m = line.match(/^ {4}(\w+): [`"(]/);
        if (m && !group) keys.push({ group: null, key: m[1] });
    }
    return keys;
}

function apiMembers() {
    const members = [];
    for (const file of sources.filter((f) => /src[\\/]services[\\/]api[\\/][^\\/]+\.js$/.test(f))) {
        let obj = null;
        for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
            let m = line.match(/^export const (\w+Api) = \{/);
            if (m) { obj = m[1]; continue; }
            if (/^\};?$/.test(line)) { obj = null; continue; }
            m = line.match(/^ {4}(\w+)(?:: |\(|,$)/);
            if (m && obj) members.push({ obj, name: m[1], file: path.relative(WEB_ROOT, file) });
        }
    }
    return members;
}

describe("código muerto de la capa de API (AUD-13)", () => {
    test("el análisis encuentra el catálogo y los servicios (guarda contra un falso verde)", () => {
        expect(catalogKeys().length).toBeGreaterThan(50);
        expect(apiMembers().length).toBeGreaterThan(80);
    });

    test("toda clave de endpoints.js tiene al menos una referencia", () => {
        const unused = catalogKeys()
            .filter(({ group, key }) => {
                const re = group
                    ? new RegExp(`\\b${group}\\s*\\??\\.\\s*${key}\\b`)
                    : new RegExp(`endpoints\\s*\\??\\.\\s*${key}\\b`);
                return !used(re, texts);
            })
            .map(({ group, key }) => (group ? `${group}.${key}` : key));
        expect(unused).toEqual([]);
    });

    test("toda función de services/api/*Api.js tiene al menos un llamador", () => {
        const unused = apiMembers()
            .filter(({ obj, name }) => !used(new RegExp(`\\b${obj}\\s*\\??\\.\\s*${name}\\b`), apiTexts))
            .map(({ obj, name, file }) => `${obj}.${name} (${file})`);
        expect(unused).toEqual([]);
    });

    test("el catálogo ya no trae el flujo biométrico legado ni el grupo quality", () => {
        const { endpoints } = require("../endpoints");
        expect(endpoints.quality).toBeUndefined();
        expect(endpoints.health).toBeUndefined();
        for (const key of ["facialEnroll", "facialVerify", "facialIdentify", "fingerprintEnroll", "fingerprintVerify", "fingerprintIdentify"]) {
            expect(endpoints.biometric[key]).toBeUndefined();
        }
        expect(endpoints.attendance.recordsBulk).toBeUndefined();
    });
});
