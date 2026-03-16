const path = require('path');
const YAML = require('yamljs');

const swaggerPath = path.join(__dirname, '..', 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

module.exports = { swaggerDocument };

