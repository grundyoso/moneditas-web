const axios = require('axios')
const {removeTime} = require('../utils/removeTime')

const passNinjaAccountId = process.env.PASSNINJA_ACCOUNT_ID
const passNinjaApiKey = process.env.PASSNINJA_API_KEY

/** listens for log entries.. if PASS_INSTALL, removes time from list of times
 *
 * POST /log
 * @url { location }
 * @param {body} event param time that was scheduled for visit when pass created.
 * @returns {object} { TBD }
 */
module.exports.handler = async (event, context, callback) => {
    console.log('event.body: ', event.body)

    const eventRecord = JSON.parse(event.body)

    const LocationFromSubDomain = event.headers['X-Forwarded-Host'].match(
        /(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/,
    )[1]
    console.log('event')
    if (['GOOGLE_INSTALL', 'APPLE_REGISTER'].includes(eventRecord.event.type)) {
        console.log(event.body)
        const serialNumber = eventRecord.event.serialNumber
        const passType = eventRecord.event.passType
        const getPassResponse = await axios({
            method: 'GET',
            url: `http://api.passninja.com/dev/passes/${passType}/${serialNumber}`,
            headers: {
                'x-api-key': passNinjaApiKey,
                'x-account-id': passNinjaAccountId,
            },
        })
        console.log('getPassResponse: ', getPassResponse)
        const passJson = getPassResponse.data.jsonData.apple
        console.log('passJson: ')
        console.log('passJson: ', passJson)

        const time = passJson.eventTicket.headerFields[0].value
        const location = passJson.organizationName
        console.log('time: ', time)
        console.log('location:', location)
        removeTime(location, time)
    }

    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html',
        },
        body: '',
    }
    callback(null, response)
}
