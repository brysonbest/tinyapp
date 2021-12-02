const { assert } = require('chai');

const {generateRandomString, findUser, findEmail, urlsForUser} = require('../helpers');

const testUsers = {
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

const urlDatabaseTest = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "testID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "testID2"
  }
};

describe('generateRandomString', function() {
  it('should generate a random string', function() {
    const string1 = generateRandomString();
    const string2 = generateRandomString();
    assert.notStrictEqual(string1, string2);
  });
});

describe('findUser', function() {
  it('should return a user when given a valid userID', function() {
    const user = findUser("user2RandomID", testUsers)['email'];
    const expectedOutput = "user2@example.com";
    assert.strictEqual(expectedOutput, user);
  });
  it('should return undefined for an invalid userID', function() {
    const user = findEmail("fakeUserID", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(expectedOutput, user);
  });
});

describe('findEmail', function() {
  it('should return a user with valid email', function() {
    const user = findEmail("user@example.com", testUsers)['id'];
    const expectedOutput = "userRandomID";
    assert.strictEqual(expectedOutput, user);
  });
  it('should return undefined for an invalid email', function() {
    const user = findEmail("fakeuser@example.com", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(expectedOutput, user);
  });
});

describe('urlsForUser', function() {
  it('should return the matching url object containing all matching urls if given a valid user', function() {
    const user = urlsForUser("testID", urlDatabaseTest);
    const expectedOutput = {"b2xVn2": {
      longURL: "http://www.lighthouselabs.ca",
      userID: "testID"
    }};
    assert.deepEqual(expectedOutput, user);
  });
  it('should return an empty object for an invalid user', function() {
    const user = urlsForUser("fakeTestID", urlDatabaseTest);
    const expectedOutput = {};
    assert.deepEqual(expectedOutput, user);
  });
});