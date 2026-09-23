// Biometric (ms-biometric :8086). Enroll/verify/identify facial + huella.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

export const biometricApi = {
    enrollFacial: (b: { person_id: string; encoding: number[]; model_version?: string }) =>
        request<unknown>(endpoints.biometric.facialEnroll, { method: "POST", body: b }),
    verifyFacial: (b: { person_id: string; encoding: number[] }) =>
        request<{ match: boolean; score: number }>(endpoints.biometric.facialVerify, { method: "POST", body: b }),
    identifyFacial: (encoding: number[]) =>
        request<{ person_id: string; score: number }>(endpoints.biometric.facialIdentify, { method: "POST", body: { encoding } }),
    facialOf: (personId: string) =>
        request<unknown>(endpoints.biometric.facialByPerson(personId), { method: "GET" }),
    enrollFingerprint: (b: { person_id: string; finger_number: number; encoding: number[] }) =>
        request<unknown>(endpoints.biometric.fingerprintEnroll, { method: "POST", body: b }),
    verifyFingerprint: (b: { person_id: string; finger_number: number; encoding: number[] }) =>
        request<{ match: boolean; score: number }>(endpoints.biometric.fingerprintVerify, { method: "POST", body: b }),
    requestUpdate: (b: { person_id: string; biometric_type: string; reason: string }) =>
        request<unknown>(endpoints.biometric.updateRequest, { method: "POST", body: b }),
    updatesOf: (personId: string) =>
        request<unknown>(endpoints.biometric.updateRequestsByPerson(personId), { method: "GET" }),
};
