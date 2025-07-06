#!/usr/bin/env node

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();
const PORT = process.env.DOCS_PORT || 3001;

// Load OpenAPI specification
const openApiPath = path.join(__dirname, '..', 'openapi.yaml');
const swaggerDocument = YAML.load(openApiPath);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "LaunchDarkly Lite API Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
}));

// Serve the raw OpenAPI spec
app.get('/openapi.yaml', (req, res) => {
  res.setHeader('Content-Type', 'application/x-yaml');
  res.sendFile(openApiPath);
});

app.get('/openapi.json', (req, res) => {
  res.json(swaggerDocument);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.listen(PORT, () => {
  console.log(`📚 API Documentation Server running on port ${PORT}`);
  console.log(`🔗 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`📄 OpenAPI YAML: http://localhost:${PORT}/openapi.yaml`);
  console.log(`📄 OpenAPI JSON: http://localhost:${PORT}/openapi.json`);
});

module.exports = app; 