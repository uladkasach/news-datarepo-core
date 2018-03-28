/*
    use newsapi.org to retreive news data, save data to csv
    https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=6afbb998f94c435180c8d4ce4282b7cf
*/
var request = require("request-promise")

var path = "https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=6afbb998f94c435180c8d4ce4282b7cf";
request(path)
    .then((response)=>{
        console.log("resopnse:");
        console.log(response);
    })
