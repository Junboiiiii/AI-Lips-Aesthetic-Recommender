# api.py
import base64
import json  
import os    
import traceback
from datetime import datetime 
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import Response, FileResponse 
from fastapi.middleware.cors import CORSMiddleware
from fpdf import FPDF 
import cv2
import numpy as np
import joblib

# Import Core modules
from Core.lip_detector import LipDetector
from Core.lip_analyzer import LipAnalyzer
from Core.recommender import LipRecommender

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LOAD MODELS ---
print("--- Loading AI Models ---")
try:
    detector = LipDetector(static_image_mode=True, max_num_faces=1)
    classifier = joblib.load("lip_style_recommender.joblib")
    encoder = joblib.load("label_encoder.joblib")
    recommender = LipRecommender("lip_shapes_dataset.csv")
    print("✅ Models Loaded!")
except Exception as e:
    print(f"❌ CRITICAL ERROR: {e}")

# --- HELPER FUNCTIONS ---

def generate_ai_advice(orig_feats, target_feats, style):
    """Generates clinical advice based on feature differences."""
    advice = []
    advice.append(f"Subject has requested a transition to {style.replace('_', ' ').title()}.")
    
    # 1. Analyze Width
    w_diff = target_feats.get('Lip Width', 0) - orig_feats.get('Lip Width', 0)
    if w_diff > 5:
        advice.append(f"Horizontal augmentation indicated (+{w_diff:.1f}px). Suggest lateral commissure filler.")
    elif w_diff < -5:
        advice.append(f"Target profile is narrower. Reduction techniques may be applicable.")
    
    # 2. Analyze Ratio
    orig_ratio = orig_feats.get('Upper/Lower Ratio', 0)
    target_ratio = target_feats.get('Upper/Lower Ratio', 0)
    if target_ratio > orig_ratio + 0.1:
        advice.append("Upper lip emphasis required. Suggest vermilion border enhancement.")
    elif target_ratio < orig_ratio - 0.1:
        advice.append("Lower lip volume addition recommended for vertical balance.")
        
    # 3. Analyze Thickness
    thick_diff = target_feats.get('Total Thickness', 0) - orig_feats.get('Total Thickness', 0)
    if thick_diff > 3:
        advice.append("Overall volume increase indicated. Hyaluronic acid fillers suggested.")
        
    advice.append("Please evaluate patient vascular safety before proceeding.")
    return " ".join(advice)

class PDFReport(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'Lip Aesthetic AI - Clinical Analysis Report', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def denormalize_shape(target_shape_dict, ref_points):
    try:
        p_left = next(p for p in ref_points if p["index"] == 61)
        p_right = next(p for p in ref_points if p["index"] == 291)
    except StopIteration:
        return []
    mouth_center_x = (p_left["x_px"] + p_right["x_px"]) / 2
    mouth_center_y = (p_left["y_px"] + p_right["y_px"]) / 2
    mouth_width = abs(p_left["x_px"] - p_right["x_px"])
    new_landmarks = []
    for p in ref_points:
        idx = p["index"]
        key_x, key_y = f"p{idx}_x", f"p{idx}_y"
        norm_x, norm_y = target_shape_dict.get(key_x), target_shape_dict.get(key_y)
        if norm_x is not None:
            px = int((norm_x * mouth_width) + mouth_center_x)
            py = int((norm_y * mouth_width) + mouth_center_y)
            new_landmarks.append({"index": idx, "x_px": px, "y_px": py})
    return new_landmarks

def warp_lips(image_bgr, original_points_list, target_points_list, stiffness=25.0):
    h, w = image_bgr.shape[:2]
    source_points, target_points = [], []
    target_map = {p["index"]: (p["x_px"], p["y_px"]) for p in target_points_list}
    for p in original_points_list:
        idx = p["index"]
        if idx in target_map:
            source_points.append((p["x_px"], p["y_px"]))
            target_points.append(target_map[idx])
            
    if len(source_points) < 10: return image_bgr

    anchors = [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1), 
               (w//2, 0), (w//2, h-1), (0, h//2), (w-1, h//2)]
    for pt in anchors:
        source_points.append(pt); target_points.append(pt)

    source_np = np.array(source_points, dtype=np.float32).reshape(1, -1, 2)
    target_np = np.array(target_points, dtype=np.float32).reshape(1, -1, 2)
    matches = [cv2.DMatch(i, i, 0) for i in range(len(source_np[0]))]
    
    tps = cv2.createThinPlateSplineShapeTransformer()
    # This now uses whatever value is passed in, instead of always being 25.0
    tps.setRegularizationParameter(stiffness) 
    tps.estimateTransformation(source_np, target_np, matches)
    return tps.warpImage(image_bgr)

# --- API ENDPOINTS ---

@app.post("/analyze")
async def analyze_lips(
    file: UploadFile = File(...), 
    style: str = Form(...),

    intensity: float = Form(25.0) 
):
    print(f"\n📩 Received Request. Style: '{style}', Intensity: {intensity}")
    
    try:
        clean_style = style.lower().strip().replace(" ", "_")
        if "asian" in clean_style: clean_style = "asian_style"
        elif "caucasian" in clean_style: clean_style = "caucasian_style"

        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image_bgr is None: return {"error": "Invalid Image"}

        res = detector.process_bgr(image_bgr)
        if not res["face_detected"]: return {"error": "No Face Detected"}
        
        original_landmarks = res["lip_points"]
        analyzer_orig = LipAnalyzer(original_landmarks)
        original_features = analyzer_orig.calculate_all_features()

        p_left = next(p for p in original_landmarks if p["index"] == 61)
        p_right = next(p for p in original_landmarks if p["index"] == 291)
        mouth_width = abs(p_left["x_px"] - p_right["x_px"])
        mouth_center_x = (p_left["x_px"] + p_right["x_px"]) / 2
        
        user_shape_dict = {}
        for p in original_landmarks:
            k_x, k_y = f"p{p['index']}_x", f"p{p['index']}_y"
            if k_x in recommender.feature_columns:
                user_shape_dict[k_x] = (p["x_px"] - mouth_center_x) / mouth_width
                user_shape_dict[k_y] = (p["y_px"] - (p_left["y_px"] + p_right["y_px"])/2) / mouth_width

        target_shape_dict = recommender.recommend(user_shape_dict, clean_style)
        
        if not target_shape_dict: return {"error": "Style not found"}

        target_landmarks = denormalize_shape(target_shape_dict, original_landmarks)
        analyzer_target = LipAnalyzer(target_landmarks)
        target_features = analyzer_target.calculate_all_features()

        warped_image = warp_lips(
            image_bgr, 
            original_landmarks, 
            target_landmarks, 
            stiffness=intensity
        )
        
        final_image = cv2.addWeighted(image_bgr, 0.2, warped_image, 0.8, 0)
        
        _, buffer = cv2.imencode('.jpg', final_image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        print("✅ Sending JSON response with Data + Image")
        
        return {
            "status": "success",
            "image": f"data:image/jpeg;base64,{img_base64}",
            "original_features": original_features,
            "target_features": target_features,
            "style": clean_style
        }

    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}

@app.post("/generate-report")
async def generate_report(
    original_file: UploadFile = File(...),
    warped_file: UploadFile = File(...),
    data: str = Form(...) 
):
    try:
        # Decode inputs
        json_data = json.loads(data)
        orig_feats = json_data.get("original_features", {})
        target_feats = json_data.get("target_features", {})
        style = json_data.get("style", "Unknown")
        
        # Save temp images for PDF
        orig_bytes = await original_file.read()
        warped_bytes = await warped_file.read()
        
        # NOTE: In a real production app, use unique filenames.
        # For FYP, overwriting "temp.jpg" is acceptable.
        with open("temp_orig.jpg", "wb") as f: f.write(orig_bytes)
        with open("temp_warp.jpg", "wb") as f: f.write(warped_bytes)
        
        # Generate Text Advice
        ai_advice = generate_ai_advice(orig_feats, target_feats, style)
        
        # Create PDF
        pdf = PDFReport()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        # Patient Info Section
        pdf.cell(0, 10, f"Date: {datetime.now().strftime('%Y-%m-%d')}", ln=True)
        pdf.cell(0, 10, f"Target Style: {style.replace('_', ' ').title()}", ln=True)
        pdf.ln(5)
        
        # Images Section
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, "Visual Projection:", ln=True)
        
        # Place images side by side (x, y, w, h)
        pdf.image("temp_orig.jpg", x=10, y=50, w=90)
        pdf.image("temp_warp.jpg", x=110, y=50, w=90)
        
        pdf.set_xy(10, 110) # Move cursor below images
        pdf.set_font("Arial", size=10)
        pdf.cell(90, 10, "Original State", 0, 0, 'C')
        pdf.cell(90, 10, "AI Projection", 0, 1, 'C')
        pdf.ln(10)
        
        # AI Advice Section
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, "Generative AI Clinical Recommendations:", ln=True)
        pdf.set_font("Arial", 'I', 11)
        pdf.multi_cell(0, 7, ai_advice)
        pdf.ln(10)
        
        # Data Table
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, "Metric Analysis:", ln=True)
        pdf.set_font("Arial", 'B', 10)
        
        # Table Header
        pdf.cell(60, 10, "Feature", 1)
        pdf.cell(40, 10, "Original", 1)
        pdf.cell(40, 10, "Target", 1)
        pdf.cell(40, 10, "Difference", 1)
        pdf.ln()
        
        pdf.set_font("Arial", size=10)
        for key in orig_feats:
            if key in target_feats:
                val_o = orig_feats[key]
                val_t = target_feats[key]
                diff = val_t - val_o
                
                pdf.cell(60, 10, str(key), 1)
                pdf.cell(40, 10, f"{val_o:.1f}", 1)
                pdf.cell(40, 10, f"{val_t:.1f}", 1)
                
                change_str = f"{diff:+.1f}"
                pdf.cell(40, 10, change_str, 1)
                pdf.ln()
                
        # Disclaimer
        pdf.ln(15)
        pdf.set_font("Arial", size=8)
        pdf.set_text_color(100, 100, 100)
        pdf.multi_cell(0, 5, "DISCLAIMER: This report is generated by AI for simulation purposes only. It does not constitute medical advice. A qualified professional must verify all metrics before any procedure.")
        
        output_filename = "AI_Report.pdf"
        pdf.output(output_filename)
        
        return FileResponse(output_filename, media_type='application/pdf', filename="Clinical_Report.pdf")

    except Exception as e:
        traceback.print_exc()
        return Response(content=str(e), status_code=500)