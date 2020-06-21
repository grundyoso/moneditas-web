const moment = require('moment')
const momenttz = require('moment-timezone')
const Handlebars = require('handlebars')
const {getLocationProperties} = require('../utils/getLocationProperties')
const path = require('path')
const fs = require('fs')

const businessTimes = Handlebars.compile(
    fs.readFileSync(path.resolve(__dirname, `../handlebars/businessTimes.hbs`), 'utf8'),
)
const locationNotFound = Handlebars.compile(
    fs.readFileSync(path.resolve(__dirname, `../handlebars/locationNotFound.hbs`), 'utf8'),
)

/** returns a web page with available appointment times
 *
 * GET /times/
 * @param {string} location subdomain code for the location for which times will be listed.
 * @returns {html} page with selectable times
 */
module.exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false
    console.log(JSON.stringify(event))
    const location = event.headers['X-Forwarded-Host'].match(
        /(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/,
    )[1]
    const baseUrl = `https://${location}.getfastpass.com`
    let html

    getLocationProperties(location)
        .then((response) => {
            console.log('list=> response: ', response)
            return response
        })
        .then((json) => {
            console.log('JSON:', json)
            console.log('json.schedule', json.schedule[0])

            const nowTime = momenttz(new Date()).tz(json.tz).format('HH:mm')
            json.schedule = json.schedule.filter((e) => e.time > nowTime)

            const context = {
                schedule: json.schedule.map((schedule) => {
                    console.log('schedule.time: ', schedule.time)
                    schedule.timePeriodFmt = moment(schedule.time, 'HH:mm').format('hh:mm A')
                    return schedule
                }),
                location: json.textDescription,
                link: baseUrl + '/pass?time=',
            }

            html = businessTimes(context)

            const response = {
                statusCode: 200,
                headers: {
                    'Content-Type': 'text/html',
                },
                body: html,
            }
            callback(null, response)
        })
        .catch((err) => {
            console.log(`location ${location} not found: ${err.message}`)
            const context = {
                location,
            }
            html = locationNotFound(context)

            const response = {
                statusCode: 200,
                headers: {
                    'Content-Type': 'text/html',
                },
                body: html,
            }
            callback(null, response)
        })
}
