'use strict';

const API_KEY = process.env.YELP_API_KEY
const yelp = require('yelp-fusion');
const client = yelp.client(API_KEY);

const business = (name, location, callback) => {
    client.search({
        term: name,
        location: location,
        limit: 10
    }).then(response => {
        callback(undefined, response.jsonBody.businesses)
    }).catch(e => {
        callback(e, undefined)
    });
}

module.exports = business