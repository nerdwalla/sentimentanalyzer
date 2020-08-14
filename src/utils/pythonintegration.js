var exec = require('child_process').execSync
// var exec = require('child_process').spawn
const path = require('path')

function callPython(businessURL) {
    let reviewArray = []
    let completeReview = []
    // Use child_process.spawn method from  
    // child_process module and assign it 
    // to variable spawn 
    const pyPath = path.join(__dirname, '../../public/js/sa.py')

    var result = exec('python ' + pyPath + ' ' + businessURL)

    let resultArray = result.toString().split("\n")
    let i = 1;
    let j = 0;
    let original = ''
    let cleansed = ''
    resultArray.forEach(element => {
        i += 1;
        j += 1;
        if (j % 2 !== 0) {
            original = element
        }
        if (j % 2 === 0) {
            cleansed = element
            const obj = {
                "original": original,
                "cleansed": cleansed
            }
            completeReview.push(obj)
            j = 0
            original = ''
            cleansed = ''
        }
        if (element !== '' && element !== null && element !== undefined) {
            reviewArray.push(element);
        }
    });
    return completeReview;

}

module.exports = callPython;