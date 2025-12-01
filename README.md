# Bazeni na dan

A full-stack web application for discovering and booking private swimming pools for day use across Bosnia and Herzegovina. The main goal is to connect pool owners with guests by providing a simple, fast, and mobile-friendly interface for browsing pools by location, date, price, and amenities, and for sending booking requests.

The application focuses on a clean UX and interactivity: users can search by city, pick dates using an availability calendar, filter by features such as heated pools or pets allowed, and save favorite pools for later. Each pool listing includes a detailed description, photo gallery, rules, and pricing. On the other side, owners have a dedicated interface for managing their listings, uploading images, configuring availability, and reviewing incoming booking requests.

This repository contains the **frontend** (SPA) built with Vue 3 and TypeScript. The **API/backend** part is available in [this repository](https://github.com/zoljann/bazeni-na-dan-api).

### Stack

- **Tools**: TypeScript, ESlint and Prettier
- **Frontend**: VueJS 3(vue-router and pinia), Vite and SASS
- **Backend**: NodeJS Express and MongoDB
- **Deployment**: Netlify, Heroku, Cloudflare

### Preview/demo

- YouTube mobile view video: https://www.youtube.com/shorts/nlvEJ-oBi1o
- Live app: `https://bazeni-na-dan.com`

### Getting Started

To get started with the project, follow these steps:

1. Install the necessary dependencies:
   - npm install
2. Start the development server on development or production server:
   - npm run dev:staging or npm run dev:production
3. Build for deployment on staging or production server:
   - npm run build:staging or npm run build:production
