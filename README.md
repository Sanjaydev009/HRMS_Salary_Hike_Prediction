# HRMS - Human Resource Management System

A comprehensive, full-stack Human Resource Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and enhanced with Machine Learning capabilities for intelligent salary predictions and HR analytics.

## 🚀 Features

### Core HR Functionalities

- **Employee Management**: Complete CRUD operations with detailed employee profiles
- **Leave Management**: Application, approval workflow, and balance tracking
- **Payroll Processing**: Automated payroll generation and management
- **Performance Tracking**: Employee performance reviews and history
- **Role-Based Access Control**: Employee, HR, and Admin roles

### Advanced Features

- **ML-Powered Salary Prediction**: Data-driven salary recommendations using historical data
- **Real-time Analytics Dashboard**: Interactive charts and insights
- **Emergency Recall System**: Quick employee notification system
- **Document Management**: Upload and manage employee documents
- **Responsive Design**: Works seamlessly across devices

### Security Features

- JWT-based authentication
- Role-based authorization
- Rate limiting and security headers
- Input validation and sanitization
- Secure password handling with bcrypt

## 🏗️ Architecture

```
HRMS/
├── backend/          # Node.js + Express.js API
├── frontend/         # React.js + TypeScript UI
├── ml-module/        # Python FastAPI ML service
└── docs/            # Documentation
```

### Technology Stack

#### Backend

- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Helmet**, **CORS**, **Rate Limiting** for security

#### Frontend

- **React.js** with **TypeScript**
- **Material-UI (MUI)** for UI components
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Axios** for API calls

#### ML Module

- **FastAPI** for ML API service
- **Scikit-learn** for machine learning models
- **Pandas** and **NumPy** for data processing
- **Uvicorn** as ASGI server

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd HRMS
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Set up Python virtual environment for ML module
cd ../ml-module
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Configuration

#### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
ML_SERVICE_URL=http://localhost:8000
```

#### Frontend (.env)

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ML_API_URL=http://localhost:8000
```

### 4. Database Setup

Ensure MongoDB is running on your system. The application will automatically create the necessary collections on first run.

### 5. Start the Application

#### Development Mode

```bash
# Start all services (backend, frontend, ML)
npm run dev

# Or start services individually:
npm run backend    # Backend only
npm run frontend   # Frontend only
npm run ml        # ML service only
```

#### Production Mode

```bash
npm run build
npm start
```

## 🔐 Default Admin Account

After starting the application, create an admin account through the registration endpoint (requires admin/HR role to create new users).

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **ML Service**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (FastAPI auto-docs)

## 📊 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin/HR only)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Update password

### Employees

- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `GET /api/employees/dashboard/stats` - Employee statistics

### Leaves

- `GET /api/leaves` - Get leaves
- `POST /api/leaves` - Apply for leave
- `PUT /api/leaves/:id/approve` - Approve/reject leave
- `GET /api/leaves/balance/me` - Get leave balance

### Payroll

- `GET /api/payroll` - Get payroll records
- `POST /api/payroll/generate` - Generate payroll
- `PUT /api/payroll/:id/approve` - Approve payroll

### Analytics

- `GET /api/analytics/dashboard` - Dashboard analytics
- `POST /api/analytics/salary-prediction` - Predict salary
- `GET /api/analytics/leave-trends` - Leave trends
- `POST /api/analytics/train-model` - Train ML model

## 🤖 Machine Learning Features

### Salary Prediction Model

The ML module uses a Random Forest Regressor to predict future salaries based on:

- Department and designation
- Years of experience
- Performance ratings
- Education level and certifications
- Location and other factors

### Model Training

The system can be trained with historical employee data to improve prediction accuracy.

## 👥 User Roles & Permissions

### Employee

- View own profile and update personal information
- Apply for leaves and view leave history
- View own payroll records
- View personal analytics

### HR

- Manage all employees
- Generate and manage payroll
- Access full analytics dashboard
- Approve/reject leave applications
- Train ML models

### Admin

- All HR permissions
- System administration
- User role management
- System backup and maintenance

## 🔧 Configuration

### Environment Variables

#### Backend

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `ML_SERVICE_URL`: ML service URL

#### Frontend

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_ML_API_URL`: ML service URL

## 📱 Features by Module

### Employee Management

- Employee registration and profile management
- Document upload and management
- Performance review system
- Emergency contact information

### Leave Management

- Multiple leave types (Annual, Sick, Personal, etc.)
- Approval workflow
- Leave balance tracking
- Calendar integration
- Email notifications

### Payroll System

- Automated monthly payroll generation
- Configurable salary components
- Tax and deduction calculations
- Payment tracking
- Payslip generation

### Analytics & Reporting

- Employee statistics and trends
- Leave pattern analysis
- Payroll summaries
- Performance insights
- ML-powered predictions

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment

1. Build the frontend: `cd frontend && npm run build`
2. Set production environment variables
3. Start MongoDB service
4. Start the backend server: `cd backend && npm start`
5. Start the ML service: `cd ml-module && python main.py`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation in the `docs/` folder

## 🗺️ Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced reporting features
- [ ] Integration with external HR tools
- [ ] Multi-language support
- [ ] Advanced ML models for HR insights
- [ ] Automated backup system
- [ ] Enhanced security features

---

**Built with ❤️ by the HRMS Development Team**
