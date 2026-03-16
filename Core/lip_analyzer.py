# Core/lip_analyzer.py
import numpy as np

# --- Key landmark indices from MediaPipe 478-landmark model ---
LEFT_CORNER_IDX = 61
RIGHT_CORNER_IDX = 291
TOP_OUTER_LIP_IDX = 0
BOTTOM_OUTER_LIP_IDX = 17
TOP_INNER_LIP_IDX = 13
BOTTOM_INNER_LIP_IDX = 14
CUPIDS_BOW_LEFT_IDX = 267
CUPIDS_BOW_RIGHT_IDX = 37

class LipAnalyzer:
    def __init__(self, lip_points):
        if not lip_points:
            raise ValueError("Lip points list is empty. Cannot analyze.")
        self.point_map = {p["index"]: (p["x_px"], p["y_px"]) for p in lip_points}

    def get_point(self, index):
        return self.point_map.get(index, (0, 0)) # Use .get for safety

    def calculate_distance(self, p1_idx, p2_idx):
        p1 = np.array(self.get_point(p1_idx))
        p2 = np.array(self.get_point(p2_idx))
        return np.linalg.norm(p1 - p2)

    def calculate_vertical_distance(self, p1_idx, p2_idx):
        y1 = self.get_point(p1_idx)[1]
        y2 = self.get_point(p2_idx)[1]
        return abs(y1 - y2)

    def calculate_angle(self, p1_idx, vertex_idx, p2_idx):
        p1 = np.array(self.get_point(p1_idx))
        vertex = np.array(self.get_point(vertex_idx))
        p2 = np.array(self.get_point(p2_idx))
        
        v1 = p1 - vertex
        v2 = p2 - vertex
        
        dot_prod = np.dot(v1, v2)
        mag_v1 = np.linalg.norm(v1)
        mag_v2 = np.linalg.norm(v2)
        
        if mag_v1 == 0 or mag_v2 == 0: return 0.0
        
        cos_angle = np.clip(dot_prod / (mag_v1 * mag_v2), -1.0, 1.0)
        return np.degrees(np.arccos(cos_angle))

    def calculate_all_features(self):
        lip_width = self.calculate_distance(LEFT_CORNER_IDX, RIGHT_CORNER_IDX)
        lip_height = self.calculate_vertical_distance(TOP_OUTER_LIP_IDX, BOTTOM_OUTER_LIP_IDX)
        upper_lip_thickness = self.calculate_vertical_distance(TOP_OUTER_LIP_IDX, TOP_INNER_LIP_IDX)
        lower_lip_thickness = self.calculate_vertical_distance(BOTTOM_INNER_LIP_IDX, BOTTOM_OUTER_LIP_IDX)
        
        upper_lower_ratio = 0.0
        if lower_lip_thickness > 0:
            upper_lower_ratio = upper_lip_thickness / lower_lip_thickness
        
        width_height_ratio = 0.0
        if lip_height > 0:
            width_height_ratio = lip_width / lip_height
        
        mouth_openness = self.calculate_vertical_distance(TOP_INNER_LIP_IDX, BOTTOM_INNER_LIP_IDX)
        mouth_corner_angle = self.calculate_angle(LEFT_CORNER_IDX, BOTTOM_OUTER_LIP_IDX, RIGHT_CORNER_IDX)
        cupids_bow_angle = self.calculate_angle(CUPIDS_BOW_LEFT_IDX, TOP_OUTER_LIP_IDX, CUPIDS_BOW_RIGHT_IDX)

        # Simple symmetry
        left_thickness = self.calculate_vertical_distance(267, 310) 
        right_thickness = self.calculate_vertical_distance(37, 80)
        symmetry_score = 1.0
        if max(left_thickness, right_thickness) > 0:
            symmetry_score = min(left_thickness, right_thickness) / max(left_thickness, right_thickness)

        features = {
            "Lip Width (px)": lip_width,
            "Lip Height (px)": lip_height,
            "Upper Lip Thickness (px)": upper_lip_thickness,
            "Lower Lip Thickness (px)": lower_lip_thickness,
            "Upper:Lower Ratio": upper_lower_ratio,
            "Lip Width-to-Height Ratio": width_height_ratio,
            "Mouth Openness (px)": mouth_openness,
            "Cupid's Bow Angle (deg)": cupids_bow_angle,
            "Mouth Corner Angle (deg)": mouth_corner_angle,
            "Symmetry Score (0-1)": symmetry_score,
        }
        
        return {key: round(value, 2) for key, value in features.items()}