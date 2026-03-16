# Core/draw.py
import cv2
import numpy as np

from .lip_detector import (
    UPPER_OUTER_IDS, LOWER_OUTER_IDS, UPPER_INNER_IDS, LOWER_INNER_IDS
)

def draw_lip_lines(image_bgr, lip_points, color=(0,255,0), thickness=1, connect=True):
    img = image_bgr.copy()
    point_map = {p["index"]: (p["x_px"], p["y_px"]) for p in lip_points}

    # Draw all detected lip points as small circles
    for (x, y) in point_map.values():
        cv2.circle(img, (x, y), 2, color, -1)

    if connect:
        contours = [UPPER_OUTER_IDS, LOWER_OUTER_IDS, UPPER_INNER_IDS, LOWER_INNER_IDS]
        for contour_ids in contours:
            pts = []
            for idx in contour_ids:
                if idx in point_map:
                    pts.append(point_map[idx])
            
            if len(pts) >= 2:
                cv2.polylines(img, [np.array(pts, dtype=int)], isClosed=False, color=color, thickness=thickness)
    
    return img