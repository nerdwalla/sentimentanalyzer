const request = require('request')

function analyzeSentimentOfText(text) {
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

    let response
    try {
        response = request.post({ url: apiEndpoint, headers: { 'content-type': 'application/json' }, json: nlAPIData });
    } catch (err) {
        console.error('Error getting document analyzer: ', err);
    }
    if (response !== '' && response !== null && response !== undefined) {
        return JSON.stringify(response.documentSentiment)
    } else {
        return JSON.stringify(response)
    }

}

module.exports = analyzeSentimentOfText;