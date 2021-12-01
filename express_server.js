const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');


const app = express();
const PORT = 8080; //default port

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com"
};

const users = {
  // "userRandomID": {
  //   id: "userRandomID",
  //   email: "user@example.com",
  //   password: "purple-monkey-dinosaur"
  // },
  // "user2RandomID": {
  //   id: "user2RandomID",
  //   email: "user2@example.com",
  //   password: "dishwasher-funk"
  // }
};

const generateRandomString = function() {
  let randSt = "";
  let characterBase = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    randSt += characterBase[((Math.round(Math.random() * (characterBase.length - 1))))];
  }
  return randSt;
};

//finds the user using the userID
const findUser = function(userID) {
  if (users[userID]) {
    return users[userID];
  }
};

//finds the user using the given email address/username
const findEmail = function(username) {
  for (const user in users) {
    if (users[user]['email'] === username) {
      return users[user];//[user]['email'];
    }
  }
};

//identifies the urls that are connected to a specific userID
const urlsForUser = function(id) {
  let userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]['userID'] === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const userUrls = urlsForUser(req.cookies['user_id']);
  const templateVars = { urls: userUrls, username: (findUser(req.cookies['user_id']))};
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: (findUser(req.cookies['user_id']))};
  if (!templateVars['username']) {
    res.redirect('/urls');
    return;
  }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {username: (findUser(req.cookies['user_id']))};
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {username: (findUser(req.cookies['user_id']))};
  res.render("login.ejs", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  if (!req.cookies['user_id']) {
    res.status(401).send('Error 401 - Please Login');
    return;
  }
  if (urlDatabase[req.params.shortURL]['userID'] !== req.cookies['user_id']) {
    res.status(401).send('Error 401 - Incorrect user profile.');
    return;
  }
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  const templateVars = { username: (findUser(req.cookies['user_id'])), shortURL: req.params.shortURL, longURL: `${longURL}`};
  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
    return;
  }
  res.status(404).send('Error 404');
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(longURL);
    return;
  }
  res.status(404).send('Error 404');
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
  urlDatabase[newShort] = {longURL: req.body.longURL, userID: req.cookies['user_id']};
  res.redirect(`/urls/${newShort}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL]['userID'] !== req.cookies['user_id']) {
    res.status(401).send('Invalid User.');
    return;
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/", (req, res) => {
  if (urlDatabase[req.params.shortURL]['userID'] !== req.cookies['user_id']) {
    res.status(401).send('Invalid User.');
    return;
  }
  urlDatabase[req.params.shortURL]['longURL'] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body.email;
  const password = req.body.password;
  const userPass = findEmail(username)['password'];
  if (!findEmail(username)) {
    res.status(403).send("Error 403 - User not found");
    return;
  }
  if (!bcrypt.compareSync(password, userPass)) {
    res.status(403).send("Error 403 - Password does not match.");
    return;
  }
  const userID = findEmail(username)['id'];
  // const userID = findUser(username);
  // console.log(userID);
  res.cookie('user_id', userID);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post('/register', (req, res) => {
  const username = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userID = generateRandomString();
  if (!username || !password) {
    res.status(400).send("Error 400 - Field Left Blank");
    return;
    //res.render('error', { error: err });
  }
  if (findEmail(username)) {
    res.status(400).send("Error 400 - User Email Already Exists");
    return;
  }
  users[userID] = {'id': userID, 'email': username, 'password': hashedPassword};
  res.cookie('user_id', userID);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

//Look at edge cases now
//What would happen if a client requests a non-existent shortURL?
//What happens to the urlDatabase when the server is restarted?
//What type of status code do our redirects have? What does this status code mean?