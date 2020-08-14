'use strict';
const request = require('request')

const analyzeSentimentOfText = (text, callback) => {
    var apiKey = "AIzaSyCCJICUsYjjg0F-BNY2gLvLc3YWWRqDu8U";
    var apiEndpoint = 'https://language.googleapis.com/v1/documents:analyzeSentiment?key=' + apiKey;

    var reviewData = {
        language: 'en-us',
        type: 'PLAIN_TEXT',
        content: text
    };

    var nlAPIData = {
        document: reviewData,
        encodingType: 'UTF8'
    };

    request.post({ url: apiEndpoint, headers: { 'content-type': 'application/json' }, json: nlAPIData }, (error, response, body) => {
        if (error) {
            callback('Error connecting with the google api', undefined)
        } else {
            callback(undefined, JSON.stringify(body.documentSentiment))
        }
    })
}

module.exports = analyzeSentimentOfText;