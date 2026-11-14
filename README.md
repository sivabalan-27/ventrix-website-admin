# Ventrix Technologies – Admin Portal

A web-based administration portal developed as part of the Ventrix Technologies Full Stack Developer Intern technical assessment.

The Admin Portal provides a centralized interface for managing job applications and business enquiries submitted through the Ventrix Technologies company website. It also provides dashboard statistics to help administrators monitor incoming applications and enquiries.

## 🌐 Live Demo

- **Admin Portal:** https://ventrix-website-admin.vercel.app/
- **Company Website:** https://ventrixtechnologies.com/

## ✨ Features

### 1. Admin Authentication
- Secure admin login.
- Authentication-based access to the dashboard.
- Logout functionality.
- Protected admin pages.

### 2. Dashboard Overview

Provides a centralized overview of website activities.

**Dashboard statistics include:**
- Total Applications.
- New Applications.
- Total Enquiries.
- New Enquiries.

Statistics are retrieved from the backend APIs.

### 3. Job Application Management

Manage applications submitted through the company's Careers page.

**Features:**
- View submitted job applications.
- Access applicant information.
- Review candidate details.
- View uploaded resumes.
- Download applicant resumes.
- Monitor application statistics.

### 4. Business Enquiry Management

Manage enquiries submitted through the company's Contact form.

**Features:**
- View submitted business enquiries.
- Access customer contact information.
- Read enquiry subjects and messages.
- Review incoming enquiries.
- Monitor enquiry statistics.

### 5. Backend Integration
- REST API communication.
- Backend authentication integration.
- Dynamic dashboard statistics.
- Application and enquiry data retrieval.
- Resume download functionality.
- MongoDB-backed data management through the backend.

### 6. Responsive Design
- Desktop, tablet, and mobile support.
- Responsive dashboard layout.
- Mobile-friendly navigation.
- Consistent user interface.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js |
| Programming Language | JavaScript (ES6+) |
| Styling | Tailwind CSS, CSS3 |
| Markup | HTML5 |
| Build Tool | Vite |
| API Integration | REST APIs |
| Authentication | Backend-based authentication |
| Version Control | Git & GitHub |
| Deployment | Vercel |

## 🏗️ Project Architecture

The Admin Portal follows a frontend-backend architecture.

- **Frontend:** React.js application responsible for the administration interface.
- **Backend:** Node.js and Express.js handle authentication, application management, and enquiry management.
- **Database:** MongoDB stores application, enquiry, and related application data.
- **Authentication:** Admin authentication is handled through backend APIs.
- **Integration:** The admin application communicates with the backend using REST APIs.

## ⚙️ Installation and Setup

### Prerequisites

- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/sivabalan-27/ventrix-website-admin.git
```

### 2. Navigate to the project directory

```bash
cd ventrix-website-admin
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000
```

For production, replace the local URL with your deployed backend API URL.

### 5. Start the development server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

### 6. Build for production

```bash
npm run build
```

The optimized production files will be generated in the `dist/` directory.

## 🔗 Backend API Integration

The Admin Portal communicates with the Express.js backend through REST APIs.

The backend provides endpoints for:

- Admin authentication.
- Dashboard statistics.
- Job application retrieval.
- Business enquiry retrieval.
- Resume downloads.
- Application and enquiry management.

MongoDB is used by the backend for persistent data storage.

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

**Security considerations:**
- Authentication is handled through backend APIs.
- Sensitive credentials are maintained on the backend.
- API secrets and private credentials are not stored in frontend code.
- Protected admin operations require authentication.

## 🚀 Deployment

The Admin Portal is deployed using **Vercel**.

Deployment workflow:

1. Push source code to GitHub.
2. Import the repository into Vercel.
3. Select Vite as the framework preset.
4. Configure the backend API URL.
5. Set the build command to `npm run build`.
6. Set the output directory to `dist`.
7. Deploy the application.

Vercel can automatically trigger new deployments when changes are pushed to the connected GitHub branch.

## 🧪 Testing

The following functionality has been tested:

- Admin login and logout.
- Dashboard data retrieval.
- Dashboard statistics.
- Job application retrieval.
- Business enquiry retrieval.
- Resume download.
- Backend API communication.
- Responsive desktop and mobile layouts.
- Production deployment.

## 📄 Project Information

This Admin Portal was developed as part of the Ventrix Technologies Full Stack Developer Intern technical assessment.

It provides an administrative interface for managing job applications and business enquiries submitted through the company website.
