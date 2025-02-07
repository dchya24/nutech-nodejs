# Nutech Node.js Application

## Installation Guide

Follow these steps to install and set up the Nutech Node.js application, including database migration and seeding.

### Prerequisites

Ensure you have the following installed:
- 
Node.js (v14.x or later)
- npm (v6.x or later)
- PostgreSQL (or your preferred database)

### Step 1: Clone the Repository

```sh
git clone https://github.com/dchya24/nutech-nodejs.git
cd nutech-nodejs
```

### Step 2: Install Dependencies

```sh
npm install
```

### Step 3: Configure Environment Variables

Copy `.env.example` to .env file in the root directory and add your configuration


### Step 4: Create Database
Create Database in PostgreSQL

### Step 6: Start the Application

```sh
npm start
```

or

```sh
npm run dev
```

Your application should now be running on `http://localhost:{PORT}`. in default PORT is `3000`

### Step 7: Migration
Migration in this app using endpoint API, the url is `BASE_URL/migrate`.

`BASE_URL` is your base url app

### Step 8: Seed
Seed using to adding banner and service data to database, the url is `BASE_URL/seed`.

`BASE_URL` is your base url app
