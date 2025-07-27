from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os
from typing import List, Dict, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="HRMS ML Service",
    description="Machine Learning service for salary prediction and HR analytics",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class EmployeeData(BaseModel):
    department: str
    designation: str
    experience_years: float
    performance_rating: float
    education_level: str
    certifications: int
    location: str
    current_salary: Optional[float] = None

class SalaryPredictionRequest(BaseModel):
    employee_data: EmployeeData
    target_year: Optional[int] = None

class SalaryPredictionResponse(BaseModel):
    predicted_salary: float
    confidence_score: float
    salary_range: Dict[str, float]
    factors_analysis: Dict[str, float]

class TrainingData(BaseModel):
    employees: List[Dict]

# Global variables for models and scalers
salary_model = None
scaler = None
label_encoders = {}
feature_columns = []

class SalaryPredictor:
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            random_state=42,
            max_depth=10
        )
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = []
        self.is_trained = False
        
    def prepare_features(self, data: pd.DataFrame, is_training: bool = True):
        """Prepare features for training or prediction"""
        df = data.copy()
        
        # Categorical columns to encode
        categorical_cols = ['department', 'designation', 'education_level', 'location']
        
        # Encode categorical variables
        for col in categorical_cols:
            if col in df.columns:
                if is_training:
                    le = LabelEncoder()
                    df[col + '_encoded'] = le.fit_transform(df[col].astype(str))
                    self.label_encoders[col] = le
                else:
                    if col in self.label_encoders:
                        # Handle unseen categories
                        le = self.label_encoders[col]
                        df[col + '_encoded'] = df[col].astype(str).apply(
                            lambda x: le.transform([x])[0] if x in le.classes_ else -1
                        )
                    else:
                        df[col + '_encoded'] = 0
        
        # Select feature columns
        feature_cols = [
            'experience_years', 'performance_rating', 'certifications',
            'department_encoded', 'designation_encoded', 
            'education_level_encoded', 'location_encoded'
        ]
        
        # Keep only available columns
        available_cols = [col for col in feature_cols if col in df.columns]
        
        if is_training:
            self.feature_columns = available_cols
            
        # Fill missing values
        for col in available_cols:
            if df[col].dtype in ['float64', 'int64']:
                df[col] = df[col].fillna(df[col].median())
            else:
                df[col] = df[col].fillna(-1)
        
        return df[available_cols]
    
    def train(self, training_data: List[Dict]):
        """Train the salary prediction model"""
        try:
            df = pd.DataFrame(training_data)
            
            # Prepare features
            X = self.prepare_features(df, is_training=True)
            y = df['current_salary']
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate model
            y_pred = self.model.predict(X_test_scaled)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            self.is_trained = True
            
            logger.info(f"Model trained successfully. MSE: {mse:.2f}, R2: {r2:.3f}")
            
            return {
                "status": "success",
                "metrics": {
                    "mse": float(mse),
                    "r2": float(r2),
                    "rmse": float(np.sqrt(mse))
                }
            }
            
        except Exception as e:
            logger.error(f"Training error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")
    
    def predict(self, employee_data: EmployeeData) -> SalaryPredictionResponse:
        """Predict salary for an employee"""
        if not self.is_trained:
            raise HTTPException(status_code=400, detail="Model not trained yet")
        
        try:
            # Convert to DataFrame
            data_dict = employee_data.dict()
            df = pd.DataFrame([data_dict])
            
            # Prepare features
            X = self.prepare_features(df, is_training=False)
            
            # Ensure all feature columns are present
            for col in self.feature_columns:
                if col not in X.columns:
                    X[col] = 0
            
            X = X[self.feature_columns]
            
            # Scale features
            X_scaled = self.scaler.transform(X)
            
            # Make prediction
            prediction = self.model.predict(X_scaled)[0]
            
            # Calculate confidence (using model's feature importance and variance)
            feature_importance = self.model.feature_importances_
            confidence = min(0.95, max(0.6, np.mean(feature_importance)))
            
            # Calculate salary range (±15%)
            range_percent = 0.15
            salary_range = {
                "min": prediction * (1 - range_percent),
                "max": prediction * (1 + range_percent)
            }
            
            # Feature analysis
            factors_analysis = {}
            for i, col in enumerate(self.feature_columns):
                if i < len(feature_importance):
                    factors_analysis[col.replace('_encoded', '')] = float(feature_importance[i])
            
            return SalaryPredictionResponse(
                predicted_salary=float(prediction),
                confidence_score=float(confidence),
                salary_range=salary_range,
                factors_analysis=factors_analysis
            )
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Initialize the predictor
predictor = SalaryPredictor()

@app.get("/")
async def root():
    return {
        "message": "HRMS ML Service is running",
        "version": "1.0.0",
        "model_trained": predictor.is_trained
    }

@app.post("/train")
async def train_model(training_data: TrainingData):
    """Train the salary prediction model"""
    result = predictor.train(training_data.employees)
    return result

@app.post("/predict", response_model=SalaryPredictionResponse)
async def predict_salary(request: SalaryPredictionRequest):
    """Predict salary for an employee"""
    return predictor.predict(request.employee_data)

@app.get("/model/status")
async def get_model_status():
    """Get model training status and metrics"""
    return {
        "is_trained": predictor.is_trained,
        "feature_columns": predictor.feature_columns,
        "available_encoders": list(predictor.label_encoders.keys())
    }

@app.post("/generate-sample-data")
async def generate_sample_data():
    """Generate sample training data for testing"""
    np.random.seed(42)
    
    departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations']
    designations = ['Junior', 'Senior', 'Lead', 'Manager', 'Director', 'VP']
    education_levels = ['Bachelor', 'Master', 'PhD', 'Diploma']
    locations = ['New York', 'San Francisco', 'Austin', 'Remote', 'Chicago']
    
    sample_data = []
    for i in range(200):
        dept = np.random.choice(departments)
        designation = np.random.choice(designations)
        education = np.random.choice(education_levels)
        location = np.random.choice(locations)
        
        experience = np.random.uniform(0, 15)
        performance = np.random.uniform(2.5, 5.0)
        certifications = np.random.randint(0, 8)
        
        # Base salary calculation with some realistic factors
        base_salary = 50000
        if designation == 'Junior':
            base_salary = 60000 + experience * 3000
        elif designation == 'Senior':
            base_salary = 80000 + experience * 4000
        elif designation == 'Lead':
            base_salary = 100000 + experience * 5000
        elif designation == 'Manager':
            base_salary = 120000 + experience * 6000
        elif designation == 'Director':
            base_salary = 150000 + experience * 7000
        elif designation == 'VP':
            base_salary = 200000 + experience * 8000
        
        # Add department multiplier
        dept_multipliers = {
            'Engineering': 1.2, 'Sales': 1.1, 'Marketing': 1.0,
            'HR': 0.9, 'Finance': 1.1, 'Operations': 1.0
        }
        base_salary *= dept_multipliers.get(dept, 1.0)
        
        # Add education bonus
        edu_bonus = {'Bachelor': 1.0, 'Master': 1.1, 'PhD': 1.2, 'Diploma': 0.9}
        base_salary *= edu_bonus.get(education, 1.0)
        
        # Add performance and certification bonus
        base_salary *= (0.8 + performance * 0.1)
        base_salary += certifications * 2000
        
        # Add some randomness
        base_salary *= np.random.uniform(0.9, 1.1)
        
        sample_data.append({
            'department': dept,
            'designation': designation,
            'experience_years': round(experience, 1),
            'performance_rating': round(performance, 1),
            'education_level': education,
            'certifications': certifications,
            'location': location,
            'current_salary': round(base_salary, 2)
        })
    
    # Train the model with sample data
    training_result = predictor.train(sample_data)
    
    return {
        "message": "Sample data generated and model trained",
        "data_points": len(sample_data),
        "training_result": training_result,
        "sample_records": sample_data[:5]  # Return first 5 records as example
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
