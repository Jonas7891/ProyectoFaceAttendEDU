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

const inset = { top: 0, left: 0, right: 0, bottom: 0 };
const Providers = ({ children }) => (
    <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 1280, height: 800 }, insets: inset }}>
        <ThemeProvider>
            <ResponsiveProvider>{children}</ResponsiveProvider>
        </ThemeProvider>
    </SafeAreaProvider>
);

let root;
const mount = (element) => {
    act(() => {
        root = create(<Providers>{element}</Providers>);
    });
};
const texts = () =>
    root.root
        .findAll((n) => typeof n.type === "string" && n.children.some((c) => typeof c === "string"))
        .map((n) => n.children.filter((c) => typeof c === "string").join(""));
const byLabel = (label) => root.root.findAll((n) => n.props.accessibilityLabel === label);

// La 312 de AUD-54: sin sesión resuelta no hay fecha de clase.
const ITEM = {
    justificationId: 312,
    justificationTypeId: 1,
    reason: "Cita médica",
    submittedAt: "2026-10-20T10:00:00Z",
    reviewStatus: "Approved",
    date: "",
};
const DOC = { supportingDocumentId: 9, fileName: "cita.pdf", mimeType: "application/pdf", sizeBytes: 2048 };

describe("student justification cards", () => {
    let vm;
    const mountCards = (items = [ITEM]) => mount(<StudentJustifications vm={{ ...vm, myJustifications: items }} />);

    beforeEach(() => {
        vm = {
            listTab: "mine",
            setListTab: jest.fn(),
            eligibleRecords: [],
            typeNameOf: () => "Medical leave",
            askWithdraw: jest.fn(),
            openDetail: jest.fn(),
        };
    });

    test("without session date the title is the type and the submission date, not a dash (AUD-54)", () => {
        mountCards();
        expect(texts()).not.toContain("—");
        expect(texts().some((x) => x.includes("Medical leave") && x.includes("20/10/2026"))).toBe(true);
    });

    test("with a session date the date stays as the title", () => {
        mountCards([{ ...ITEM, date: "2026-10-19" }]);
        expect(texts()).toContain("19/10/2026");
    });

    test("the student can open the detail of an approved justification (AUD-54)", () => {
        mountCards();
        const open = byLabel("Ver detalle");
        expect(open.length).toBeGreaterThan(0);
        act(() => open[0].props.onPress());
        expect(vm.openDetail).toHaveBeenCalledWith(ITEM);
    });
});

test("read-only detail shows the supporting documents but no review actions", () => {
    const noop = () => {};
    mount(
        <JustificationDetailModal
            row={{ ...ITEM, reviewStatus: "Pending", recordStatus: "Absent" }}
            typeName="Medical leave"
            documents={[DOC]}
            documentsLoading={false}
            notes=""
            onNotesChange={noop}
            onClose={noop}
            onDecide={noop}
            onOpenDocument={noop}
            readOnly
        />,
    );
    expect(texts()).toContain("cita.pdf");
    expect(texts()).not.toContain("Aprobar");
    expect(texts()).not.toContain("Rechazar");
    expect(byLabel("Ver documento cita.pdf").length).toBeGreaterThan(0);
});
