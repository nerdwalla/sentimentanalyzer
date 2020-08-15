const path = require('path')
const express = require('express')
const hbs = require('hbs')
const bodyParser = require('body-parser');
const getReviews = require('./utils/findbusiness')
const analyzeSentimentOfText = require('./utils/sentimentanalysis')
// var exec = require('child_process').exec

const app = express()
const port = process.env.PORT || 3000

// Define Path for Express Config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

//Setup static directory to serve
app.use(express.static(publicDirectoryPath))
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('', (req, res) => {
    res.render('index', {
        title: 'Index',
        name: 'Sathya B',
        page: 'analyzer'
    })
})

app.get('/index', (req, res) => {
    
    res.render('index', {
        title: 'Index',
        name: 'Sathya B',
        page: 'analyzer'
    })
})

app.get('/analyzer', (req, res) => {
    res.render('analyzer', {
        title: 'Index',
        name: 'Sathya B',
        page: 'analyzer'
    })
})

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Me',
        name: 'Sathya B',
        page: 'about'
    })
})

app.get('/sources', (req, res) => {
    res.render('sources', {
        title: 'Source',
        name: 'Sathya B',
        page: 'sources'
    })
})

app.get('*', (req, res) => {
    res.render('404', {
        title: 'Not Found',
        name: 'Sathya B',
        page: '404'
    })
})

app.post('/result', (req, res) => {
    const businessName = req.body.bizInputHidden;
    const locationName = req.body.locationname;

    if (businessName !== null && businessName !== undefined && businessName !== '' && locationName !== null && locationName !== undefined && locationName !== '') {
        getReviews(businessName, locationName, (error, reviews) => {
            if (error) {
                return res.send({ error })
            } else if (reviews === '' || reviews === undefined || reviews === null) {
                return res.send({ errorMessage: "no reviews found" })
            } else {

                let best_review = ''
                let best_review_rating = 0

                let worst_review = ''
                let worst_review_rating = 0
                let final_score = 0
                let score = 0.0
                let total_reviews = reviews.length
                var promiseArray = [];

                let counter = 0
                reviews.forEach(element => {
                    let result

                    analyzeSentimentOfText(element.cleansed, function (error, sentiment) {
                        if (error) {
                            return res.send({ error })
                        } else if (sentiment === '' || sentiment === undefined || sentiment === null) {
                            return res.send({ errorMessage: "Error fetching Sentiment score" })
                        } else {
                            sentimentScore = JSON.parse(sentiment)
                            score += sentimentScore.score
                            if (sentimentScore.score > best_review_rating) {
                                best_review_rating = sentimentScore.score
                                best_review = element.original
                            }

                            if (sentimentScore.score < worst_review_rating) {
                                worst_review_rating = sentimentScore.score
                                worst_review = element.original
                            }
                            counter += 1;
                            if (counter === total_reviews) {

                                final_score = score / total_reviews

                                const resp = {
                                    final_score,
                                    best_review: cleanReview(best_review),
                                    best_review_rating,
                                    worst_review: cleanReview(worst_review),
                                    worst_review_rating
                                }

                                res.render('result', resp)
                            }
                        }

                    })
                })
            }

        })
    }
});

function cleanReview(review) {
    let clean = review.split('>')[2]
    clean = clean.split("</span")[0]
    return clean
}

app.listen(port, () => {
    console.log('Server is up on Port: ' + port)
})