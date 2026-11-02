import React from "react";
import { create, act } from "react-test-renderer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../context/ThemeContext";
import { ResponsiveProvider } from "../../../../context/ResponsiveContext";
import { StudentJustifications } from "../StudentJustifications";
import { JustificationDetailModal } from "../JustificationDetailModal";

// Icon fonts cannot load under jest.
jest.mock("@expo/vector-icons", () => ({ Feather: (props) => `Feather:${props.name}` }));
jest.mock("../../../../core/utils/i18n/hooks/useTranslation", () => ({ useTranslation: () => ({ t: (s) => s }) }));

// BaseModal portals into react-dom, which react-test-renderer cannot host.
jest.mock("../../../components/common", () => ({
    ...jest.requireActual("../../../components/common"),
    BaseModal: ({ children, footer }) => require("react").createElement(require("react").Fragment, null, children, footer),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const METRICS = { frame: { x: 0, y: 0, width: 1280, height: 800 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

function render(element) {
    let root;
    act(() => {
        root = create(
            <SafeAreaProvider initialMetrics={METRICS}>
                <ThemeProvider><ResponsiveProvider>{element}</ResponsiveProvider></ThemeProvider>
            </SafeAreaProvider>,
        );
    });
    return root;
}

const texts = (root) =>
    root.root.findAll((n) => typeof n.type === "string" && n.children.some((c) => typeof c === "string"))
        .map((n) => n.children.filter((c) => typeof c === "string").join(""));

// La 312 de AUD-54: sin sesión resuelta no hay fecha de clase.
const ITEM = {
    justificationId: 312,
    justificationTypeId: 1,
    reason: "Cita médica",
    submittedAt: "2026-10-20T10:00:00Z",
    reviewStatus: "Approved",
    date: "",
};

const baseVm = (over = {}) => ({
    listTab: "mine",
    setListTab: jest.fn(),
    myJustifications: [ITEM],
    eligibleRecords: [],
    typeNameOf: () => "Medical leave",
    askWithdraw: jest.fn(),
    openDetail: jest.fn(),
    ...over,
});

test("card without session date titles itself with the justification type and the submission date, not a dash (AUD-54)", () => {
    const root = render(<StudentJustifications vm={baseVm()} />);
    const all = texts(root);
    expect(all).not.toContain("—");
    expect(all.some((x) => x.includes("Medical leave") && x.includes("20/10/2026"))).toBe(true);
});

test("card with a session date keeps the date as its title", () => {
    const root = render(<StudentJustifications vm={baseVm({ myJustifications: [{ ...ITEM, date: "2026-10-19" }] })} />);
    expect(texts(root)).toContain("19/10/2026");
});

test("the student can open the detail of an approved justification (AUD-54)", () => {
    const vm = baseVm();
    const root = render(<StudentJustifications vm={vm} />);
    const open = root.root.findAll((n) => n.props.accessibilityLabel === "Ver detalle");
    expect(open.length).toBeGreaterThan(0);
    act(() => open[0].props.onPress());
    expect(vm.openDetail).toHaveBeenCalledWith(ITEM);
});

test("read-only detail shows the supporting documents but no review actions", () => {
    const onOpenDocument = jest.fn();
    const root = render(
        <JustificationDetailModal
            row={{ ...ITEM, reviewStatus: "Pending", recordStatus: "Absent" }}
            typeName="Medical leave"
            documents={[{ supportingDocumentId: 9, fileName: "cita.pdf", mimeType: "application/pdf", sizeBytes: 2048 }]}
            documentsLoading={false}
            notes=""
            onNotesChange={() => {}}
            onClose={() => {}}
            onDecide={() => {}}
            onOpenDocument={onOpenDocument}
            readOnly
        />,
    );
    const all = texts(root);
    expect(all).toContain("cita.pdf");
    expect(all).not.toContain("Aprobar");
    expect(all).not.toContain("Rechazar");
    expect(root.root.findAll((n) => n.props.accessibilityLabel === "Ver documento cita.pdf").length).toBeGreaterThan(0);
});
