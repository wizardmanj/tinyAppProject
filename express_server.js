//port used for dev/testing
const PORT = 8080;

//framework, parsing and template engine specs
const express = require("express");
const app = express();
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser')
app.use(cookieParser())

//used for: shortURL generator
const generateRandomString = () => Math.random().toString(36).substr(2,8);

//"database" for shortURL/longURL key pairs
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

//get handlers 
app.get("/urls", (req, res) => {
    let templateVars = { 
        urls: urlDatabase, 
        username: req.cookies["username"]};
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    let templateVars = {
        username: req.cookies["username"]}
    res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL/", (req, res) => {
    let templateVars = { 
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL], 
        username: req.cookies["username"]};
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

//post handlers (with redirects where applicable)
app.post("/urls", (req, res) => {
    let shortUrlKey = generateRandomString();
    let longURL = req.body.longURL; 
    urlDatabase[shortUrlKey] = longURL; 
    console.log(shortUrlKey);
    // res.redirect(`/urls/${shortUrlKey}`);      
}); 
    
//Update (using post in place of put) to update a longURL
app.post("/urls/:shortURL", (req, res) => {
    var formContent = req.body.longURL;
    urlDatabase[req.params.shortURL] = formContent; 
    res.redirect('/urls');
}); 
    
app.post("/login", (req, res) => {
    let username = req.body.username;
    res.cookie('username', username);
    res.redirect("/urls");
})


//This deletes a URL (short and long)
app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    let username = req.body.username;
    res.clearCookie('username');
    res.redirect("/urls");
})
//app is listening
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});