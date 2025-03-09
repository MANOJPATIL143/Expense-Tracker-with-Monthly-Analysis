# Expense-Tracker-with-Monthly-Analysis

# 💰 Expense Tracker with Monthly Analysis  

A full-stack Expense Tracker application where users can log expenses, view total spending, and analyze their monthly expenses with category-wise breakdowns.

## Credentials
- username: john@example.com
- password: 1234567

## 🚀 Features  

### ✅ Frontend (React.js, Context API, Tailwind CSS, Chart.js)  
- Add, edit, and delete expenses (fields: amount, category, date, description).  
- Filter expenses by month and category.  
- View a monthly summary graph (bar/pie chart) for expenses.  
- Responsive, clean UI for a seamless experience.  

### ✅ Backend (Node.js, Express, MongoDB)  
- REST API for expense management.  
- Efficient data retrieval with indexed queries.  
- Validation to prevent invalid expense entries.  
- Generate a JSON report for monthly expenses.  

## 🛠️ Tech Stack  

**Frontend:** React.js, Context API, Tailwind CSS, Chart.js  
**Backend:** Node.js, Express.js, MongoDB  

## 📌 API Endpoints  

| Method | Endpoint                 | Description |
|--------|--------------------------|-------------|
| POST   | `/expenses`              | Add a new expense |
| GET    | `/expenses?month=YYYY-MM` | Fetch expenses for a given month |
| PUT    | `/expenses/:id`           | Update an existing expense |
| DELETE | `/expenses/:id`           | Delete an expense |
| GET    | `/summary?month=YYYY-MM`  | Get category-wise total expenses |
| GET    | `/export?month=YYYY-MM`   | Generate a JSON report of monthly expenses |

## 🔥 Challenges Tackled  
- Used **Context API** for state management instead of prop drilling.  
- Optimized **MongoDB queries** using indexes for date filtering.  
- Implemented **data validation** to prevent invalid expense entries.  
- Added **JSON report generation** for monthly expenses.  




