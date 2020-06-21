const {createScheduleArray} = require('../utils/createScheduleArray')
const {jsonCache} = require('../utils/cache')

/** Resets times for path param supplied location based on hours and interval.
 * delete /times
 * @param {string} location code for the location needing a reset taken from sub-domain of request
 * @returns {object} Returns `{reset: success}`
 */
module.exports.handler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false
    const location = event.headers['X-Forwarded-Host'].match(
        /(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/,
    )[1]
    console.log('location: ', location)
    const loc = await jsonCache.get(location)

    const {openTime, closeTime, interval, customers} = loc.capacity
    const capacity = customers
    const schedule = await createScheduleArray(openTime, closeTime, interval, capacity)

    delete loc.schedule
    loc.schedule = schedule

    console.log('loc: ', loc)
    // try catch
    await jsonCache.rewrite(location, loc)

    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html',
        },
        body: '{reset: success}',
    }

    callback(null, response)
}
