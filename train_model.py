# train_model.py

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

# --- 1. Configuration ---
DATASET_CSV = "lip_measurements_dataset.csv"
MODEL_OUTPUT_FILE = "lip_style_recommender.joblib"
LABEL_ENCODER_FILE = "label_encoder.joblib"
REPORT_IMAGE_FILE = "training_report_confusion_matrix.png" # Saves a chart

print("--- Starting Model Training ---")

# --- 2. Load and Prepare Data ---
try:
    df = pd.read_csv(DATASET_CSV)
except FileNotFoundError:
    print(f"Error: {DATASET_CSV} not found. Did you run build_dataset.py?")
    exit()

print(f"Loaded {len(df)} samples from {DATASET_CSV}")

# Separate features (X) and the label (y)
X = df.drop(columns=['label'])
y = df['label']

# --- 3. Encode Labels ---
le = LabelEncoder()
y_encoded = le.fit_transform(y)
class_names = le.classes_
print(f"Labels encoded. Classes: {class_names}")

# --- 4. Split Data ---
# 80% Training, 20% Testing
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)
print(f"Data split: {len(X_train)} training samples, {len(X_test)} testing samples.")

# --- 5. Train Model ---
print("Training RandomForestClassifier...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
print("Training complete.")

# --- 6. Detailed Evaluation ---
print("\n--- Model Evaluation Report ---")
y_pred = model.predict(X_test)

# A. Accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f"✅ Overall Accuracy: {accuracy * 100:.2f}%")

# B. Classification Report (Precision, Recall, F1-Score)
print("\nDetailed Classification Report:")
report = classification_report(y_test, y_pred, target_names=class_names)
print(report)

# C. Confusion Matrix (The "Heatmap")
cm = confusion_matrix(y_test, y_pred)

# Visualize and Save the Confusion Matrix
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
plt.title('Confusion Matrix')
plt.ylabel('True Label')
plt.xlabel('Predicted Label')
plt.tight_layout()
plt.savefig(REPORT_IMAGE_FILE)
print(f"\n✅ Confusion Matrix chart saved to: {REPORT_IMAGE_FILE}")

# --- 7. Save the Model ---
joblib.dump(model, MODEL_OUTPUT_FILE)
joblib.dump(le, LABEL_ENCODER_FILE)

print(f"✅ Model saved to {MODEL_OUTPUT_FILE}")
print(f"✅ Label Encoder saved to {LABEL_ENCODER_FILE}")
print("--- Training Script Finished ---")