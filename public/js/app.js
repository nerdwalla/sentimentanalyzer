// DIV details
const mainContainer = document.querySelector('#main-content')
const divResults = document.querySelector('#result')
const bizName = document.querySelector('#bizName')
const locationName = document.querySelector('#locationName')
const locationQuestion = document.querySelector('#locationQuestion')

// businessName form details
// const bizForm = document.querySelector('#bizForm')
const bizSearch = document.querySelector('#bizInput')
const bizSubmit = document.querySelector('#bizSubmit')

// Location form details
const locationForm = document.querySelector('#locationForm')
const locSearch = document.querySelector('#locInput')
const locationSubmit = document.querySelector('#locationSubmit')
const bizInputHidden = document.querySelector('#bizInputHidden')


let bizValue
let locationValue = ''

// This method is used to only make the Chat like feel appear

bizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    bizValue = bizSearch.value
    bizInputHidden.value = bizValue
    bizName.textContent = bizValue
    bizName.style.display = "inline-block";
    bizSearch.value = ""
    // setTimeout(function () {
    //     $locationQuestion.css("display", "block");
    // }, 3000);
    locationQuestion.style.display = "inline-block"
    bizForm.style.display = "none"
    locationForm.style.display = "inline"
    locSearch.value = ''
})