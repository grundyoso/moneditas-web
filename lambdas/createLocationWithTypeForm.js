const {createScheduleArray} = require('../utils/createScheduleArray')
const {getTypeFormAnswer} = require('../utils/getTypeformAnswer')
const {jsonCache} = require('../utils/cache')
const moment = require('moment')

module.exports.handler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false
    console.log('event.body: ', event.body)

    const responseBody = JSON.parse(event.body)

    let location = getTypeFormAnswer('location', responseBody)
    const textDescription = getTypeFormAnswer('textDescription', responseBody)
    let openTime = getTypeFormAnswer('openTime', responseBody)
    let closeTime = getTypeFormAnswer('closeTime', responseBody)
    const interval = getTypeFormAnswer('interval', responseBody)
    const capacity = getTypeFormAnswer('capacity', responseBody)
    const gracePeriod = getTypeFormAnswer('gracePeriod', responseBody)

    openTime = moment(openTime, 'hh:mm A').format('HH:mm')
    closeTime = moment(closeTime, 'hh:mm A').format('HH:mm')
    location = location.replace(/\s+|@|#/, '')
    location = location.replace(/[.]/, '-')
    location = location.toLowerCase()

    let schedule = await createScheduleArray(openTime, closeTime, interval, capacity)

    const locationProperties = {
        id: location,
        tz: 'America/Toronto',
        textDescription,
        capacity: {openTime, closeTime, interval, gracePeriod, units: 'm', customers: '120'},
        schedule,
    }

    await jsonCache.rewrite(location, locationProperties)

    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html',
        },
        body: JSON.stringify({location, textDescription, openTime, closeTime, interval}),
    }
    callback(null, response)
}
