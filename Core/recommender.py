# Core/recommender.py
import pandas as pd
from sklearn.neighbors import NearestNeighbors
import numpy as np

class LipRecommender:
    def __init__(self, dataset_path="lip_shapes_dataset.csv"):
        try:
            self.df = pd.read_csv(dataset_path)
        except FileNotFoundError:
            raise FileNotFoundError(f"Dataset not found at {dataset_path}")
            
        self.feature_columns = [col for col in self.df.columns if col not in ['label']]
        self.X = self.df[self.feature_columns]
        self.y = self.df['label']

    def recommend(self, original_shape_dict, desired_style):
        
        # 1. Filter by style
        style_indices = self.y[self.y == desired_style].index
        if len(style_indices) == 0:
            return None
            
        X_filtered = self.X.loc[style_indices]
        
        # 2. Fit KNN
        knn = NearestNeighbors(n_neighbors=1)
        knn.fit(X_filtered)
        
        # 3. Prep user features (ensure column order and fill missing)
        user_features_df = pd.DataFrame([original_shape_dict])
        user_features_df = user_features_df.reindex(columns=self.feature_columns, fill_value=0.0)
        
        # 4. Find nearest neighbor
        distances, indices = knn.kneighbors(user_features_df)
        best_match_index_in_filtered = indices[0][0]
        original_df_index = X_filtered.iloc[best_match_index_in_filtered].name
        
        # 5. Get the target shape
        target_shape_dict = self.X.loc[original_df_index].to_dict()
        
        return target_shape_dict