const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).json({
    message: "Successfully processed the request",
    data: books,
  });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const { isbn } = req.params;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json({
    message: "Successfully processed the request",
    data: book,
  });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const { author } = req.params;

  const filteredBooks = Object.values(books).filter(
    (book) => book.author === author
  );

  console.log("filterd: ", filteredBooks);

  if (!filteredBooks || filteredBooks.length == 0) {
    return res.status(404).json({ message: "No Books found" });
  }

  return res.status(200).json({
    message: "Successfully processed the request",
    data: filteredBooks,
  });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const titleToFilter = req.params.title;
  const filteredBooks = Object.values(books).filter(
    (book) => book.title === titleToFilter
  );

  if (filteredBooks.length === 0) {
    return res
      .status(404)
      .json({ message: "No books found with the specified title" });
  }

  return res.status(200).json({
    message: "Successfully processed the request",
    data: filteredBooks,
  });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbnToFilter = req.params.isbn;

  // Check if any book matches the given ISBN
  const matchingBook = Object.values(books).find(
    (book) => book.reviews[isbnToFilter]
  );

  if (!matchingBook) {
    return res
      .status(404)
      .json({ message: "No book found with the specified ISBN" });
  }

  return res.status(200).json({
    message: "Successfully processed the request",
    data: matchingBook,
  });
});

module.exports.general = public_users;
