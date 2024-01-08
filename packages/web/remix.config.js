// Just to make SST deploy work as we needed to patch the package for the new Vite server.
/** @type {import('@remix-run/dev/dist/vite/plugin').RemixVitePluginOptions} */
export default {
    ignoredRouteFiles: ["**/.*"],
    serverModuleFormat: "esm",
    assetsBuildDirectory: 'build/client',
    publicPath: '/',
    serverBuildPath: 'build/server/index.js'
};