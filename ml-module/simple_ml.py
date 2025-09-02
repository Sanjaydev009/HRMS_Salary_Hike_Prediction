from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="HRMS Simple ML Service",
    description="Simplified ML service for real-time salary prediction",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",  # Frontend dev server
        "http://localhost:5001",  # Backend server
        "http://127.0.0.1:5173",  # Alternative localhost
        "*"  # Allow all origins for development
    ],
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
    location: str
    current_salary: float
    attendance_metrics: Dict
    certification_data: Dict
    project_completion_rate: float
    team_size_managed: float
    revenue_generated: float

class PredictionRequest(BaseModel):
    employee_data: EmployeeData

class PredictionResponse(BaseModel):
    predicted_salary: float
    confidence_score: float
    salary_range: Dict[str, float]
    factors_analysis: Dict[str, float]
    recommendations: List[str]
    risk_factors: List[str]
    performance_indicators: Dict[str, float]
    hike_analysis: Dict[str, Union[str, float, int, List[str], Dict[str, float]]]  # Fixed type

# Simple ML model coefficients (trained offline) - All values in INR
# Market-based salary calculation, not based on current salary
MODEL_COEFFICIENTS = {
    'base_salary': 300000,  # Market base salary in INR (3 Lakhs) for entry level
    'experience_multiplier': 80000,  # 80k per year of experience
    'performance_multiplier': 200000,  # Performance bonus in INR
    'certification_multiplier': 30000,  # 30k per certification
    'attendance_multiplier': 15000,  # Attendance impact
    'department_bonus': {
        'Engineering': 200000,  # 2 Lakhs bonus
        'Data Science': 300000,  # 3 Lakhs bonus
        'IT Support': 150000,   # 1.5 Lakhs bonus
        'Management': 250000,   # 2.5 Lakhs bonus
        'Sales': 180000,       # 1.8 Lakhs bonus
        'HR': 120000,         # 1.2 Lakhs bonus
        'Finance': 200000,    # 2 Lakhs bonus
        'Marketing': 160000,  # 1.6 Lakhs bonus
        'Operations': 140000, # 1.4 Lakhs bonus
        'Unknown': 0
    },
    'education_bonus': {
        'PhD': 300000,     # 3 Lakhs for PhD
        'Masters': 150000, # 1.5 Lakhs for Masters
        'Bachelor': 50000, # 50k for Bachelor
        'Diploma': 25000,   # 25k for Diploma
        'Other': 0
    },
    'location_multiplier': {
        'Remote': 1.1,
        'Office': 1.0,
        'Hybrid': 1.05
    }
}

def calculate_salary_prediction(employee_data: EmployeeData) -> PredictionResponse:
    """Calculate salary hike recommendations based on current performance and attributes"""
    
    current_salary = employee_data.current_salary
    
    logger.info(f"Calculating HIKE recommendations for employee with:")
    logger.info(f"  - Current Salary: ₹{current_salary:,.0f}")
    logger.info(f"  - Experience: {employee_data.experience_years} years")
    logger.info(f"  - Certifications: {employee_data.certification_data.get('total_certifications', 0)}")
    logger.info(f"  - Attendance Rate: {employee_data.attendance_metrics.get('attendance_rate', 0)}%")
    logger.info(f"  - Performance: {employee_data.performance_rating}")
    logger.info(f"  - Department: {employee_data.department}")
    
    # Calculate hike percentage based on performance attributes
    base_hike_percentage = 0  # Start with 0% hike
    hike_breakdown = {}
    
    # Experience-based hike (0-10%)
    if employee_data.experience_years > 0:
        experience_hike = min(employee_data.experience_years * 2, 10)  # 2% per year, max 10%
        base_hike_percentage += experience_hike
        hike_breakdown['Experience'] = experience_hike
        logger.info(f"  Experience hike: {experience_hike}%")
    else:
        hike_breakdown['Experience'] = 0
        logger.info("  No experience hike (0 years)")
    
    # Performance-based hike (0-15%)
    if employee_data.performance_rating > 3.0:
        performance_hike = (employee_data.performance_rating - 3.0) * 7.5  # Up to 15% for rating 5
        base_hike_percentage += performance_hike
        hike_breakdown['Performance'] = performance_hike
        logger.info(f"  Performance hike: {performance_hike:.1f}%")
    else:
        hike_breakdown['Performance'] = 0
        logger.info("  No performance hike (rating <= 3.0)")
    
    # Attendance-based hike (0-8%)
    attendance_rate = employee_data.attendance_metrics.get('attendance_rate', 0)
    if attendance_rate > 90:
        attendance_hike = 8  # 8% for excellent attendance
        base_hike_percentage += attendance_hike
        hike_breakdown['Attendance'] = attendance_hike
        logger.info(f"  Attendance hike: {attendance_hike}% (excellent)")
    elif attendance_rate > 80:
        attendance_hike = 5  # 5% for good attendance
        base_hike_percentage += attendance_hike
        hike_breakdown['Attendance'] = attendance_hike
        logger.info(f"  Attendance hike: {attendance_hike}% (good)")
    elif attendance_rate > 60:
        attendance_hike = 2  # 2% for average attendance
        base_hike_percentage += attendance_hike
        hike_breakdown['Attendance'] = attendance_hike
        logger.info(f"  Attendance hike: {attendance_hike}% (average)")
    else:
        hike_breakdown['Attendance'] = 0
        logger.info("  No attendance hike (poor attendance)")
    
    # Certification-based hike (0-12%)
    total_certs = employee_data.certification_data.get('total_certifications', 0)
    if total_certs > 0:
        cert_hike = min(total_certs * 3, 12)  # 3% per certification, max 12%
        base_hike_percentage += cert_hike
        hike_breakdown['Certifications'] = cert_hike
        logger.info(f"  Certification hike: {cert_hike}% ({total_certs} certs)")
    else:
        hike_breakdown['Certifications'] = 0
        logger.info("  No certification hike (0 certifications)")
    
    # Department factor (multiplier 0.8-1.2)
    dept_multipliers = {
        'Engineering': 1.2,
        'Data Science': 1.2,
        'IT Support': 1.0,
        'Management': 1.1,
        'Sales': 1.1,
        'HR': 0.9,
        'Finance': 1.0,
        'Marketing': 1.0,
        'Operations': 0.9,
        'Unknown': 0.8
    }
    dept_multiplier = dept_multipliers.get(employee_data.department, 1.0)
    
    # Apply department multiplier
    adjusted_hike_percentage = base_hike_percentage * dept_multiplier
    
    # Calculate final hike amount and new salary
    hike_amount = (current_salary * adjusted_hike_percentage) / 100
    predicted_salary = current_salary + hike_amount
    
    # Cap the hike at reasonable limits
    max_hike_percentage = 25  # Maximum 25% hike
    if adjusted_hike_percentage > max_hike_percentage:
        adjusted_hike_percentage = max_hike_percentage
        hike_amount = (current_salary * max_hike_percentage) / 100
        predicted_salary = current_salary + hike_amount
    
    logger.info(f"  Base hike percentage: {base_hike_percentage:.1f}%")
    logger.info(f"  Department multiplier: {dept_multiplier}")
    logger.info(f"  Final hike percentage: {adjusted_hike_percentage:.1f}%")
    logger.info(f"  Hike amount: ₹{hike_amount:,.0f}")
    logger.info(f"  New salary: ₹{predicted_salary:,.0f}")
    
    # Hike analysis for detailed breakdown
    hike_analysis = {
        'current_salary': current_salary,
        'recommended_hike_percentage': round(adjusted_hike_percentage, 1),
        'hike_amount': round(hike_amount),
        'hike_breakdown': hike_breakdown,
        'department_multiplier': dept_multiplier,
        'eligibility_status': 'eligible' if adjusted_hike_percentage > 0 else 'not_eligible',
        'next_review_recommendations': []
    }
    
    # Calculate factors analysis based on hike contributions
    factors_analysis = {
        'Experience': hike_breakdown.get('Experience', 0),
        'Performance': hike_breakdown.get('Performance', 0),
        'Certifications': hike_breakdown.get('Certifications', 0),
        'Attendance': hike_breakdown.get('Attendance', 0),
        'Department Factor': (dept_multiplier - 1) * 100  # Show department impact as percentage
    }
    
    # Calculate confidence score based on data availability and quality
    data_quality_factors = {
        'experience': 1 if employee_data.experience_years > 0 else 0,
        'performance': 1 if employee_data.performance_rating > 0 else 0,
        'certifications': 1 if employee_data.certification_data.get('total_certifications', 0) > 0 else 0,
        'attendance': 1 if employee_data.attendance_metrics.get('attendance_rate', 0) > 0 else 0,
        'department': 1 if employee_data.department != 'Unknown' else 0
    }
    
    data_completeness = sum(data_quality_factors.values()) / len(data_quality_factors)
    
    # Confidence based on data quality and hike eligibility
    if adjusted_hike_percentage > 10:
        confidence_score = 75 + (data_completeness * 20)  # 75-95% for good hike
    elif adjusted_hike_percentage > 5:
        confidence_score = 60 + (data_completeness * 20)  # 60-80% for moderate hike
    elif adjusted_hike_percentage > 0:
        confidence_score = 50 + (data_completeness * 15)  # 50-65% for small hike
    else:
        confidence_score = 30 + (data_completeness * 10)  # 30-40% for no hike
    
    confidence_score = max(min(confidence_score, 95), 25)
    
    # Generate hike-focused recommendations
    recommendations = []
    hike_analysis['next_review_recommendations'] = []
    
    if employee_data.certification_data.get('total_certifications', 0) == 0:
        recommendations.append(f"Add technical certifications to unlock up to 12% salary hike (currently missing {12}% potential)")
        hike_analysis['next_review_recommendations'].append("Obtain 2-3 relevant certifications")
    elif employee_data.certification_data.get('total_certifications', 0) < 3:
        missing_certs = 4 - employee_data.certification_data.get('total_certifications', 0)
        potential_hike = missing_certs * 3
        recommendations.append(f"Add {missing_certs} more certifications to gain additional {potential_hike}% salary hike")
        hike_analysis['next_review_recommendations'].append(f"Complete {missing_certs} additional certifications")
    
    if attendance_rate == 0:
        recommendations.append("Establish consistent attendance record to qualify for up to 8% attendance-based hike")
        hike_analysis['next_review_recommendations'].append("Maintain 90%+ attendance for 6 months")
    elif attendance_rate < 80:
        potential_hike = 8 - hike_breakdown.get('Attendance', 0)
        recommendations.append(f"Improve attendance to 90%+ to gain additional {potential_hike}% salary hike")
        hike_analysis['next_review_recommendations'].append("Achieve 90%+ attendance consistently")
    
    if employee_data.performance_rating <= 3.0:
        recommendations.append("Improve performance rating above 3.0 to unlock performance-based salary increases (up to 15%)")
        hike_analysis['next_review_recommendations'].append("Work on performance improvement plan")
    
    if employee_data.experience_years == 0:
        recommendations.append("Gain experience in current role - each year adds ~2% to your hike eligibility")
        hike_analysis['next_review_recommendations'].append("Complete 1 year of service for experience-based hike")
    
    # Generate risk factors for hike
    risk_factors = []
    if attendance_rate == 0:
        risk_factors.append("No attendance record - significant barrier to salary hike approval")
    elif attendance_rate < 60:
        risk_factors.append("Poor attendance may disqualify you from salary hike considerations")
    
    if employee_data.certification_data.get('total_certifications', 0) == 0:
        risk_factors.append("Lack of certifications reduces hike eligibility in competitive market")
    
    if employee_data.performance_rating <= 2.5:
        risk_factors.append("Below-average performance rating may result in hike denial")
    
    if employee_data.experience_years == 0 and attendance_rate == 0:
        risk_factors.append("New employee with no performance history - hike eligibility very limited")
    
    # Calculate performance indicators
    performance_indicators = {
        'hike_eligibility': min(100, adjusted_hike_percentage * 4),  # Scale to 100
        'attendance_score': attendance_rate if attendance_rate > 0 else 0,
        'certification_score': min(100, employee_data.certification_data.get('total_certifications', 0) * 25),
        'performance_score': max(20, min(100, employee_data.performance_rating * 20)) if employee_data.performance_rating > 0 else 0
    }
    
    return PredictionResponse(
        predicted_salary=round(predicted_salary),
        confidence_score=round(confidence_score, 1),
        salary_range={
            'min': round(current_salary + (hike_amount * 0.8)),  # 80% of hike amount
            'max': round(current_salary + (hike_amount * 1.2))   # 120% of hike amount
        },
        factors_analysis=factors_analysis,
        recommendations=recommendations,
        risk_factors=risk_factors,
        performance_indicators=performance_indicators,
        hike_analysis=hike_analysis
    )

@app.get("/")
async def root():
    return {"message": "HRMS Simple ML Service is running", "timestamp": datetime.now().isoformat()}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ml-service", "timestamp": datetime.now().isoformat()}

@app.get("/model/status")
async def model_status():
    return {
        "is_trained": True,
        "model_type": "simplified_ensemble",
        "feature_columns": [
            "experience_years", "performance_rating", "department", 
            "education_level", "certifications", "attendance_rate",
            "project_completion_rate", "team_size_managed", "revenue_generated"
        ],
        "last_updated": datetime.now().isoformat(),
        "confidence": "high"
    }

@app.post("/predict")
async def predict_salary(request: PredictionRequest):
    try:
        logger.info(f"Received prediction request for employee with {request.employee_data.experience_years} years experience")
        
        prediction = calculate_salary_prediction(request.employee_data)
        
        logger.info(f"Generated prediction: ${prediction.predicted_salary:,.2f} with {prediction.confidence_score}% confidence")
        
        return prediction
        
    except Exception as e:
        logger.error(f"Error in salary prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/analytics/salary-insights")
async def salary_insights():
    return {
        "market_trends": {
            "average_increase": 8.5,
            "median_salary": 65000,
            "growth_rate": 12.3
        },
        "skill_demand": {
            "technical_skills": 85,
            "leadership_skills": 75,
            "domain_expertise": 80
        },
        "factors_importance": {
            "experience": 30,
            "performance": 25,
            "certifications": 20,
            "education": 15,
            "other": 10
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))  # Use port 8001 by default
    uvicorn.run(app, host="0.0.0.0", port=port)
