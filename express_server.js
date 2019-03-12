var express = require("express");
var app = express();
var PORT = 3000;

const generateRandomString = () => Math.random().toString(36).substr(2,8);

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

// app.get("/urls/:whatever", (req, res) => {
//     let templateVars = { whatever: req.params.whatever};
//     res.render("urls_show", templateVars);
// });

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
    res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
    let shortUrlKey = generateRandomString();
    let longURL = req.body.longURL; 
    urlDatabase[shortUrlKey] = longURL;
    res.send("Ok");         
});   

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});