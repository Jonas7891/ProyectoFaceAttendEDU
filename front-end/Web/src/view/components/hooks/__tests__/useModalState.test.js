import { renderHook, act } from "@testing-library/react-hooks";
import { useModalState, useMultiModalState } from "../useModalState";

describe("useModalState", () => {
    describe("Estado inicial", () => {
        it("debe inicializar con valores por defecto", () => {
            const { result } = renderHook(() => useModalState());

            expect(result.current.isVisible).toBe(false);
            expect(result.current.data).toBe(null);
            expect(result.current.mode).toBe("none");
        });

        it("debe aceptar valores iniciales custom", () => {
            const { result } = renderHook(() =>
                useModalState(true, { id: 1, name: "Test" }, "edit")
            );

            expect(result.current.isVisible).toBe(true);
            expect(result.current.data).toEqual({ id: 1, name: "Test" });
            expect(result.current.mode).toBe("edit");
        });
    });

    describe("open()", () => {
        it("debe abrir el modal sin datos ni modo", () => {
            const { result } = renderHook(() => useModalState());

            act(() => {
                result.current.open();
            });

            expect(result.current.isVisible).toBe(true);
            expect(result.current.data).toBe(null);
            expect(result.current.mode).toBe("none");
        });

        it("debe abrir el modal con datos", () => {
            const { result } = renderHook(() => useModalState());
            const testData = { id: 123, name: "Usuario Test" };

            act(() => {
                result.current.open(testData);
            });

            expect(result.current.isVisible).toBe(true);
            expect(result.current.data).toEqual(testData);
        });

        it("debe abrir el modal con modo específico", () => {
            const { result } = renderHook(() => useModalState());

            act(() => {
                result.current.open(null, "create");
            });

            expect(result.current.isVisible).toBe(true);
            expect(result.current.mode).toBe("create");
        });

        it("debe abrir el modal con datos y modo", () => {
            const { result } = renderHook(() => useModalState());
            const testData = { id: 456 };

            act(() => {
                result.current.open(testData, "edit");
            });

            expect(result.current.isVisible).toBe(true);
            expect(result.current.data).toEqual(testData);
            expect(result.current.mode).toBe("edit");
        });
    });

    describe("close()", () => {
        it("debe cerrar el modal y resetear data/mode", () => {
            const { result } = renderHook(() => useModalState());

            act(() => {
                result.current.open({ id: 1 }, "edit");
            });

            expect(result.current.isVisible).toBe(true);

            act(() => {
                result.current.close();
            });

            expect(result.current.isVisible).toBe(false);
            expect(result.current.data).toBe(null);
            expect(result.current.mode).toBe("none");
        });

        it("debe cerrar sin resetear data si se especifica", () => {
            const { result } = renderHook(() => useModalState());
            const testData = { id: 1 };

            act(() => {
                result.current.open(testData, "edit");
            });

            act(() => {
                result.current.close(false, false);
            });

            expect(result.current.isVisible).toBe(false);
            expect(result.current.data).toEqual(testData);
            expect(result.current.mode).toBe("edit");
        });
    });

    describe("toggle()", () => {
        it("debe alternar la visibilidad del modal", () => {
            const { result } = renderHook(() => useModalState());

            expect(result.current.isVisible).toBe(false);

            act(() => {
                result.current.toggle();
            });

            expect(result.current.isVisible).toBe(true);

            act(() => {
                result.current.toggle();
            });

            expect(result.current.isVisible).toBe(false);
        });
    });

    describe("setData()", () => {
        it("debe actualizar solo los datos del modal", () => {
            const { result } = renderHook(() => useModalState());

            act(() => {
                result.current.open(null, "create");
            });

            const newData = { id: 999 };

            act(() => {
                result.current.setData(newData);
            });

            expect(result.current.data).toEqual(newData);
            expect(result.current.isVisible).toBe(true);
            expect(result.current.mode).toBe("create");
        });
    });

    describe("setMode()", () => {
        it("debe actualizar solo el modo del modal", () => {
            const { result } = renderHook(() => useModalState());

            act(() => {
                result.current.open({ id: 1 }, "view");
            });

            act(() => {
                result.current.setMode("edit");
            });

            expect(result.current.mode).toBe("edit");
            expect(result.current.data).toEqual({ id: 1 });
            expect(result.current.isVisible).toBe(true);
        });
    });

    describe("Flujo completo", () => {
        it("debe manejar un flujo típico de edición", () => {
            const { result } = renderHook(() => useModalState());

            // 1. Usuario clickea "Editar"
            const userToEdit = { id: 10, name: "John Doe", email: "john@test.com" };
            act(() => {
                result.current.open(userToEdit, "edit");
            });

            expect(result.current.isVisible).toBe(true);
            expect(result.current.mode).toBe("edit");
            expect(result.current.data).toEqual(userToEdit);

            // 2. Usuario edita datos
            act(() => {
                result.current.setData({ ...userToEdit, name: "Jane Doe" });
            });

            expect(result.current.data.name).toBe("Jane Doe");

            // 3. Usuario cierra el modal
            act(() => {
                result.current.close();
            });

            expect(result.current.isVisible).toBe(false);
            expect(result.current.data).toBe(null);
            expect(result.current.mode).toBe("none");
        });
    });
});

describe("useMultiModalState", () => {
    it("debe crear múltiples modales independientes", () => {
        const { result } = renderHook(() =>
            useMultiModalState(["create", "edit", "delete"])
        );

        expect(result.current.create).toBeDefined();
        expect(result.current.edit).toBeDefined();
        expect(result.current.delete).toBeDefined();

        // Todos deben iniciar cerrados
        expect(result.current.create.isVisible).toBe(false);
        expect(result.current.edit.isVisible).toBe(false);
        expect(result.current.delete.isVisible).toBe(false);
    });

    it("debe permitir abrir modales independientemente", () => {
        const { result } = renderHook(() =>
            useMultiModalState(["create", "edit", "delete"])
        );

        // Abrir modal de crear
        act(() => {
            result.current.create.open();
        });

        expect(result.current.create.isVisible).toBe(true);
        expect(result.current.edit.isVisible).toBe(false);
        expect(result.current.delete.isVisible).toBe(false);

        // Abrir modal de editar
        act(() => {
            result.current.edit.open({ id: 1 }, "edit");
        });

        expect(result.current.create.isVisible).toBe(true);
        expect(result.current.edit.isVisible).toBe(true);
        expect(result.current.delete.isVisible).toBe(false);
    });

    it("debe manejar datos independientes por modal", () => {
        const { result } = renderHook(() =>
            useMultiModalState(["edit", "delete"])
        );

        const editData = { id: 1, name: "Edit" };
        const deleteData = { id: 2, name: "Delete" };

        act(() => {
            result.current.edit.open(editData, "edit");
            result.current.delete.open(deleteData, "delete");
        });

        expect(result.current.edit.data).toEqual(editData);
        expect(result.current.delete.data).toEqual(deleteData);
    });
});
