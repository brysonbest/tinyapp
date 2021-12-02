//generates a random alphanumeric string of 6 characters
const generateRandomString = function() {
  let randSt = "";
  let characterBase = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    randSt += characterBase[((Math.round(Math.random() * (characterBase.length - 1))))];
  }
  return randSt;
};

//finds the user using the userID
const findUser = function(userID, userbase) {
  if (userbase[userID]) {
    return userbase[userID];
  }
};

//finds the user using the given email address/username
const findEmail = function(username, userbase) {
  for (const user in userbase) {
    if (userbase[user]['email'] === username) {
      return userbase[user];//[user]['email'];
    }
  }
};

//identifies the urls that are connected to a specific userID
const urlsForUser = function(id, database) {
  let userUrls = {};
  for (let url in database) {
    if (database[url]['userID'] === id) {
      userUrls[url] = database[url];
    }
  }
  return userUrls;
};

module.exports = {generateRandomString, findUser, findEmail, urlsForUser};