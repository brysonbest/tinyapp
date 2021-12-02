const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {generateRandomString, findUser, findEmail, urlsForUser} = require('./helpers');


const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));

const urlDatabase = {
};

const users = {
};

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const userUrls = urlsForUser(req.session.usrID, urlDatabase);
  const templateVars = { urls: userUrls, username: (findUser(req.session.usrID, users))};
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: (findUser(req.session.usrID, users))};
  if (!templateVars['username']) {
    return res.redirect('/urls');
  }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {username: (findUser(req.session.usrID, users))};
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {username: (findUser(req.session.usrID, users))};
  res.render("login.ejs", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    const templateVars = {username: (findUser(req.session.usrID, users)), errorCode: 'Error 404 - Page Not Found'};
    return res.status(404).render('error', templateVars);
  }
  if (!req.session.usrID) {
    const templateVars = {username: (findUser(req.session.usrID, users)), errorCode: 'Error 401 - Please Login'};
    return res.status(401).render('error', templateVars);
  }
  if (urlDatabase[req.params.shortURL]['userID'] !== req.session.usrID) {
    const templateVars = {username: (findUser(req.session.usrID, users)), errorCode: 'Error 401 - Incorrect user profile'};
    return res.status(401).render('error', templateVars);
  }
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  const templateVars = { username: (findUser(req.session.usrID, users)), shortURL: req.params.shortURL, longURL: `${longURL}`};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    const templateVars = {username: (findUser(req.session.usrID, users)), errorCode: 'Error 404 - Page not found'};
    return res.status(404).render('error', templateVars);
  }
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let newShort = generateRandomString();
  //check if there is a duplicate and re-generate if found
  let loop = () => {
    for (let url in urlDatabase) {
      if (urlDatabase[url]['id'] === newShort) {
        newShort = generateRandomString();
        loop();
      }
    }
  };
  loop();
  urlDatabase[newShort] = {longURL: req.body.longURL, userID: req.session.usrID};
  res.redirect(`/urls/${newShort}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL]['userID'] !== req.session.usrID) {
    const templateVars = {username: (findUser(req.session.usrID, users)), errorCode: 'Error 401 - Invalid User'};
    return res.status(401).render('error', templateVars);
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/", (req, res) => {
  if (urlDatabase[req.params.shortURL]['userID'] !== req.session.usrID) {
    const templateVars = {username: (findUser(req.session.usrID, users)), errorCode: 'Error 401 - Invalid User'};
    return res.status(401).render('error', templateVars);
  }
  urlDatabase[req.params.shortURL]['longURL'] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body.email;
  const password = req.body.password;
  const userPass = findEmail(username, users)['password'];
  if (!findEmail(username, users)) {
    const templateVars = {username: (findUser(req.session.usrID, users)), errorCode: 'Error 403 - User Not Found'};
    return res.status(403).render('error', templateVars);
  }
  if (!bcrypt.compareSync(password, userPass)) {
    const templateVars = {username: (findUser(req.session.usrID, users)), errorCode: 'Error 403 - Password Does Not Match'};
    return res.status(403).render('error', templateVars);
  }
  const userID = findEmail(username, users)['id'];
  req.session.usrID = userID;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post('/register', (req, res) => {
  const username = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userID = generateRandomString();
  if (!username || !password) {
    const templateVars = {username: (findUser(req.session.usrID, users)), errorCode: 'Error 400 - Field Left Blank'};
    return res.status(400).render('error', templateVars);
  }
  if (findEmail(username, users)) {
    const templateVars = {username: (findUser(req.session.usrID, users)), errorCode: 'Error 400 - User Email Already Exists'};
    return res.status(400).render('error', templateVars);
  }
  users[userID] = {'id': userID, 'email': username, 'password': hashedPassword};
  req.session.usrID = userID;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});