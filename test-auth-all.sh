#!/bin/bash

echo "Testing HRMS Authentication..."
echo "================================"

echo "1. Testing Employee Login:"
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "employee.dev@gmail.com", "password": "employee123"}' \
  | jq '.'

echo -e "\n2. Testing HR Manager Login:"
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "hr.manager@gmail.com", "password": "hrmanager123"}' \
  | jq '.'

echo -e "\n3. Testing Admin Login:"
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "sanju.admin@gmail.com", "password": "admin123"}' \
  | jq '.'

echo -e "\nTesting complete!"
