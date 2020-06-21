const {jsonCache} = require('cache')

/** will remove time entry from available list (called from log processing)
 *
 * DELETE /time
 * @param {string} location location to have time removed
 * @param {string} time param time that was scheduled for visit when pass created.
 * @returns {object} {removedTime: '${time}'}
 */
module.exports.removeTime = async (location, time) => {
    //time = time.subString(0,2) + "%3A" + time.subString(2,2)
    console.log('time: ', time, ' location: ', location)
    const record = await jsonCache.get(location)

    console.log('found location Record: ', location)

    //  let match = record.schedule.filter((e) => e.time !== time)

    record.schedule.some(function (scheduleObject) {
        console.log('scheduleObject: ', scheduleObject)
        if (scheduleObject.time === time) {
            --scheduleObject.capacity
        }

        if (scheduleObject.capacity === 0) {
            record.schedule = record.schedule.filter((e) => e.time !== time)
        }
    })

    await jsonCache.set(location, record)

    return `{time: '${time}'`
}
