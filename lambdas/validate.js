const {jsonCache} = require('../utils/cache')
const momenttz = require('moment-timezone')
const Handlebars = require('handlebars')

const validationResponse = Handlebars.compile(
    fs.readFileSync(path.resolve(__dirname, `./handlebars/validationResponse.hbs`), 'utf8'),
)

/** Called from QR code on pass to say if visitor is at location during valid time or not
 *
 * GET /v
 * @param {string} location from sub-domain
 * @param {string} time pathParam time that was scheduled for visit when pass created.
 * @returns {html} red or green html page depending on success or failure of check.
 */
module.exports.handler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false
    const {time} = event.queryStringParameters
    const location = event.headers['X-Forwarded-Host'].match(
        /(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/,
    )[1]
    console.log('location from url: ', location)
    console.log('time:', time)

    const sched = await jsonCache.get(location)
    const gracePeriod = sched.capacity.gracePeriod.replace(/mins/, '')
    console.log('sched.capacity.gracePeriod: ', sched.capacity.gracePeriod)
    console.log('gracePeriod fixed: ', gracePeriod)
    let earlyGrace = momenttz(time, 'hh:mm').subtract(gracePeriod, 'm').format('HH:mm')
    let lateGrace = momenttz(time, 'hh:mm').add(gracePeriod, 'm').format('HH:mm')
    console.log('earlyGrace: ', earlyGrace)
    console.log('lateGrace: ', lateGrace)
    let endTime = momenttz(time, 'hh:mm')
        .add(sched.capacity.interval, sched.capacity.units)
        .format('HH:mm')
    console.log('endTime: ', endTime)
    console.log(
        'sched.capacity.interval, sched.capacity.units',
        sched.capacity.interval,
        sched.capacity.units,
    )

    const nowTime = momenttz(new Date()).tz(sched.tz).format('HH:mm')

    console.log(nowTime)
    console.log('earlyGrace < nowTime: ', earlyGrace < nowTime)
    console.log('nowTime < lateGrace: ', nowTime < lateGrace)
    console.log('eG, nT, lG: ', earlyGrace, nowTime, lateGrace)

    const bgColor = earlyGrace < nowTime && nowTime < lateGrace ? 'green' : 'red'

    context = {bgColor}
    const html = validationResponse(context)
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html',
        },
        body: html,
    }

    callback(null, response)
}
