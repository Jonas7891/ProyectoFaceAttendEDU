// AUD-42: «1 profesore encontrado» / «1 administradore encontrado».
import { foundLabel } from "../foundLabel";

const found = { found: "encontrado", foundPlural: "encontrados" };

test("uses the real singular for one result", () => {
    expect(foundLabel(1, { singular: "profesor", plural: "profesores" }, found)).toBe("1 profesor encontrado");
    expect(foundLabel(1, { singular: "administrador", plural: "administradores" }, found)).toBe("1 administrador encontrado");
});

test("uses the plural for zero or many", () => {
    expect(foundLabel(0, { singular: "profesor", plural: "profesores" }, found)).toBe("0 profesores encontrados");
    expect(foundLabel(3, { singular: "administrador", plural: "administradores" }, found)).toBe("3 administradores encontrados");
});
