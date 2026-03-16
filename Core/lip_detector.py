# Core/lip_detector.py
import cv2
import mediapipe as mp
import numpy as np

# --- Define the 4 lip contours in order ---
UPPER_OUTER_IDS = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291]
LOWER_OUTER_IDS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291]
UPPER_INNER_IDS = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308]
LOWER_INNER_IDS = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308]

# --- Combine all lists and remove duplicates ---
LIP_POINT_IDS = sorted(list(set(
    UPPER_OUTER_IDS + LOWER_OUTER_IDS + UPPER_INNER_IDS + LOWER_INNER_IDS
)))

class LipDetector:
    def __init__(self,
                 static_image_mode=False,
                 max_num_faces=1,
                 refine_landmarks=True,
                 min_detection_confidence=0.5,
                 min_tracking_confidence=0.5):

        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=static_image_mode,
            max_num_faces=max_num_faces,
            refine_landmarks=refine_landmarks,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )

    def process_bgr(self, image_bgr):
        h, w = image_bgr.shape[:2]
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(image_rgb)

        output = {
            "annotated_bgr": image_bgr.copy(),
            "landmarks": [],
            "lip_points": [],
            "face_detected": False
        }

        if not results.multi_face_landmarks:
            return output

        face_landmarks = results.multi_face_landmarks[0]
        output["face_detected"] = True

        # Store all 478 face landmarks
        for i, lm in enumerate(face_landmarks.landmark):
            x_px = int(lm.x * w)
            y_px = int(lm.y * h)
            output["landmarks"].append({
                "index": i, "x_norm": lm.x, "y_norm": lm.y, "x_px": x_px, "y_px": y_px
            })

        # Store only lip landmarks
        for lm_data in output["landmarks"]:
             if lm_data["index"] in LIP_POINT_IDS:
                output["lip_points"].append(lm_data)

        return output