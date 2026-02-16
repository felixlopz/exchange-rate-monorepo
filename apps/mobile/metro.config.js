const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// 1. Find the project and monorepo roots
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

// 2. Get the default Expo config
const config = getDefaultConfig(projectRoot);

// 3. Monorepo: Watch all files in the workspace
config.watchFolders = [workspaceRoot];

// 4. Monorepo: Let Metro look for modules in the workspace node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 5. Monorepo: Ensure Metro prioritizes the right modules
config.resolver.disableHierarchicalLookup = true;

// 6. Wrap it with NativeWind
module.exports = withNativeWind(config, { input: "./globals.css" });
