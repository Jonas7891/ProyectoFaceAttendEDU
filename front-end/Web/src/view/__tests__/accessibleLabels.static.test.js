/* global __dirname, test, expect */
// AUD-18: todo control táctil sin texto visible (icono solo) debe llevar accessibilityLabel.
// Recorre el código de src/view con el parser de Babel, sin renderizar.
const fs = require("fs");
const path = require("path");
const { parse } = require("@babel/parser");

const VIEW_ROOT = path.resolve(__dirname, "..");
const TOUCHABLES = new Set(["TouchableOpacity", "TouchableHighlight", "TouchableWithoutFeedback", "Pressable", "IconButton"]);
const ICONS = new Set(["Feather", "Ionicons", "MaterialIcons", "MaterialCommunityIcons", "FontAwesome", "AntDesign"]);
const LABEL_ATTRS = new Set(["accessibilityLabel", "aria-label", "accessibilityLabelledBy"]);

function listSources(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { if (e.name !== "__tests__") listSources(p, out); }
        else if (e.name.endsWith(".js")) out.push(p);
    }
    return out;
}

const nameOf = (n) => (n.type === "JSXIdentifier" ? n.name : n.type === "JSXMemberExpression" ? nameOf(n.property) : "");

function walk(node, visit) {
    if (!node || typeof node.type !== "string") return;
    visit(node);
    for (const k of Object.keys(node)) {
        if (k === "loc" || k === "start" || k === "end") continue;
        const v = node[k];
        if (Array.isArray(v)) v.forEach((c) => c && typeof c.type === "string" && walk(c, visit));
        else if (v && typeof v.type === "string") walk(v, visit);
    }
}

// Texto visible = JSXText, <Text>, o una llamada t(...) dentro del elemento.
function hasVisibleText(el) {
    let found = false;
    walk(el, (n) => {
        if (n === el.openingElement) return;
        if (n.type === "JSXText" && n.value.trim()) found = true;
        if (n.type === "JSXElement" && nameOf(n.openingElement.name) === "Text") found = true;
        if (n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "t") found = true;
        if (n.type === "JSXExpressionContainer" && n.expression.type === "MemberExpression") found = true; // {item.name}
    });
    return found;
}

function hasIcon(el) {
    let found = false;
    walk(el, (n) => { if (n.type === "JSXElement" && ICONS.has(nameOf(n.openingElement.name))) found = true; });
    return found;
}

function unlabeledIconControls() {
    const bad = [];
    for (const file of listSources(VIEW_ROOT)) {
        const ast = parse(fs.readFileSync(file, "utf8"), { sourceType: "module", plugins: ["jsx"] });
        walk(ast.program, (n) => {
            if (n.type !== "JSXElement") return;
            const name = nameOf(n.openingElement.name);
            if (!TOUCHABLES.has(name)) return;
            const attrs = n.openingElement.attributes;
            if (attrs.some((a) => a.type === "JSXSpreadAttribute")) return; // la etiqueta puede venir en el spread
            const labeled = attrs.some((a) => a.type === "JSXAttribute" && LABEL_ATTRS.has(a.name.name));
            if (labeled) return;
            const iconOnly = name === "IconButton" || (hasIcon(n) && !hasVisibleText(n));
            if (iconOnly) bad.push(`${path.relative(VIEW_ROOT, file).split(path.sep).join("/")}:${n.loc.start.line} <${name}>`);
        });
    }
    return bad;
}

test("every icon-only touchable (and every IconButton) under src/view has an accessibilityLabel", () => {
    expect(unlabeledIconControls()).toEqual([]);
});
