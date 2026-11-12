# 💰 FinTrack — Personal Finance Management System

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-Backend-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

**FinTrack** is a personal finance management application designed to help users manage their money, monitor spending habits, plan monthly budgets, and track savings goals.

I built this project to explore full-stack development using React and Java Spring Boot, while applying backend engineering concepts such as REST API design, authentication, database relationships, service-layer architecture, and data-driven financial calculations.

---

## 🔗 What it does

### 📊 Financial Dashboard

- **Financial Overview:** Displays total balance, income, expenses, and savings rate.
- **Cash Flow Analytics:** Visualizes income and expenses over time.
- **Financial Health Score:** Provides an illustrative overview of financial habits.
- **Monthly Overview:** Allows users to review financial activity for selected months.
- **Recent Transactions:** Displays the latest financial transactions.

### 💳 Transaction Management

- **Income Tracking:** Record and manage money received.
- **Expense Tracking:** Record and categorize spending.
- **Category Association:** Organize transactions using financial categories.
- **Transaction History:** Review previously recorded transactions.
- **Financial Records:** Maintain a history of income and expenses.

### 🗂️ Category Management

- Create custom income and expense categories.
- Organize transactions by category.
- Manage existing financial categories.
- Separate income categories from expense categories.

### 🎯 Budget Management

- Create monthly spending budgets.
- Assign budgets to expense categories.
- Monitor spending against allocated budgets.
- Calculate remaining budget amounts.
- Track monthly spending limits.

### 🏆 Savings Goals

- Create personalized savings goals.
- Define target amounts and deadlines.
- Add contributions towards savings goals.
- Monitor savings progress.
- View contribution history.
- Track completed and active goals.

### 📈 Financial Reports

- Monthly financial summaries.
- Total income and expense calculations.
- Net savings analysis.
- Savings rate calculations.
- Monthly transaction statistics.

### 🎨 User Experience

- Dark and light themes.
- Responsive application layout.
- Interactive dashboard components.
- Consistent navigation across modules.
- Clean, modern financial dashboard design.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | React 19 |
| Language | JavaScript |
| Build Tool | Vite |
| Styling | CSS3 |
| Backend | Java 17+ / Spring Boot |
| Security | Spring Security / JWT |
| Persistence | Spring Data JPA / Hibernate |
| Database | MySQL |
| API Architecture | REST APIs |
| API Testing | Postman |
| Version Control | Git / GitHub |

---

## 🏗️ Application Architecture

FinTrack follows a client-server architecture with a React frontend communicating with a Java Spring Boot backend through REST APIs.

```text
                    FINTRACK
                        |
             +----------+----------+
             |                     |
        React Frontend        Spring Boot Backend
             |                     |
       UI Components           Controllers
             |                     |
       API Integration           Services
             |                     |
             +------ REST API -----+
                                   |
                              Repositories
                                   |
                              Hibernate
                                   |
                                 MySQL
```

### Backend Design

The backend follows a layered architecture to separate responsibilities:

- **Controller Layer:** Handles incoming HTTP requests and API responses.
- **Service Layer:** Contains business logic and financial calculations.
- **Repository Layer:** Handles database operations using Spring Data JPA.
- **Entity Layer:** Represents database tables and relationships.
- **DTO Layer:** Controls data transfer between the frontend and backend.
- **Security Layer:** Handles authentication and authorization using Spring Security and JWT.

---

## 📁 Project Structure

### Frontend

```text
fintrack-frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── api.js
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

### Backend

The backend is maintained separately and follows a layered Spring Boot architecture.

```text
src/main/java/com/adarsh/fintrack/
│
├── config/          # Application configuration
├── controller/      # REST API endpoints
├── dto/             # Data Transfer Objects
├── entity/          # JPA entities
├── exception/       # Exception handling
├── repository/      # Database access
├── security/        # JWT and Spring Security
├── service/         # Business logic
└── FintrackApplication.java
```

---

## 🔌 API Reference

The frontend communicates with the backend using REST APIs.

| Module | Responsibility |
|---|---|
| Authentication | Registration, login, and authentication |
| Transactions | Income and expense management |
| Categories | Financial category management |
| Budgets | Monthly budget management |
| Goals | Savings goals and contributions |
| Reports | Monthly financial summaries |
| Dashboard | Financial overview and analytics |

**API Base URL (Local Development):**

```text
http://localhost:8080/api
```

For detailed endpoint documentation, refer to the backend repository and its API documentation.

---

## ⚙️ Getting Started

### Prerequisites

Make sure the following tools are installed:

- Node.js and npm
- Java 17 or higher
- Maven
- MySQL 8.x
- Git

### 1. Clone the Frontend Repository

```bash
git clone https://github.com/adarsh062702/fintrack-frontend.git
```

### 2. Navigate to the Project

```bash
cd fintrack-frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the frontend root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Ensure the frontend API configuration uses this environment variable.

### 5. Start the Frontend

```bash
npm run dev
```

The application will run at:

```text
http://localhost:5173
```

### 6. Start the Backend

Start the Spring Boot backend separately after configuring MySQL and the backend environment.

```bash
./mvnw spring-boot:run
```

The backend will run at:

```text
http://localhost:8080
```

---

## 🧪 Build & Code Quality

Build the frontend for production:

```bash
npm run build
```

Run ESLint:

```bash
npm run lint
```

Preview the production build:

```bash
npm run preview
```

---

## 📸 Screenshots

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### Transactions

![Transactions](docs/screenshots/transactions.png)

### Categories

![Categories](docs/screenshots/categories.png)

### Budgets

![Budgets](docs/screenshots/budgets.png)

### Savings Goals

![Goals](docs/screenshots/goals.png)

### Financial Reports

![Reports](docs/screenshots/reports.png)

---

## 🔮 Future Enhancements

- Advanced financial analytics.
- Improved financial insights and recommendations.
- Additional reporting and visualization features.
- Enhanced mobile responsiveness.
- Production deployment.
- Further automated testing.

---

## 👨‍💻 Author

**Adarsh Bindal**

Java Backend Developer | Spring Boot | REST APIs | Full-Stack Development

- GitHub: [adarsh062702](https://github.com/adarsh062702)

---

## 📄 License

This project is currently developed as a personal portfolio project.

---

<p align="center">
  <strong>FinTrack — Personal finance, made clearer. 💛</strong>
</p>
