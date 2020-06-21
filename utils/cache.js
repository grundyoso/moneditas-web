const redis = require('redis')
const JSONCache = require('redis-json')

const redisAuth = process.env.REDIS_AUTH
const redisPort = process.env.REDIS_PORT
const redisHost = process.env.REDIS_HOST

module.exports.redisConnect = () => {
    const client = redis.createClient(redisPort, redisHost, {no_ready_check: true})
    client.auth(redisAuth)
    client.on('error', function (err) {
        console.log('Error ' + err)
    })

    client.on('connect', function () {
        console.log('Connected to Redis')
    })

    return new JSONCache(client)
}

module.exports.jsonCache = module.exports.redisConnect()
