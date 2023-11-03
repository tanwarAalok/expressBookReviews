const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
let bookReviews = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const review = req.query.review;
  const username = req.user;

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Check if a review for the given ISBN already exists for the user
  if (bookReviews[isbn] && bookReviews[isbn][username]) {
    // Modify the existing review
    bookReviews[isbn][username] = review;
    return res.status(200).json({ message: "Review modified successfully" });
  } else {
    // If no review exists for the user on the given ISBN, create a new review
    if (!bookReviews[isbn]) {
      bookReviews[isbn] = {};
    }
    bookReviews[isbn][username] = review;
    return res.status(201).json({ message: "Review added successfully" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.user;

  if (!bookReviews[isbn] || !bookReviews[isbn][username]) {
    return res
      .status(404)
      .json({ message: "Review not found for the specified ISBN" });
  }

  // Delete the review for the specified ISBN and username
  delete bookReviews[isbn][username];

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
