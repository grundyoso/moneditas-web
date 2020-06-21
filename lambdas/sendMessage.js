const axios = require('axios')

module.exports.handler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false
    console.log(JSON.stringify(event))

    const {message, passType, serialNumber} = Object.fromEntries(
        event.body.split('&').map((entry) => entry.split('=')),
    )

    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': process.env.PASSNINJA_API_KEY,
        'x-account-id': process.env.PASSNINJA_ACCOUNT_ID,
    }
    const decodedMessage = decodeURIComponent(message).replace(/\+/g, ' ')
    const axiosResponse = await axios.patch(
        `http://api.passninja.com/dev/passes/${passType}/${serialNumber}/`,
        JSON.stringify([
            {
                op: 'replace',
                path: '/backFields/1/value',
                value: decodedMessage,
            },
        ]),
        {
            headers,
        },
    )

    let webpage = serialNumber === '3cf54737-4ff9-472a-83b7-08a39e39fb14' ? 'QR' : ''
    console.log('axiosResponse: ', axiosResponse)
    const response = {
        statusCode: 302,
        headers: {
            Location: `${
                event.headers.origin
            }/message${webpage}.html?message=${decodedMessage}&passType=${passType}&serialNumber=${serialNumber}&success=${
                axiosResponse.status === 200
            }`,
        },
    }
    callback(null, response)
}
