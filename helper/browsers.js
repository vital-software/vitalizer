const browserslist = require('browserslist')
const chalk = require('chalk')
const os = require('os')
const fs = require('fs')

const defaultBrowsers = {
    development: ['chrome', 'firefox', 'edge'].map((browser) => `last 2 ${browser} versions`),
    production: ['>0.25%', 'not op_mini all', 'ie 11']
}

function checkBrowsers(dir, retry = true) {
    const current = browserslist.findConfig(dir)

    if (current != null) {
        return Promise.resolve(current)
    }

    if (!retry) {
        return Promise.reject(
            new Error(
                `${chalk.red('You must specify targeted browsers.') +
                    os.EOL
                }Please add a ${chalk.bold('.browserslistrc')} file to the project.`
            )
        )
    }

    return checkBrowsers(dir, false)
}

function printBrowsers(dir) {
    return checkBrowsers(dir).then((browsers) => {
        if (browsers == null) {
            console.log('Built the bundle with default browser support.')

            return
        }
        browsers = browsers[process.env.NODE_ENV] || browsers
        if (Array.isArray(browsers)) {
            browsers = browsers.join(', ')
        }
        console.log(`Built the bundle with browser support for ${chalk.cyan(browsers)}.`)
    })
}

module.exports = { defaultBrowsers, checkBrowsers, printBrowsers }