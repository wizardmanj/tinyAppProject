const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const uuidv1 = require('uuid/v1');
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const app = express();
const PORT = process.env.port || 8080;
//IF YOU NEED TO KILL AND RESET PORT:
// netstat -ntlp | grep :8080 (<== portnumber)
// then kill (pid #; provided from above)

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
// app.use(cookieParser())
app.use(cookieSession({
    name: 'session',
    secret: 'anystring',
    maxAge: 24 * 60 * 60 * 1000 
  }));


//used for: shortURL generator
const generateRandomString = () => Math.random().toString(36).substr(2,8);

//url database
const urlDatabase = {
    'b2xVn2': {longURL: 'http://www.lighthouselabs.ca', userId: 'g7vaj3l0'},
    '9sm5xK': {longURL: 'http://www.google.com', userId: 'g7vaj3l0'}
    };

//user database
const userDatabase = {
    "userRandomID": {
        id: "userRandomID", 
        email: "user@example.com", 
        password: bcrypt.hashSync('whatever', 10)
      },
     "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: bcrypt.hashSync('whateverelse', 10)
      }
};
//Creates a new user
const createUser = (email, password) => {
    const userId = generateRandomString();
    const newUser = {
        id: userId,
        email,
        password
    };

    userDatabase[userId] = newUser;
    return userId;
};

//Helper functions
const findUserByEmail = email => {
    for (let userId in userDatabase) {
        if (userDatabase[userId].email === email) {
            return userDatabase[userId];
        }
    }
    return false;
};

//Creates an object of user specific urls
const urlsForUser = userId => {
    let filteredURLS = {};
    for (let shortURL in urlDatabase) {
        if (userId === urlDatabase[shortURL].userId) {
            filteredURLS[shortURL] = urlDatabase[shortURL];
        };
    };
    return filteredURLS;
};

//This renders index page
app.get('/urls', (req, res) => {
    const userId = req.session.user_id;
    let templateVars = { 
        user: userDatabase[userId],
        urls: urlsForUser(userId)
    };
    if(!userId) {
        res.redirect('/login');
    } else {
        res.render('urls_index', templateVars);
    }
});

//This renders the new page
app.get('/urls/new', (req, res) => {
    const userId = req.session.user_id;
    let templateVars = {
        user:  userDatabase[userId]
    }
    if (!userId) {
        res.redirect('/login');
    } else {
    res.render('urls_new', templateVars);
    };
});

//This renders the show page
app.get('/urls/:shortURL/', (req, res) => {
    const userId = req.session.user_id;
    let urlData = urlDatabase[req.params.shortURL];
    const longURL = urlData ? urlData.longURL : null;
    let templateVars = { 
        user: userDatabase[userId],
        shortURL: req.params.shortURL, 
        longURL, 
    };
    res.render('urls_show', templateVars);
});

//This redirects to the longURL
app.get('/u/:shortURL', (req, res) => {
    const userId = req.session.user_id;
    let shortURL = req.params.shortURL;
    if (userId && urlDatabase && urlDatabase[shortURL] && userId === urlDatabase[shortURL].userId) {
        const longURL = urlDatabase[req.params.shortURL].longURL;
        res.redirect(`http://${longURL}`);
    } else {
        res.status(403).send("Nice try! You're not allowed to do that, silly!");    
    };
});

//This displays the registration form; registration.ejs
app.get('/register', (req, res) => {
    const userId = req.session.user_id;
    let templateVars = {
        user: userDatabase[userId]
    };
    res.render('registration', templateVars);
});

//This creates new users in user database and sets cookies
app.post('/register', (req, res) => {
    const {email, password } = req.body;
    if(email === '' || password === '') {
        res.status(400).send("Please enter valid information")
    } else if (findUserByEmail(email)) {
        res.status(400).send("Email already exists. Try logging in!")
    } else{
        const userId = createUser(email,password);
        req.session.user_id = userId;
    }
    res.redirect('/urls');
});

//This displays the login form; login.ejs
app.get('/login', (req, res) => {
    const userId = req.session.user_id;
    let templateVars = {
        user: userDatabase[userId]
    };
    res.render('login', templateVars);
});

//This checks in to see if user exits in user database
app.post('/login', (req, res) => {
    const {email, password } = req.body;
    const user = findUserByEmail(email);
    let hashword = bcrypt.hashSync(password, 10);
    if(!email || !password) {
        res.status(400).send("Please enter valid information")
    } else if (!user) {
        res.status(403).send('User not found!');
    } else if (bcrypt.compareSync(password, hashword))     {
        req.session.user_id = user.id;
        res.redirect('/urls');      
    } else {
        res.status(403).send("Woops! Try giving me the right password.")
    }
});

//This generates short URL for an entered longURL and redirects to the urls/ page
app.post('/urls', (req, res) => {
    const userId = req.session.user_id;
    let longURL = req.body.longURL; 
    let shortUrl = generateRandomString();
    if (userId) { 
        urlDatabase[shortUrl] = {longURL, userId}; 
        res.redirect(`/urls/${shortUrl}`);
    } else {
        res.status(400).send('No way JOSE!')
    }
}); 
    
//This updates/edits a longURL;
app.post('/urls/:shortURL', (req, res) => {
    const userId = req.session.user_id;
    let formContent = req.body.longURL;
    let shortURL = req.params.shortURL;
    if (userId && urlDatabase && urlDatabase[shortURL] && userId === urlDatabase[shortURL].userId) {
        urlDatabase[shortURL].longURL = formContent; 
        res.redirect('/urls');
    } else {
        res.status(403).send("Nice try! You're not allowed to do that, silly!");    
    };
}); 


//This deletes a URL
app.post('/urls/:shortURL/delete', (req, res) => {
    let userId = req.session.user_id;
    if (userId && urlDatabase && urlDatabase[shortURL] && userId === urlDatabase[req.params.shortURL].userId) {
        delete urlDatabase[req.params.shortURL];
        res.redirect('/urls');
    } else {
        res.status(403).send("Nice try! You're not allowed to do that, silly!");
    };
});

//This logs out the user
app.post('/logout', (req, res) => {
    req.body.user_id;
    req.session = null;
    res.redirect('/urls');
})
//This shows me that my app is listening
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});