const axios = require('axios')
const Handlebars = require('handlebars')
const {getLocationProperties} = require('../utils/getLocationProperties')
const moment = require('moment')
const fs = require('fs')
const path = require('path')
const redirect = Handlebars.compile(
    fs.readFileSync(path.resolve(__dirname, `../handlebars/redirect.hbs`), 'utf8'),
)

const passNinjaAccountId = process.env.PASSNINJA_ACCOUNT_ID
const passNinjaApiKey = process.env.PASSNINJA_API_KEY

/** creates a new pass for a given location
 *
 * GET /pass?time=HH:mm  using GET so can be done from browser .. might revisit
 * @param {string} location pathParam code for the location pass to be created for.
 * @param {time} pathParam  time in HH:mm appended to request with ?time=14:30
 * @returns {object} {created: true} // placeholder
 */
module.exports.handler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false

    const location = event.headers['X-Forwarded-Host'].match(
        /(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/,
    )[1]
    const loc = await getLocationProperties(location)
    const {time} = event.queryStringParameters

    const hours = time.match(/(.*):/g).pop().replace(':', '')
    const minutes = parseInt(time.match(/:(.*)/g).pop().replace(':', ''))

    let date = moment().startOf('day')
    date.hour(hours)
    date.minutes(minutes)
    const googleTime = moment(date).format('YYYY-MM-DDTHH:mm:ss')

    const body = {
        passType: 'get.fastpass',
        pass: {
            location,
            googleTime,
            locationDescription: loc.textDescription,
            appleTime: time,
        },
    }

    // return redirect to mobile_redirect page from the return values
    const createResponse = await axios({
        method: 'POST',
        url: 'http://api.passninja.com/dev/passes/',
        data: JSON.stringify(body),
        headers: {
            'x-api-key': passNinjaApiKey,
            'x-account-id': passNinjaAccountId,
        },
    })

    console.log('landing URL: ', createResponse.data.landingUrl)
    context = {redirect: createResponse.data.landingUrl}
    const html = redirect(context)

    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html',
        },
        body: html,
    }

    callback(null, response)
}
