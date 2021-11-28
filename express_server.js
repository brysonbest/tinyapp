const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //default port

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const generateRandomString = function() {
  let randSt = "";
  let characterBase = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    randSt += characterBase[((Math.round(Math.random() * (characterBase.length - 1))))];
  }
  return randSt;
};

const findUser = function(user_id) {
  if (users[user_id]){
    return users[user_id];
  }
};

const findEmail = function(username) {
  for (const user in users) {
    if(users[user]['email'] === username) {
      return users[user]['email'];
    }
  }
};

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: (findUser(req.cookies['user_id']))};
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: (findUser(req.cookies['user_id']))};
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
  const templateVars = { username: r(findUser(req.cookies['user_id'])), shortURL: req.params.shortURL, longURL: `${urlDatabase[req.params.shortURL]}`};
  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  }
  res.status(404).send('Error 404');
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(longURL);
  }
  res.status(404).send('Error 404');
});

app.post("/urls", (req, res) => {
  const newShort = generateRandomString();
  urlDatabase[newShort] = req.body.longURL;
  res.redirect(`/urls/${newShort}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  // const userID = findUser(username);
  // console.log(userID);
  res.cookie('user_id', username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post('/register', (req, res) => {
  const username = req.body.email;
  const password = req.body.password;
  const userID = generateRandomString();
  if (username === "" || password === ""){
    res.status(400).send("Error 400");
    //res.render('error', { error: err }); 
  }
  if (findEmail(username)) {
    res.status(400).send("Error 400");
  }
  users[userID] = {'id': userID, 'email': username, 'password': password};
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