//module reqs and port/app settings
const express = require("express");

const PORT = 8080;

const app = express();
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


//used for: shortURL generator
const generateRandomString = () => Math.random().toString(36).substr(2,8);

//"database" for shortURL/longURL key pairs
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

//get handlers 
app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:shortURL/", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

//post handler with redirects
app.post("/urls", (req, res) => {
    let shortUrlKey = generateRandomString();
    let longURL = req.body.longURL; 
    urlDatabase[shortUrlKey] = longURL; 
    res.redirect(`/urls/${shortUrlKey}`);      
}); 
    
//Update (using post in place of put) to update a longURL
app.post("/urls/:shortURL/", (req, res) => {
    var formContent = req.body.longURL;
    urlDatabase[req.params.shortURL] = formContent; 
    res.redirect('/urls');
}); 
    
//update a long URL using put
// app.put("/urls/:shortURL/", (req, res) => {
    //     var formContent= req.body.longURL;
    //     urlDatabase[req.params.shortURL] = formContent; 
    //     res.redirect('/urls');
// });
        
//This deletes a URL (short and long)
app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
});

//app is listening
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});