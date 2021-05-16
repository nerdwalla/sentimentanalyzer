require('dotenv').config()
const path = require('path')
const express = require('express')
const hbs = require('hbs')
const bodyParser = require('body-parser');
const getReviews = require('./utils/getreviews')
const getBusinesses = require('./utils/findbusinesses')
const analyzeSentimentOfText = require('./utils/sentimentanalysis')

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
        page: 'analyzer',
        additionalData: false
    })
})

app.get('/error', (req, res) => {
    res.render('error', {
        title: 'Error',
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

app.post('/intermediate', (req, res) => {
    
    const businessName = req.body.bizInputHidden;
    const locationName = req.body.locationname;

    if (businessName !== null && businessName !== undefined && businessName !== '' && locationName !== null && locationName !== undefined && locationName !== '') {
        getBusinesses(businessName, locationName, (error, businesses) => {
            if (error) {
                let errorMsg
                if (error instanceof Error) {
                    const errorBody = JSON.parse(error.response.body);
                    errorMsg = errorBody.error.description
                } else {
                    errorMsg = error
                }
                res.render('error', {
                    errorMessage: errorMsg
                })
            } else if (businesses === '' || businesses === undefined || businesses === null) {
                res.render('error', {
                    errorMessage: "No Businesses found for " + businessName
                })
            } else {
                let businessAddresses = []
                businesses.forEach(element => {
                    
                    let address = '';
                    element.location.display_address.forEach(addr => {
                        address = address + addr + ", "
                    })
                    var lastIndex = address.lastIndexOf(",")

                    address = address.substring(0, lastIndex);

                    const businessURL = element.url;
                    const urlParts = businessURL.split('?')
                    biz = urlParts[0]

                    let resp = {
                        url: biz,
                        name: businessName,
                        location: locationName,
                        address: address
                    }

                    businessAddresses.push(resp)
                })
                
                res.render('intermediate', {
                    addresses: businessAddresses,
                    name: 'Sathya B',
                    page: 'analyzer',
                    additionalData: true
                })
            }

        })

    }

})

app.post('/result', (req, res) => {
    
    const businessURL = req.body.bizInputHidden;
    const businessName = req.body.bizNameHidden;
    const location = req.body.bizLocationHidden;

    if (businessURL !== null && businessURL !== undefined && businessURL !== '') {
        getReviews(businessURL, (error, reviews) => {
            if (error) {
                let errorMsg
                if (error instanceof Error) {
                    const errorBody = JSON.parse(error.response.body);
                    errorMsg = errorBody.error.description
                } else {
                    errorMsg = error
                }
                res.render('error', {
                    errorMessage: errorMsg
                })
            } else if (reviews === '' || reviews === undefined || reviews === null) {
                res.render('error', {
                    errorMessage: "No reviews found for " + businessName
                })
            } else {

                let best_review = ''
                let best_review_rating = 0

                let worst_review = ''
                let worst_review_rating = 0
                let final_score = 0
                let score = 0.0
                let total_reviews = reviews.length

                let counter = 0
                reviews.forEach(element => {
                    let result

                    analyzeSentimentOfText(element.cleansed, function (error, sentiment) {
                        if (error) {
                            res.render('error', {
                                errorMessage: JSON.stringify(error)
                            })
                           
                        } else if (sentiment === '' || sentiment === undefined || sentiment === null) {
                            res.render('error', {
                                errorMessage: "Error fetching Sentiment score"
                            })
                            
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
                                    final_score: Math.round(final_score * 100) / 100,
                                    final_score_perc: getPercent(final_score),
                                    best_review: cleanReview(best_review),
                                    best_review_rating,
                                    best_review_rating_perc: getPercent(best_review_rating),
                                    worst_review: cleanReview(worst_review),
                                    worst_review_rating,
                                    worst_review_rating_perc: getPercent(worst_review_rating),
                                    overall_message: getOverallMessage(final_score, businessName, location),
                                    dispImg: getSentimentImage(final_score)
                                }

                                res.render('result', resp)
                            }
                        }

                    })
                })
            }

            /*
                     SAMPLE DATA
            best_review = '<span>My wife met some friends for some after work cocktails at Buck and Honeys tonight. I was hungry, so she brought me some take out. I ordered the pan fried walleye, with smashed cauliflower and gourmet mac and cheese for the two sides. I heated everything in the air fryer for 5 minutes at 360 degrees, and hoped for the best. I must say, as I write this review, I am still smiling from how delicious every single bite was. It was a perfect meal. My wife said their service was impeccable, everyone was wearing masks and practicing social distancing...for that I give them a 5 star rating.</span>'
            worst_review = '<span>I opted for the taco salad which was on the bland side - could have really used some seasoning - I had to ask for more salsa (Pace I think) just to jazz it up.  Someone else in our group tried the salmon which was also fine but seemed a touch over cooked.  By far the standout item and the item I would likely get on my next visit was the specialty sandwich with ham, pepperoni, marinara and melted cheese that another in our party ordered.  Definitely a unique item and it had some flavor.</span>'
            best_review_rating = 0.8
            worst_review_rating = -0.3
            const resp = {
                final_score: -0.2,
                final_score_perc: "-20%",
                best_review: "I've been at this location a few �times and find the staff and customer service to be pleasant and efficient. �I'm from LA where everyone is usually rushing and pleasantries aren't always exchanged with customers, but the staff here was petty pleasant.\r",
                best_review_rating: 0.1,
                best_review_rating_perc: "10%",
                worst_review: "My first time here and it is a horrible experience. The coffee itself was good, and the ambiance is actually quite pleasant. However, the staff and customer \"service\" is a nightmare. My friend ordered a \"Matcha soymilk latte\" (on the side note, this is a really good drink if you haven't tried it!), and the barista confirmed two times with her because she wanted it to be decaf. When the younger barista was making the drink, a middle-aged Asian lady came out from the back door, and started making drinks with the barista. I overheard that they were talking about this drink as a Mocha, instead of Matcha, so I told my friend that she might want to double check with them so she didn't get the wrong drink. She did, and this is where it went south. The middle-aged lady first took it out on the barista, telling her that she should've put it down on the cup as green tea latte instead of \"ML\" or something like that. After the barista apologized to her, she then turned to us saying stuff like \"you know how you said Matcha can be misunderstood as Mocha, the pronunciation\". And we think it's fair, and my friend agreed. But this lady kept saying how the young barista should've put down green tea latte on the cup, so she kept apologizing (she said \"im sorry\" for at least 3 times up to this point). But, this lady took it further, turned around, and started educating my friend. She said \"you should never order a Matcha latte because there is no such a thing. You should just say green tea latte.\" That's where I felt that's enough. I told her that the first thing under their menu on the wall, is \"Matcha Soymilk Latte\" and that shut her down. I don't expect excellent service from coiffed chain. But come on, at least have some knowledge on your menu, and some respect for both of your employees and your customers. For that, I gave that lady 1 star.\r",
                worst_review_rating: -0.7,
                worst_review_rating_perc: "-70%",
                overall_message: "This means that in general customers have negative things to say about Starbucks at Normal, IL location"
            }

            res.render('result', resp)*/

        })
    }
});

function cleanReview(review) {
    if (review !== undefined && review !== null && review !== '') {
        let clean = review.split('>')[2]
        if (clean !== undefined && clean !== null && clean !== '') {
            clean = clean.split("</span")[0]
            return clean
        } else {
            return review
        }
    }
    return ''
}

function getPercent(decimalNumber) {
    if (decimalNumber !== undefined && decimalNumber !== null) {
        let percent = (decimalNumber * 100).toString() + '%'
        return percent;
    }
    return ''
}

function getSentimentImage(final_score) {
    if (final_score !== undefined && final_score !== null) {
        if(final_score >= -1.0 && final_score < -0.5 ) {
            return '../public/img/emotions-ClearlyNegative.jpg'
        } else if(final_score >= -0.5 && final_score < 0 ) {
            return '../public/img/emotions-Negative.jpg'
        } else if(final_score == 0 ) {
            return '../public/img/emotions-Neutral.jpg'
        } else if(final_score > 0 && final_score < 0.5 ) {
            return '../public/img/emotions-Positive.jpg'
        } else if(final_score >= 0.5 && final_score <= 1 ) {
            return '../public/img/emotions-ClearlyPositive.jpg'
        }
    }
    return ''
}

function getOverallMessage(final_score, businessName, location) {
    if (final_score !== undefined && final_score !== null) {
        if (final_score > 0) {
            const percent = getPercent(final_score)
            return 'This means that ' + percent + ' of customer have positive things to say about ' + businessName + ' at ' + location + ' location';
        } else if (final_score < 0) {
            return 'This means that in general customers have negative things to say about ' + businessName + ' at ' + location + ' location';
        } else {
            return 'This means that in general customers have neutral about ' + businessName + ' at ' + location + ' location';
        }
    }
    return ''
}

app.listen(port, () => {
    console.log('Server is up on Port: ' + port)
})