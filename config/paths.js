const path = require('path')
const fs = require('fs')
// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath)

module.exports = {
    dotenv: resolveApp('.env'),
    appPath: resolveApp('.'),
    appBuild: resolveApp('public'),
    appPublic: resolveApp('static'),
    appHtml: resolveApp('static/index.html'),
    appIndexJs: resolveApp('app/index.js'),
    appSrc: resolveApp('app'),
    appNodeModules: resolveApp('node_modules')
}

module.exports.resolveApp = resolveApp
