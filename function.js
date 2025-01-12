import { createNodeMiddleware, createProbot } from "probot";
import appFunction from "./app.js";
import getRoutes from './routes/getRoutes.js';
import postRoutes from './routes/postRoutes.js';
import express from "express";
import dotenv from 'dotenv';
dotenv.config();

// Create an Express app
const app = express();
const probot = createProbot();

// Use Probot's middleware for GitHub webhooks
app.use('/', createNodeMiddleware(appFunction, { probot }));

// Define custom routes
getRoutes(app, probot);
postRoutes(app, probot);

export const probotApp = app;

// LOCAL DEV ONLY dont deploy this
/*
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
*/

console.log("Probot middleware initialized");