const express = require('express');
const bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

const app = express();
const PORT = process.env.port || 8080;
//KILL PORT:
// netstat -ntlp | grep :8080 (<== portnumber)
// then kill (pid #; provided from above)

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieParser())


//used for: shortURL generator
const generateRandomString = () => Math.random().toString(36).substr(2,8);

//url database
const urlDatabase = {
    'b2xVn2': 'http://www.lighthouselabs.ca',
    '9sm5xK': 'http://www.google.com',
};

//user database
const userDatabase = {

};

createUser = (email, password) => {
    
    const userId = generateRandomString();
    
    const newUser = {
        id: userId,
        email,
        password
    };

    userDatabase[userId] = newUser;

    return userId;
};

//**UNNNECESSARY(Practice); Example of sequential userId generator function
// createUser = (email, password) {
    
//     const userId = Object.keys(userDatabase).length++;
    
//     const newUser = {
//     id: userId,
//     email,
//     password
//     };

//     userDatabase[userId] = newUser;

//     return userId;
// };


//get handlers 
app.get('/urls', (req, res) => {
    let templateVars = { 
        urls: urlDatabase, 
        username: req.cookies['username']};
    res.render('urls_index', templateVars);
});

//This renders the new page
app.get('/urls/new', (req, res) => {
    let templateVars = {
        username: req.cookies['username']}
    res.render('urls_new', templateVars);
});

//This renders the show page
app.get('/urls/:shortURL/', (req, res) => {
    let templateVars = { 
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL], 
        username: req.cookies['username']};
    res.render('urls_show', templateVars);
});

//This redirects to the longURL
app.get('/u/:shortURL', (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

//This displays the registration form; registration.ejs
app.get('/register', (req, res) => {
    res.render('registration', { username: null });
});

//This creates new users in user database and sets cookies
app.post('/register', (req, res) => {
    const {email, password } = req.body;
    const userId = createUser(email, password);
    
    res.cookie('user_id', userId);
    // req.session.user_id = userId;
    console.log(userDatabase);
    res.redirect('/urls');
});



//This generates short URL for an entered longURL and redirects to the urls/ page
app.post('/urls', (req, res) => {
    let shortUrlKey = generateRandomString();
    let longURL = req.body.longURL; 
    urlDatabase[shortUrlKey] = longURL; 
    res.redirect(`/urls/${shortUrlKey}`);      
}); 
    
//This updates a longURL; allows user to edit longURL
app.post('/urls/:shortURL', (req, res) => {
    var formContent = req.body.longURL;
    var shortURL = req.params.shortURL;
    urlDatabase[shortURL] = formContent; 
    res.redirect('/urls');
}); 

//This logs my user in
app.post('/login', (req, res) => {
    let username = req.body.username;
    res.cookie('username', username);
    res.redirect('/urls');
})


//This deletes a URL (short and long)
app.post('/urls/:shortURL/delete', (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
});

//This logs out the user
app.post('/logout', (req, res) => {
    let username = req.body.username;
    res.clearCookie('username');
    res.redirect('/urls');
})
//This shows me that my app is listening
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});