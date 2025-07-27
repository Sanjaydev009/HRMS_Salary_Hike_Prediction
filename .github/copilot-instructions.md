<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# HRMS - Human Resource Management System

This is a comprehensive HRMS built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and includes Machine Learning capabilities for salary prediction.

## Project Structure

### Backend (`/backend`)

- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication with role-based access control
- RESTful API design
- Security middleware (helmet, CORS, rate limiting)
- Comprehensive error handling

### Frontend (`/frontend`)

- React.js with TypeScript
- Material-UI (MUI) for components and theming
- Redux Toolkit for state management
- React Router for navigation
- Responsive design principles

### ML Module (`/ml-module`)

- FastAPI-based Machine Learning service
- Scikit-learn for salary prediction models
- Pandas and NumPy for data processing
- RESTful ML API endpoints

## Key Features

1. **Employee Management**: Complete CRUD operations with role-based access
2. **Leave Management**: Application, approval workflow, and balance tracking
3. **Payroll Processing**: Automated payroll generation and management
4. **Analytics Dashboard**: Real-time insights and reporting
5. **ML-Powered Salary Prediction**: Data-driven salary recommendations
6. **Role-Based Security**: Employee, HR, and Admin roles
7. **Real-time Dashboards**: Interactive charts and statistics

## Coding Guidelines

- Follow TypeScript best practices for type safety
- Use Material-UI components consistently
- Implement proper error handling and loading states
- Follow RESTful API conventions
- Use Redux Toolkit for state management
- Implement proper authentication and authorization
- Write clean, documented, and maintainable code
- Follow responsive design principles

## Authentication & Authorization

- JWT-based authentication
- Role hierarchy: Employee < HR < Admin
- Route protection based on user roles
- Secure API endpoints with middleware

## Database Schema

- Users (employees with roles and profiles)
- Leaves (applications with approval workflow)
- Payroll (monthly salary processing)
- Performance history and analytics

## Development Notes

- Backend runs on port 5000
- Frontend runs on port 3000
- ML service runs on port 8000
- Use environment variables for configuration
- Follow the existing code patterns and architecture
