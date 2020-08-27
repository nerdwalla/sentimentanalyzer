'use strict';

const reviews = (businessURL, callback) => {
    console.log("Fetching reviews for: " + businessURL)
    if (businessURL !== '' || businessURL !== undefined || businessURL !== null) {
        const callPython = require('./pythonintegration')
        const reviewsArray = callPython(businessURL)
        if (reviewsArray !== null && reviewsArray !== '' && reviewsArray !== undefined) {
            callback(undefined, reviewsArray)
        } else {
            callback('Error Scraping the data from:: ' + businessURL, undefined)
        }

    }
}


module.exports = reviews