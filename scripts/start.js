// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

/*
    Makes the script crash on unhandled rejections instead of silently
    ignoring them. In the future, promise rejections that are not handled will
    terminate the Node.js process with a non-zero exit code.
 */
process.on('unhandledRejection', (error) => {
    throw error
})

const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

const paths = require('../config/paths')
const config = require('../config/webpack.config.dev')

const { checkBrowsers } = require('../helper/browsers')
const clearConsole = require('../helper/clear-console')
const checkRequiredFiles = require('../helper/check-required-files')
const { choosePort, createCompiler } = require('../helper/server-utils')

const isInteractive = process.stdout.isTTY

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1)
}

// Locate HOST/PORT
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000
const HOST = process.env.HOST || '0.0.0.0'

if (process.env.HOST) {
    console.log(
        chalk.cyan(`Attempting to bind to HOST environment variable: ${chalk.yellow(chalk.bold(process.env.HOST))}`)
    )
    console.log('If this was unintentional, check that you haven\'t mistakenly set it in your shell.')
    console.log(`Learn more here: ${chalk.yellow('http://bit.ly/CRA-advanced-config')}`)
    console.log()
}

checkBrowsers(paths.appPath)
    .then(() => {
        // We attempt to use the default port but if it is busy, we offer the user to
        // run on a different port. `choosePort()` Promise resolves to the next free port.
        return choosePort(HOST, DEFAULT_PORT)
    })
    .then((port) => {
        if (port === null) {
            // We have not found a port.
            return
        }

        const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
        const appName = require(paths.appPackageJson).name

        // Create a webpack compiler that is configured with custom messages.
        const compiler = createCompiler(webpack, config, appName)

        // Load proxy config
        // const proxySetting = require(paths.appPackageJson).proxy;
        // const proxyConfig = prepareProxy(proxySetting, paths.appPublic);

        // Serve webpack assets generated by the compiler over a web server.
        const serverConfig = {}
        // const serverConfig = createDevServerConfig(proxyConfig, urls.lanUrlForConfig);
        const devServer = new WebpackDevServer(compiler, serverConfig)

        // Launch WebpackDevServer.
        devServer.listen(port, HOST, (error) => {
            if (error) {
                return console.log(error)
            }

            if (isInteractive) {
                clearConsole()
            }

            console.log(chalk.cyan('Starting the development server...\n'))
        })
        ;['SIGINT', 'SIGTERM'].forEach(function(sig) {
            process.on(sig, function() {
                devServer.close()
                process.exit()
            })
        })
    })
    .catch((error) => {
        if (error && error.message) {
            console.log(error.message)
        }

        process.exit(1)
    })

// const detect = require('detect-port')
// const getProcessForPort = require('../helper/get-process-for-port')
// const options = require('../webpack.config.babel.js')

//
// const WEBPACK_OPTIONS = {
//     dev: true,
//     shortName: true
// }
//
// const IS_INTERACTIVE = process.stdout.isTTY
// const DEFAULTS = {
//     HOST: options.defaults.host,
//     PORT: options.defaults.port,
//     PROTOCOL: options.defaults.protocol
// }
//
// function run() {
//     let isFirstCompile = true
//
//     const config = options.webpack(WEBPACK_OPTIONS)
//
//     const compiler = webpack(config)
//     const devServer = new WebpackDevServer(compiler, config.devServer)
//
//     const showInstructions = IS_INTERACTIVE || isFirstCompile
//
//     if (showInstructions) {
//         console.log()
//         console.log('The app is running at:')
//         console.log()
//         console.log('  ', chalk.cyan(`${DEFAULTS.PROTOCOL}://${DEFAULTS.HOST}:${DEFAULTS.PORT}/`))
//         console.log()
//         console.log('Note that the development build is not optimized.')
//         console.log('To create a production build, use', chalk.cyan('yarn build'), '.')
//         console.log()
//
//         isFirstCompile = false
//     }
//
//     compiler.hooks.invalid.tap('invalid', () => {
//         if (IS_INTERACTIVE) {
//             clearConsole()
//         }
//
//         console.log('')
//         console.log(chalk.blue(new Date().toUTCString(), ': Compiling...'))
//     })
//
//     compiler.hooks.done.tap('done', (stats) => {
//         if (IS_INTERACTIVE) {
//             // clearConsole();
//         }
//
//         // We have switched off the default Webpack output in WebpackDevServer
//         // options so we are going to "massage" the warnings and errors and present
//         // them in a readable focused way.
//         const messages = stats.toJson('minimal', true)
//         const isSuccessful = !messages.errors.length && !messages.warnings.length
//
//         if (isSuccessful) {
//             console.log(chalk.green(new Date().toUTCString(), ': Compiled successfully!'))
//         }
//
//         // If errors exist, only show errors.
//         if (messages.errors.length) {
//             console.log(chalk.red(new Date().toUTCString(), ': Failed to compile.'))
//             console.log()
//             messages.errors.forEach((message) => {
//                 console.log(message)
//                 console.log()
//             })
//
//             return
//         }
//
//         // Show warnings if no errors were found.
//         if (messages.warnings.length) {
//             console.log(chalk.yellow('Compiled with warnings.'))
//             console.log()
//             messages.warnings.forEach((message) => {
//                 console.log(message)
//                 console.log()
//             })
//
//             // Teach some ESLint tricks.
//             console.log('You may use special comments to disable some warnings.')
//             console.log('Use', chalk.yellow('// eslint-disable-next-line'), 'to ignore the next line.')
//             console.log('Use', chalk.yellow('/* eslint-disable */'), 'to ignore all warnings in a file.')
//         }
//     })
//
//     // Launch WebpackDevServer
//     devServer.listen(DEFAULTS.PORT, DEFAULTS.HOST, (error) => {
//         if (error) {
//             return console.log(error)
//         }
//
//         console.log(chalk.cyan('Starting the development server...'))
//         console.log()
//     })
// }
//
// // We attempt to use the default port but if it is busy, we let the user know the exisitng process
// detect(DEFAULTS.PORT).then((port) => {
//     if (port === DEFAULTS.PORT) {
//         run()
//
//         return
//     }
//
//     if (IS_INTERACTIVE) {
//         clearConsole()
//     }
//
//     console.log(chalk.red(`Something is already running on port ${DEFAULTS.PORT}.`))
//
//     if (IS_INTERACTIVE) {
//         let existingProcess = getProcessForPort(DEFAULTS.PORT)
//
//         if (existingProcess) {
//             console.log(chalk.red(`Probably:\n ${existingProcess}`))
//             console.log(chalk.red('Try clearing any processes running on that port and running the command again.'))
//         }
//     }
// })