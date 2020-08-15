'use strict';

const API_KEY = process.env.YELP_API_KEY
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
        // console.error(e)
        callback(e, undefined)
    });
}


const reviews = (name, location, callback) => {

    let biz = ''

    business(name, location, function (error, businessURL) {
        if (error) {
            // console.error(error)
            callback(error, undefined)
        } else if (businessURL === undefined || businessURL === '' || businessURL === null) {
            callback('Business information was not found', undefined)
        } else {
            // console.log('URL->'+businessURL)
            const urlParts = businessURL.split('?')
            biz = urlParts[0]

            if (biz !== '' || biz !== undefined || biz !== null) {
                const callPython = require('./pythonintegration')
                const reviewsArray = callPython(biz)
                if(reviewsArray !== null && reviewsArray !== '' && reviewsArray !== undefined ) {
                    callback(undefined, reviewsArray)
                } else {
                    callback('Error Scraping the data from:: '+biz ,undefined)
                }
                
            }
        }
    });

}


module.exports = reviews