// Every route of the endpoint catalog that belongs to a service with a generated
// OpenAPI contract (docs/openapi, regenerated and diffed in CI) must exist in that
// contract, so a renamed or removed backend route breaks this test instead of a screen.
const fs = require("fs");
const path = require("path");
const { endpoints, API_V1 } = require("../endpoints");

const OPENAPI_DIR = path.resolve(__dirname, "../../../../../docs/openapi");
const CONTRACTS = {
    identity: "01-ms-identity",
    authorization: "02-ms-authorization",
    scheduling: "04-ms-scheduling",
    attendance: "05-ms-attendance",
    biometric: "06-ms-biometric",
};
// Served by Kong itself (post-function in kong.yml), not by the service.
const GATEWAY_ROUTES = new Set(["/api/v1/auth/ws-ticket"]);

const ID = "__id__";
const template = (p) => p.split("?")[0].replace(/\{[^}]+\}/g, "{}").split(ID).join("{}");
const resolve = (value) => (typeof value === "function" ? value(...Array(value.length).fill(ID)) : value);
const contractPaths = (file) =>
    new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(OPENAPI_DIR, `${file}.json`), "utf8")).paths).map(template));

describe.each(Object.entries(CONTRACTS))("%s routes", (group, file) => {
    const paths = contractPaths(file);
    test.each(Object.entries(endpoints[group]))("%s exists in the contract", (name, value) => {
        const route = resolve(value);
        expect(route.startsWith(API_V1)).toBe(true);
        if (GATEWAY_ROUTES.has(route)) return;
        expect(paths).toContain(template(route));
    });
});

// Academic, configuration and notification are Node services without a generated
// contract (docs/openapi/README.md, "Known gap"): only the shape is checked.
test.each(["academic", "configuration", "notification"])("%s routes are absolute /api/v1 paths", (group) => {
    for (const value of Object.values(endpoints[group])) {
        const route = resolve(value);
        expect(route).toMatch(/^\/api\/v1\/[a-z0-9/_-]+(\?[A-Za-z]+=[a-z_]+)?$/);
        if (typeof value === "function") expect(route).toContain(ID);
    }
});
