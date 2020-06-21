const moment = require('moment-timezone')

/** Creates a JSON object from the first found match of the given serial number.
 *
 * @param {string} openTime Time store opens in HH:mm
 * @param {string} closeTime Time store closes in HH:mm
 * @param {int} interval Interval in minutes of check in times
 * @returns {object} Returns array of times for this store
 */

module.exports.createScheduleArray = async function (openTime, closeTime, interval, capacity) {
    const remainingTimes = [
        {
            time: '07:00',
            capacity: 10,
            apptType: 'class',
        },
        {
            time: '08:00',
            capacity: 10,
            apptType: 'class',
        },
        {
            time: '09:00',
            capacity: 10,
            apptType: 'class',
        },
        {
            time: '10:00',
            capacity: 10,
            apptType: 'class',
        },
        {
            time: '11:00',
            capacity: 10,
            apptType: 'open gym',
        },
        {
            time: '12:00',
            capacity: 10,
            apptType: 'open gym',
        },
        {
            time: '13:00',
            capacity: 10,
            apptType: 'open gym',
        },
        {
            time: '14:00',
            capacity: 10,
            apptType: 'open gym',
        },
        {
            time: '15:00',
            capacity: 10,
            apptType: 'class',
        },
        {
            time: '16:00',
            capacity: 10,
            apptType: 'class',
        },
        {
            time: '17:00',
            capacity: 10,
            apptType: 'class',
        },
        {
            time: '18:00',
            capacity: 10,
            apptType: 'class',
        },
    ]
    return remainingTimes
}
module.exports.createScheduleArray_1 = async function (openTime, closeTime, interval, capacity) {
    let remainingTimes = []
    let t = 0

    console.log('openTime: ', openTime)
    console.log('closeTime: ', closeTime)
    const openTimeMins = moment.duration(openTime).asMinutes()
    const closeTimeMins = moment.duration(closeTime).asMinutes()

    for (let i = openTimeMins; i < closeTimeMins; i = i + parseInt(interval)) {
        let obj = {time: moment.utc().startOf('day').add(i, 'minutes').format('HH:mm'), capacity}
        //remainingTimes[t].time = moment.utc().startOf("day").add(i, "minutes").format("HH:mm")
        //remainingTimes[t].capacity = capacity
        remainingTimes.push(obj)
        console.log(
            i,
            closeTimeMins,
            interval,
            t,
            remainingTimes[t].time,
            remainingTimes[t].capacity,
        )
        t = t + 1
    }
    console.log('remainingtimes:', typeof remainingTimes, ' y ', remainingTimes[1].time)

    return remainingTimes
}
