const {jsonCache} = require('../utils/cache')

module.exports.getLocationProperties = async (location) => {
    console.log('location: ', location)
    let locationData = await jsonCache.get(location)
    console.log('locationData: ', locationData)
    return locationData
}
