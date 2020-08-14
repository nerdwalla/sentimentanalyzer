

'use strict';
let API_KEY = "Poh1MHuBIPG9ZGrbFGGqW4WXI2oe2lZg2EQe13R5LOGt9mxDHA_ZceT4TgZE6WIfNTalC9R1aLKbJx2TAm5AhAEcI1s2Y1nBComVmxl5jt_sBq3RQIT7ZgzPgv4zX3Yx"
const yelp = require('yelp-fusion');
const client = yelp.client(API_KEY);

const business = (name, location, callback) => {
    client.search({
        term: name,
        location: location,
        limit: 1
    }).then(response => {
        callback(undefined, response.jsonBody.businesses[0].url)
    }).catch(e => {
        callback('Error connecting to getBusiness', undefined)
    });
}


const reviews = (name, location, callback) => {

    let biz = ''

    business(name, location, function (error, businessURL) {
        if (error) {
            callback('Error connecting to getBusiness', undefined)
        } else if (businessURL === undefined || businessURL === '' || businessURL === null) {
            callback('Error connecting to getBusiness', undefined)
        } else {
            const urlParts = businessURL.split('?')
            biz = urlParts[0]

            if (biz !== '' || biz !== undefined || biz !== null) {
                const callPython = require('./pythonintegration')
                const reviewsArray = callPython(biz)
                callback(undefined, reviewsArray)
            }
        }
    });

}


module.exports = reviews