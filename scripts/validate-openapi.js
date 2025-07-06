#!/usr/bin/env node

const YAML = require('yamljs');
const path = require('path');
const fs = require('fs');

console.log('🔍 Validating OpenAPI specification...');

try {
  // Load and parse the OpenAPI specification
  const openApiPath = path.join(__dirname, '..', 'openapi.yaml');
  
  if (!fs.existsSync(openApiPath)) {
    console.error('❌ OpenAPI specification file not found:', openApiPath);
    process.exit(1);
  }

  const swaggerDocument = YAML.load(openApiPath);
  
  // Basic validation checks
  const validationErrors = [];
  
  // Check required fields
  if (!swaggerDocument.openapi) {
    validationErrors.push('Missing required field: openapi');
  }
  
  if (!swaggerDocument.info) {
    validationErrors.push('Missing required field: info');
  }
  
  if (!swaggerDocument.paths) {
    validationErrors.push('Missing required field: paths');
  }
  
  // Check info object
  if (swaggerDocument.info) {
    if (!swaggerDocument.info.title) {
      validationErrors.push('Missing required field: info.title');
    }
    
    if (!swaggerDocument.info.version) {
      validationErrors.push('Missing required field: info.version');
    }
  }
  
  // Check paths
  if (swaggerDocument.paths) {
    const pathCount = Object.keys(swaggerDocument.paths).length;
    console.log(`📊 Found ${pathCount} API endpoints`);
    
    // List all endpoints
    Object.keys(swaggerDocument.paths).forEach(path => {
      const methods = Object.keys(swaggerDocument.paths[path]);
      methods.forEach(method => {
        const operation = swaggerDocument.paths[path][method];
        console.log(`  ${method.toUpperCase()} ${path} - ${operation.summary || 'No summary'}`);
      });
    });
  }
  
  // Check components
  if (swaggerDocument.components && swaggerDocument.components.schemas) {
    const schemaCount = Object.keys(swaggerDocument.components.schemas).length;
    console.log(`📋 Found ${schemaCount} schema definitions`);
  }
  
  // Report validation results
  if (validationErrors.length > 0) {
    console.error('❌ Validation errors found:');
    validationErrors.forEach(error => {
      console.error(`  - ${error}`);
    });
    process.exit(1);
  } else {
    console.log('✅ OpenAPI specification is valid!');
    console.log(`📖 Title: ${swaggerDocument.info.title}`);
    console.log(`🔖 Version: ${swaggerDocument.info.version}`);
    console.log(`📝 Description: ${swaggerDocument.info.description ? 'Present' : 'Missing'}`);
    
    // Show servers
    if (swaggerDocument.servers) {
      console.log('🌐 Servers:');
      swaggerDocument.servers.forEach(server => {
        console.log(`  - ${server.url} (${server.description})`);
      });
    }
    
    console.log('');
    console.log('🚀 To view the documentation:');
    console.log('   npm run docs:serve');
    console.log('   Then visit: http://localhost:3001/api-docs');
  }
  
} catch (error) {
  console.error('❌ Error validating OpenAPI specification:', error.message);
  process.exit(1);
} 