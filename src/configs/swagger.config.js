const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

// Load different API documents
const mainSwaggerDocument = YAML.load(
  path.join(__dirname, "../../docs/openapi.yaml")
);

const giftApiDocument = YAML.load(
  path.join(__dirname, "../../docs/gift-api.yaml")
);

const addServers = (req, doc) => {
  const modifiedDoc = { ...doc };
  const protocol = req.protocol;
  const host = req.get("host");

  modifiedDoc.servers = [
    {
      url: `${protocol}://${host}/api/v1`,
      description:
        process.env.NODE_ENV === "production"
          ? "Production server"
          : "Development server",
    },
  ];

  return modifiedDoc;
};

// Main API documentation setup
const mainSwaggerSetup = (req, res) => {
  const doc = addServers(req, mainSwaggerDocument);
  return swaggerUi.generateHTML(doc);
};

// Gift API documentation setup
const giftSwaggerSetup = (req, res) => {
  const doc = addServers(req, giftApiDocument);
  return swaggerUi.generateHTML(doc);
};

// Generic function to get API document
const getApiDocument = (apiType = 'main') => {
  switch (apiType) {
    case 'gift':
      return giftApiDocument;
    case 'main':
    default:
      return mainSwaggerDocument;
  }
};

// Generic setup function
const createSwaggerSetup = (apiType) => {
  return (req, res) => {
    const doc = addServers(req, getApiDocument(apiType));
    return swaggerUi.generateHTML(doc);
  };
};

module.exports = {
  swaggerUi,
  // Legacy support - main API
  swaggerSetup: mainSwaggerSetup,
  
  // New individual setups
  mainSwaggerSetup,
  giftSwaggerSetup,
  
  // Generic functions
  createSwaggerSetup,
  getApiDocument,
};
