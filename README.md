# TeamFlow

TeamFlow is a collaborative web application to help teams plan, track, and manage projects efficiently.  
This repository contains both the **backend** (Node.js + Express + Lowdb) and the **frontend** (React + TailwindCSS).

## Project Objective

- Provide a secure project management platform for teams.
- Allow authenticated users to create, update, and filter tasks, and to view them in a task board.
- Allow authenticated users to update their informations in their users page.
- Allow authenticated users to use the team messaging feature.

## Team Members & Assigned Roles

| Name               | GitHub Account                     | Role |
|-------------------|----------------------------------|------|
| Garance Poignart | gpoignart / GarancePoignart_20250009S | Setup Backend entrypoint, models and database. Backend Messages API. |
| Gauthier Humeau | ghumeau04 / Gauthier Humeau 20250074S | Backend Authentification. Backend Login Management API. |
| Clément Nicole | Clementncl / Clément Nicole 20250054S | Backend User Management API. |
| Faustine Picavet | fpicavet / Faustine Picavet 20250056S | Backend Task Management API. |
| Clément Pitrat | ClementPitrat / Clément Pitrat 20250076S | Backend Statistics API. Setup Frontend entrypoint and App. |
| Yanis Gaoui | ultimatoros-hash / Yanis Gaoui 20250073S | Backend Task Filters API. Frontend Taskboard page. |
| Hugo Boizet | hugoboizet | Frontend Login page. Frontend Users page. |
| Pacal Arnold | pascalarnold29-dev / Pascal Arnold 20250062S | Frontend Dashboard page. |
| Eudes Peyrouny Mazeau | Eudes24 | Frontend Messages page. |
| Damien Desmons | desmonsdamien03-hue / desmons_damien20250071S | TailwindCSS Styling. |
| Yanis Bachofer | yanisbachofer-netizen / Yanis Bachofer 20250063S | TailwindCSS Styling. |

## Installation & Usage Guide

### Prerequisites

- Node.js and npm

### Clone the repository

```bash
git clone git@github.com:gpoignart/TeamFlow.git
cd TeamFlow
```

### Backend Setup

```bash
cd backend
npm install
```

- Install all dependencies.

#### Start the backend

```bash
npx nodemon app.js
```

- Server runs on \`http://localhost:5000\`.

### Frontend Setup

```bash
cd frontend
npm install
```

- Install all dependencies.

#### Start the frontend

```bash
npm start
```

- React app runs on \`http://localhost:3000\`.  
- Ensure the backend is running for API calls.
Start styling the Login and Dashboard pages once their structure is finalized.

## Progress

This section will be updated as the design progresses.

What is left to do:
- Standardize font and police over all page
- Redesign the routing system so that we can create a home page, redirecting to all other pages
- Put the authentication page first
- Update index.jsx
- Finish all parts
