const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Replace import.meta.env with undefined so it doesn't break non-module scripts
const originalTransformFile = config.transformer?.transformerPath;

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
};

module.exports = config;
