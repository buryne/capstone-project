# Starter Project for the Cloud Computing Capstone Project

## Project Overview

project berisi library

- `express` untuk membuat server
- `cors` untuk mengatur CORS
- `express-async-handler` untuk intellesense pada async function di express
- `nodemon` untuk hot reload
- `dotenv` untuk mengatur environment variable
- `prettier` untuk code formatting
- `eslint` untuk code linting

## Project Structure

```bash

├── src
│   ├── index.js
│   ├── routes
│   │   ├── index.js
│   │   ├── user.js
│   │   └── ...
│   ├── controllers
│   │   ├── index.js
│   │   ├── user.js
│   │   └── ...
│   ├── models
│   │   ├── index.js
│   │   ├── user.js
│   │   └── ...
│   ├── middlewares
│   │   ├── index.js
│   │   ├── auth.js
│   │   └── ...
│   ├── utils
│   │   ├── index.js
│   │   ├── response.js
│   │   └── ...
│   └── ...
├── .env
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── package.json
└── README.md

```

## Getting Setup

### Installing project dependencies

```bash

npm install

```

#### Running the server

```bash

npm run dev

```
