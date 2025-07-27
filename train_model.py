import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import json

# Sample training data
data = [
    {"runs_scored": 23, "innings_type": "balanced", "strike_rate": 189, "no_of_6s": 2},
    {"runs_scored": 20, "innings_type": "aggressive", "strike_rate": 259, "no_of_6s": 3},
    {"runs_scored": 10, "innings_type": "aggressive", "strike_rate": 230, "no_of_6s": 1},
    {"runs_scored": 11, "innings_type": "balanced", "strike_rate": 160, "no_of_6s": 0},
    {"runs_scored": 12, "innings_type": "balanced", "strike_rate": 180, "no_of_6s": 1},
    {"runs_scored": 9, "innings_type": "defensive", "strike_rate": 120, "no_of_6s": 0},
    {"runs_scored": 13, "innings_type": "defensive", "strike_rate": 110, "no_of_6s": 0},
    {"runs_scored": 24, "innings_type": "defensive", "strike_rate": 150, "no_of_6s": 1},
    {"runs_scored": 30, "innings_type": "balanced", "strike_rate": 185, "no_of_6s": 3},
    {"runs_scored": 23, "innings_type": "aggressive", "strike_rate": 226, "no_of_6s": 3},
    {"runs_scored": 15, "innings_type": "balanced", "strike_rate": 175, "no_of_6s": 1},
    {"runs_scored": 27, "innings_type": "aggressive", "strike_rate": 230, "no_of_6s": 4},
    {"runs_scored": 18, "innings_type": "defensive", "strike_rate": 130, "no_of_6s": 0},
    {"runs_scored": 22, "innings_type": "balanced", "strike_rate": 190, "no_of_6s": 2},
    {"runs_scored": 35, "innings_type": "aggressive", "strike_rate": 250, "no_of_6s": 5},
    {"runs_scored": 17, "innings_type": "defensive", "strike_rate": 140, "no_of_6s": 1},
    {"runs_scored": 14, "innings_type": "defensive", "strike_rate": 115, "no_of_6s": 0},
    {"runs_scored": 26, "innings_type": "aggressive", "strike_rate": 250, "no_of_6s": 3},
    {"runs_scored": 21, "innings_type": "balanced", "strike_rate": 185, "no_of_6s": 2},
    {"runs_scored": 9, "innings_type": "defensive", "strike_rate": 105, "no_of_6s": 0},
    {"runs_scored": 29, "innings_type": "aggressive", "strike_rate": 260, "no_of_6s": 4},
    {"runs_scored": 16, "innings_type": "balanced", "strike_rate": 165, "no_of_6s": 1},
    {"runs_scored": 31, "innings_type": "aggressive", "strike_rate": 220, "no_of_6s": 3},
    {"runs_scored": 11, "innings_type": "defensive", "strike_rate": 120, "no_of_6s": 0},
    {"runs_scored": 28, "innings_type": "aggressive", "strike_rate": 230, "no_of_6s": 4},
    {"runs_scored": 13, "innings_type": "balanced", "strike_rate": 155, "no_of_6s": 1},
    {"runs_scored": 20, "innings_type": "defensive", "strike_rate": 135, "no_of_6s": 0},
    {"runs_scored": 32, "innings_type": "aggressive", "strike_rate": 210, "no_of_6s": 4},
    {"runs_scored": 19, "innings_type": "balanced", "strike_rate": 170, "no_of_6s": 1},
    {"runs_scored": 25, "innings_type": "aggressive", "strike_rate": 265, "no_of_6s": 3},
    {"runs_scored": 22, "innings_type": "aggressive", "strike_rate": 180, "no_of_6s": 2},
    {"runs_scored": 14, "innings_type": "balanced", "strike_rate": 160, "no_of_6s": 1},
    {"runs_scored": 35, "innings_type": "aggressive", "strike_rate": 215, "no_of_6s": 4},
    {"runs_scored": 10, "innings_type": "defensive", "strike_rate": 110, "no_of_6s": 0},
    {"runs_scored": 18, "innings_type": "balanced", "strike_rate": 175, "no_of_6s": 1},
    {"runs_scored": 24, "innings_type": "aggressive", "strike_rate": 230, "no_of_6s": 3},
    {"runs_scored": 27, "innings_type": "defensive", "strike_rate": 145, "no_of_6s": 1},
    {"runs_scored": 13, "innings_type": "balanced", "strike_rate": 150, "no_of_6s": 0},
    {"runs_scored": 30, "innings_type": "aggressive", "strike_rate": 200, "no_of_6s": 2},
    {"runs_scored": 19, "innings_type": "defensive", "strike_rate": 140, "no_of_6s": 0},
    {"runs_scored": 23, "innings_type": "aggressive", "strike_rate": 200, "no_of_6s": 3},
    {"runs_scored": 12, "innings_type": "balanced", "strike_rate": 155, "no_of_6s": 1},
    {"runs_scored": 38, "innings_type": "aggressive", "strike_rate": 226, "no_of_6s": 4},
    {"runs_scored": 16, "innings_type": "defensive", "strike_rate": 130, "no_of_6s": 1},
    {"runs_scored": 31, "innings_type": "balanced", "strike_rate": 195, "no_of_6s": 2},
    {"runs_scored": 20, "innings_type": "aggressive", "strike_rate": 230, "no_of_6s": 3},
    {"runs_scored": 17, "innings_type": "defensive", "strike_rate": 135, "no_of_6s": 0},
    {"runs_scored": 28, "innings_type": "aggressive", "strike_rate": 240, "no_of_6s": 2},
    {"runs_scored": 22, "innings_type": "balanced", "strike_rate": 170, "no_of_6s": 1},
    {"runs_scored": 14, "innings_type": "defensive", "strike_rate": 125, "no_of_6s": 0},
    {"runs_scored": 36, "innings_type": "aggressive", "strike_rate": 220, "no_of_6s": 5},
    {"runs_scored": 18, "innings_type": "balanced", "strike_rate": 180, "no_of_6s": 2},
    {"runs_scored": 21, "innings_type": "aggressive", "strike_rate": 190, "no_of_6s": 2},
    {"runs_scored": 15, "innings_type": "defensive", "strike_rate": 120, "no_of_6s": 0},
    {"runs_scored": 40, "innings_type": "aggressive", "strike_rate": 200, "no_of_6s": 6},
    {"runs_scored": 19, "innings_type": "balanced", "strike_rate": 160, "no_of_6s": 1},
    {"runs_scored": 25, "innings_type": "defensive", "strike_rate": 145, "no_of_6s": 0},
    {"runs_scored": 32, "innings_type": "aggressive", "strike_rate": 200, "no_of_6s": 4},
    {"runs_scored": 23, "innings_type": "balanced", "strike_rate": 175, "no_of_6s": 2},
    {"runs_scored": 12, "innings_type": "defensive", "strike_rate": 110, "no_of_6s": 0},
    {"runs_scored": 29, "innings_type": "aggressive", "strike_rate": 190, "no_of_6s": 3},
    {"runs_scored": 20, "innings_type": "balanced", "strike_rate": 185, "no_of_6s": 2},
    {"runs_scored": 33, "innings_type": "aggressive", "strike_rate": 195, "no_of_6s": 4},
    {"runs_scored": 14, "innings_type": "defensive", "strike_rate": 115, "no_of_6s": 0},
    {"runs_scored": 27, "innings_type": "aggressive", "strike_rate": 190, "no_of_6s": 3},
    {"runs_scored": 18, "innings_type": "balanced", "strike_rate": 180, "no_of_6s": 1},
    {"runs_scored": 21, "innings_type": "defensive", "strike_rate": 140, "no_of_6s": 0},
    {"runs_scored": 38, "innings_type": "aggressive", "strike_rate": 192, "no_of_6s": 5},
    {"runs_scored": 15, "innings_type": "balanced", "strike_rate": 165, "no_of_6s": 1},
    {"runs_scored": 24, "innings_type": "defensive", "strike_rate": 135, "no_of_6s": 0},
    {"runs_scored": 30, "innings_type": "aggressive", "strike_rate": 200, "no_of_6s": 4},
    {"runs_scored": 19, "innings_type": "balanced", "strike_rate": 175, "no_of_6s": 2},
    {"runs_scored": 22, "innings_type": "aggressive", "strike_rate": 175, "no_of_6s": 2},
    {"runs_scored": 11, "innings_type": "defensive", "strike_rate": 100, "no_of_6s": 0},
    {"runs_scored": 35, "innings_type": "aggressive", "strike_rate": 234, "no_of_6s": 4},
    {"runs_scored": 13, "innings_type": "balanced", "strike_rate": 199, "no_of_6s": 1},
    {"runs_scored": 26, "innings_type": "defensive", "strike_rate": 150, "no_of_6s": 1},
    {"runs_scored": 29, "innings_type": "aggressive", "strike_rate": 200, "no_of_6s": 4},
    {"runs_scored": 17, "innings_type": "balanced", "strike_rate": 189, "no_of_6s": 2},
    {"runs_scored": 20, "innings_type": "defensive", "strike_rate": 130, "no_of_6s": 1}
]

# Convert to DataFrame
df = pd.DataFrame(data)

# Convert batting style to numerical values
style_map = {'defensive': 0, 'balanced': 0.5, 'aggressive': 1}
df['batting_style_value'] = df['innings_type'].map(style_map)

# Prepare features and targets
X = df[['runs_scored', 'batting_style_value']]
y = df[['strike_rate', 'no_of_6s']]

# Create and fit scalers
X_scaler = MinMaxScaler()
y_scaler = MinMaxScaler()

X_scaled = X_scaler.fit_transform(X)
y_scaled = y_scaler.fit_transform(y)

# Create a simple linear regression model using numpy
def train_linear_model(X, y):
    # Add bias term
    X_b = np.c_[np.ones((X.shape[0], 1)), X]
    # Calculate weights using normal equation
    weights = np.linalg.pinv(X_b.T.dot(X_b)).dot(X_b.T).dot(y)
    return weights

# Train the model
weights = train_linear_model(X_scaled, y_scaled)

# Save the model parameters and scalers
model_data = {
    'weights': weights.tolist(),
    'X_scaler': {
        'scale': X_scaler.scale_.tolist(),
        'min': X_scaler.min_.tolist(),
        'data_min': X_scaler.data_min_.tolist(),
        'data_max': X_scaler.data_max_.tolist(),
    },
    'y_scaler': {
        'scale': y_scaler.scale_.tolist(),
        'min': y_scaler.min_.tolist(),
        'data_min': y_scaler.data_min_.tolist(),
        'data_max': y_scaler.data_max_.tolist(),
    }
}

# Save to JSON file
with open('model.json', 'w') as f:
    json.dump(model_data, f)

print("Model trained and saved successfully!") 