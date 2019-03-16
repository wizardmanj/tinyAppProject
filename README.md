MY FIRST FULL APPLICATION: tinyApp
Started: March 13, 2019 -  STILL NOT FINISHED...$#!T!

Steps***

****************************************************************************************************************

NEXT STEP

Add bcrypt to the Project
Install the bcrypt node package using the following command:

npm install -E bcrypt@2.0.0
Usually we would just install bcrypt using npm install bcrypt to make sure we get the latest version. Typically that's the right thing to do, and you're welcome to try that if you're feeling curious. However, in this particular case, Lighthouse Labs has noticed that many students experience a known issue with later versions, and locking the version to 2.0.0 is the least messy solution that we've found.

Use bcrypt When Storing Passwords
When registering a user, instead of saving the password directly, we can use bcrypt.hashSync and save the resulting hash of the password like this:

const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);
Modify your registration endpoint to use bcrypt to hash the password

Use bcrypt When Checking Passwords
When we need to check if the user's password is correct (ie. when logging in), we can use bcrypt.compareSync like this:

bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword); // returns true
bcrypt.compareSync("pink-donkey-minotaur", hashedPassword); // returns false
Modify your login endpoint to use bcrypt to check the password.

Do not reuse bcrypt.hashSync when checking if the password's match, ie. do not do the following:

if(bcrypt.hashSync("purple-monkey-dinosaur") === hashedPassword)) { ... }
Why won't this work?

Test the App

****************************************************************************************************************

NEXT STEP

Sessions
When the word 'session' comes up in web development, it can mean a variety of things. Here's a quick list of the different types of sessions we might see while developing a website with secure log in capabilities.

session cookies - cookies that expire after a browser is closed
user session - login/logout features on a site
user session - the event of a user using an application
session - encrypted cookies
session - abstraction that refers to user data, can be tracked in various ways:
storing data in an encrypted cookie
storing an id in an encrypted cookie w/ a session store on the server-side
Plain Text Cookies Are Not Secure
Storing identity values in plain-text in cookies is insecure because it is easy to forge HTTP requests.

Say we just registered with example.com, then we checked Chrome's developer tools and noticed that the site created a user_id cookie with the value 20125. Hmmm... what would happen if we created an HTTP request with a different value, say, 20126?

With cURL, it is trivial:

curl -X POST -i example.com --cookie "user_id=20126"
In Chrome, we can't edit the cookies by default, but, we could install the EditThisCookie extension.

Since the value in a cookie is usually used as proof that the user is who they say they are, we need a way to make sure the value cannot be manipulated.

Smart web developers have come up with a number of different strategies. The encrypted cookies strategy is the one we will use for the TinyApp project.

Strategy : Encrypted Cookies
One way to make the data in a cookie safe from tampering is to encrypt it. Instead of storing user_id=20125, we encrypt the value (using the AES cipher, and some secret key), and set the result (called the "digest") as the cookie.

When we get a cookie from a request, we reverse the process:

This is secure, because there is no practical way for the user to manipulate their own cookie to create a digest that matches some other value.

We will now upgrade the TinyApp project to use encrypted cookies.

Remember to git add, git commit and git push our work from the previous exercise!
Install the cookie-session Middleware
Replace the cookie-parser express middleware with the cookie-session middleware from:
https://github.com/expressjs/cookie-session
Update Our Cookie Code
The syntax to read and set values in cookies is different.

To set the user_id key on a session, write:

To read a value, write:

Replace every place you accessed the cookie (read or write) to use the session syntax.
Test
Check that the cookies are being encrypted. Test that everything in your app still works.

THE END!!!!!