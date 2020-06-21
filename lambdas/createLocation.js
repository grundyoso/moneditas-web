const createScheduleArray = require('../utils/createScheduleArray')
const jsonCache = require('../utils/cache')

exports.handler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false
    console.log('createLocation event.body: ', event.body)

    const {location, textDescription, openTime, closeTime, interval, capacity} = JSON.parse(
        event.body,
    )

    let schedule = await createScheduleArray(openTime, closeTime, interval)
    console.log('schedule Object: ', typeof schedule, schedule)
    const locationProperties = {
        id: location,
        tz: 'America/Toronto',
        textDescription,
        capacity: {openTime, closeTime, interval, units: 'm', customers: '120'},
        schedule,
    }

    await jsonCache.rewrite(location, locationProperties)

    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html',
        },
        body: JSON.stringify({created: true}),
    }
    callback(null, response)
}
