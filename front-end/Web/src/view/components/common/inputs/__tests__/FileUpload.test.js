import React from "react";
import { create, act } from "react-test-renderer";
import { Alert, TouchableOpacity } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { ThemeProvider } from "../../../../../context/ThemeContext";
import { FileUpload } from "../FileUpload";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
jest.mock("expo-document-picker", () => ({ getDocumentAsync: jest.fn() }));
jest.mock("expo-image-picker", () => ({
    requestMediaLibraryPermissionsAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn(),
    MediaTypeOptions: { Images: "Images" },
}));

const pdf = { uri: "blob:1", name: "incapacidad.pdf", size: 120_000, mimeType: "application/pdf", file: { name: "incapacidad.pdf" } };

let root;
function render(props) {
    act(() => { root = create(<ThemeProvider><FileUpload onChange={jest.fn()} {...props} /></ThemeProvider>); });
    return root.root.findByType(FileUpload).props;
}
const touchables = () => root.root.findAllByType(TouchableOpacity).filter((n) => typeof n.props.onPress === "function");
const pick = async () => { await act(async () => { await touchables()[0].props.onPress(); }); };
const text = () => JSON.stringify(root.toJSON());

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { act(() => root.unmount()); jest.restoreAllMocks(); });

test("a picked document keeps the browser File that gets uploaded", async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValue({ canceled: false, assets: [pdf] });
    const { onChange } = render({ accept: "application/pdf" });
    await pick();
    expect(DocumentPicker.getDocumentAsync).toHaveBeenCalledWith({ type: "application/pdf", multiple: false, copyToCacheDirectory: true });
    expect(onChange).toHaveBeenCalledWith([{ uri: "blob:1", name: "incapacidad.pdf", size: 120_000, type: "application/pdf", file: pdf.file }]);
});

test("files over the size limit are refused with a message", async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValue({ canceled: false, assets: [{ ...pdf, size: 6 * 1024 * 1024 }] });
    const { onChange } = render({});
    await pick();
    expect(onChange).not.toHaveBeenCalled();
    // Without LanguageProvider t() returns the key; the app interpolates name and size.
    expect(Alert.alert).toHaveBeenCalledWith("Archivo muy grande", expect.stringContaining("excede el tamaño máximo"));
});

test("cancelling the picker changes nothing", async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValue({ canceled: true });
    const { onChange } = render({});
    await pick();
    expect(onChange).not.toHaveBeenCalled();
});

test("multiple mode appends up to maxFiles", async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValue({ canceled: false, assets: [pdf, { ...pdf, name: "b.pdf" }] });
    const existing = [{ uri: "x", name: "a.pdf", size: 10, type: "application/pdf" }];
    const { onChange } = render({ multiple: true, maxFiles: 2, value: existing });
    await pick();
    expect(onChange.mock.calls[0][0].map((f) => f.name)).toEqual(["a.pdf", "incapacidad.pdf"]);
});

test("images need the media permission", async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false });
    const { onChange } = render({ accept: "image/*" });
    await pick();
    expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
});

test("picked images get a name and type when the picker gives none", async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [{ uri: "file:///foto.jpg" }] });
    const { onChange } = render({ accept: "image/png" });
    await pick();
    const [file] = onChange.mock.calls[0][0];
    expect(file).toMatchObject({ uri: "file:///foto.jpg", size: 0, type: "image/jpeg" });
    expect(file.name).toMatch(/^image_\d+\.jpg$/);
});

test("a picker failure is reported instead of crashing", async () => {
    DocumentPicker.getDocumentAsync.mockRejectedValue(new Error("denied"));
    const { onChange } = render({});
    await pick();
    expect(Alert.alert).toHaveBeenCalledWith(expect.any(String), "No se pudo seleccionar el archivo");
    expect(onChange).not.toHaveBeenCalled();
});

test("a selected file is listed and can be removed; disabled does nothing", async () => {
    const value = [{ uri: "x.png", name: "foto.png", size: 2048, type: "image/png" }];
    const { onChange } = render({ value, label: "Soporte", error: true, errorMessage: "Adjunta el soporte" });
    expect(text()).toContain("foto.png");
    expect(text()).toContain("2.0 KB");
    expect(text()).toContain("Adjunta el soporte");
    act(() => { touchables()[touchables().length - 1].props.onPress(); });
    expect(onChange).toHaveBeenCalledWith([]);

    act(() => root.unmount());
    const props = render({ disabled: true });
    await pick();
    expect(DocumentPicker.getDocumentAsync).not.toHaveBeenCalled();
    expect(props.onChange).not.toHaveBeenCalled();
});
