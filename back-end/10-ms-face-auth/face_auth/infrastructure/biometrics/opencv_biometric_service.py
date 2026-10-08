import base64
import json
import re
from typing import Any
from urllib.parse import unquote

import cv2
import face_recognition
import numpy as np

from ...application.ports.out.biometric_service import BiometricService

MAX_DECODED_BYTES = 3 * 1024 * 1024
MAX_IMAGE_PIXELS = 16_000_000
BLINK_EAR_DELTA = 0.06
FRAMES_PER_ACTION = 6
MOVEMENT_DELTA = 0.05
MOUTH_OPENING_DELTA = 0.07
FACE_DETECTION_MODEL = "hog"


class OpenCVBiometricService(BiometricService):
    def decode_image(self, data_url: str) -> np.ndarray:
        try:
            encoded = data_url.split(",", 1)[1] if "," in data_url else data_url
            image_bytes = base64.b64decode(encoded, validate=True)
            if len(image_bytes) > MAX_DECODED_BYTES:
                raise ValueError("La imagen supera el tamaño permitido")
            image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                raise ValueError("No se pudo decodificar la imagen")
            if image.shape[0] * image.shape[1] > MAX_IMAGE_PIXELS:
                raise ValueError("La imagen tiene demasiados píxeles")
            return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        except Exception as exc:
            raise ValueError(f"Imagen inválida: {exc}") from exc

    def decode_fingerprint(self, data_base64: str) -> np.ndarray:
        try:
            encoded = unquote(data_base64).strip()
            if encoded.startswith("["):
                decoder = json.JSONDecoder()
                chunks: list[str] = []
                position = 0
                while position < len(encoded):
                    while position < len(encoded) and encoded[position].isspace():
                        position += 1
                    if position >= len(encoded):
                        break
                    value, position = decoder.raw_decode(encoded, position)
                    if not isinstance(value, list) or not all(isinstance(chunk, str) for chunk in value):
                        raise ValueError("Formato de muestra inválido")
                    chunks.extend(value)
                encoded = "".join(chunks)
            if "," in encoded:
                encoded = encoded.split(",", 1)[1]
            encoded = "".join(encoded.split()).replace("-", "+").replace("_", "/")
            if len(encoded) > 4_000_000 or not re.fullmatch(r"[A-Za-z0-9+/]*={0,2}", encoded):
                raise ValueError("Base64 inválido")
            encoded += "=" * (-len(encoded) % 4)
            image_bytes = base64.b64decode(encoded, validate=True)
            if len(image_bytes) > MAX_DECODED_BYTES:
                raise ValueError("La muestra supera el tamaño permitido")
            image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_GRAYSCALE)
            if image is None:
                raise ValueError("No se pudo decodificar la muestra")
            if image.shape[0] * image.shape[1] > MAX_IMAGE_PIXELS:
                raise ValueError("La muestra tiene demasiados píxeles")
            return image
        except Exception as exc:
            raise ValueError(f"Muestra de huella inválida: {exc}") from exc

    def face_encoding(self, image: np.ndarray) -> Any:
        locations = face_recognition.face_locations(image, number_of_times_to_upsample=0, model=FACE_DETECTION_MODEL)
        if len(locations) > 1:
            raise ValueError("La imagen debe contener un solo rostro")
        encodings = face_recognition.face_encodings(image, locations)
        return encodings[0] if encodings else None

    def validate_liveness(self, images: list[np.ndarray], actions: list[str]) -> bool:
        if not actions or len(images) != len(actions) * FRAMES_PER_ACTION:
            return False

        for action_index, action in enumerate(actions):
            action_images = images[action_index * FRAMES_PER_ACTION : (action_index + 1) * FRAMES_PER_ACTION]
            measurements: list[tuple[float, float, float]] = []
            for image in action_images:
                measurement = self._face_measurements(image)
                if measurement is None:
                    return False
                measurements.append(measurement)
            if not self._action_detected(action, measurements):
                return False
        return True

    def _face_measurements(self, image: np.ndarray) -> tuple[float, float, float] | None:
        locations = face_recognition.face_locations(image, number_of_times_to_upsample=0, model=FACE_DETECTION_MODEL)
        if len(locations) != 1:
            return None
        landmarks = face_recognition.face_landmarks(image, locations)
        if len(landmarks) != 1:
            return None
        left_eye = landmarks[0].get("left_eye")
        right_eye = landmarks[0].get("right_eye")
        nose = landmarks[0].get("nose_tip")
        top_lip = landmarks[0].get("top_lip")
        bottom_lip = landmarks[0].get("bottom_lip")
        if not left_eye or not right_eye or not nose or not top_lip or not bottom_lip:
            return None
        eye_width = np.linalg.norm(np.asarray(left_eye[0]) - np.asarray(right_eye[3]))
        if eye_width == 0:
            return None
        eye_center_x = (left_eye[0][0] + right_eye[3][0]) / 2
        nose_x = float(np.mean(np.asarray(nose)[:, 0]))
        mouth_width = np.linalg.norm(np.asarray(top_lip[0]) - np.asarray(top_lip[6]))
        mouth_height = np.linalg.norm(np.asarray(top_lip[3]) - np.asarray(bottom_lip[3]))
        return (
            self._eye_aspect_ratio(left_eye) + self._eye_aspect_ratio(right_eye),
            (nose_x - eye_center_x) / eye_width,
            mouth_height / mouth_width if mouth_width else 0.0,
        )

    @staticmethod
    def _action_detected(action: str, measurements: list[tuple[float, float, float]]) -> bool:
        if action == "blink":
            values = [measurement[0] for measurement in measurements]
            return max(values) - min(values) >= BLINK_EAR_DELTA
        if action == "turn":
            values = [measurement[1] for measurement in measurements]
            return max(values) - min(values) >= MOVEMENT_DELTA
        if action == "open_mouth":
            values = [measurement[2] for measurement in measurements]
            return max(values) - min(values) >= MOUTH_OPENING_DELTA
        return False

    @staticmethod
    def _eye_aspect_ratio(eye: list[tuple[int, int]]) -> float:
        points = np.asarray(eye, dtype=np.float64)
        horizontal = np.linalg.norm(points[0] - points[3])
        if horizontal == 0:
            return 0.0
        return float((np.linalg.norm(points[1] - points[5]) + np.linalg.norm(points[2] - points[4])) / (2 * horizontal))

    def face_distance(self, stored_encoding: str, query_encoding: Any) -> float:
        stored = np.asarray(json.loads(stored_encoding), dtype=np.float64)
        return float(np.linalg.norm(stored - query_encoding))

    def fingerprint_score(self, query_image: np.ndarray, stored_sample: str) -> int:
        stored_image = self.decode_fingerprint(stored_sample)
        try:
            detector = cv2.SIFT_create()
            matcher = cv2.BFMatcher(cv2.NORM_L2)
            is_orb = False
        except Exception:
            try:
                detector = cv2.xfeatures2d.SIFT_create()
                matcher = cv2.BFMatcher(cv2.NORM_L2)
                is_orb = False
            except Exception:
                detector = cv2.ORB_create()
                matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
                is_orb = True
        _, query_descriptors = detector.detectAndCompute(query_image, None)
        _, stored_descriptors = detector.detectAndCompute(stored_image, None)
        if query_descriptors is None or stored_descriptors is None:
            return 0
        matches = matcher.knnMatch(query_descriptors, stored_descriptors, k=2)
        ratio = 0.75 if is_orb else 0.7
        return sum(1 for pair in matches if len(pair) == 2 and pair[0].distance < ratio * pair[1].distance)
