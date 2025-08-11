// File: Library.js

import Book from "./books.js";

class Library {
  constructor(libraryName) {
    this.name =
      libraryName || "The Community Digital Library";
    this.books = [];
    this.storageKey = "myAwesomeLibraryBooks";
  }

  // --- NEW: Search Method ---

  /**
   * Filters the library's books based on a query string.
   * The search is case-insensitive and checks title, author, and ISBN.
   * @param {string} query - The search term.
   * @returns {Book[]} A new array containing only the books that match the query.
   */
  searchBooks(query) {
    const lowerCaseQuery = query.toLowerCase().trim();
    if (!lowerCaseQuery) {
      // If query is empty, return all books
      return this.books;
    }

    const results = this.books.filter((book) => {
      const titleMatch = book.title
        .toLowerCase()
        .includes(lowerCaseQuery);
      const authorMatch = book.author
        .toLowerCase()
        .includes(lowerCaseQuery);
      const isbnMatch = book.isbn
        .toLowerCase()
        .includes(lowerCaseQuery);
      const genreMatch = book.genre
        .toLowerCase()
        .includes(lowerCaseQuery);

      return (
        titleMatch || authorMatch || isbnMatch || genreMatch
      );
    });

    return results;
  }

  // --- Existing Methods (no changes needed) ---

  saveToLocalStorage() {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.books)
    );
  }

  loadFromLocalStorage() {
    const savedBooks = localStorage.getItem(
      this.storageKey
    );
    if (savedBooks) {
      const plainBookObjects = JSON.parse(savedBooks);
      this.books = plainBookObjects.map((bookData) => {
        const book = new Book(
          bookData.title,
          bookData.author,
          bookData.isbn,
          bookData.publicationYear,
          bookData.genre,
          bookData.quantity
        );
        book.borrowedCopies = bookData.borrowedCopies || 0;
        return book;
      });
    }
  }

  addBook(bookObject) {
    if (!(bookObject instanceof Book)) {
      return {
        success: false,
        message:
          "Invalid item: cannot add this to the library.",
      };
    }
    const existingBook = this.findBookByISBN(
      bookObject.isbn
    );
    if (existingBook) {
      existingBook.quantity += bookObject.quantity;
      this.saveToLocalStorage();
      return {
        success: true,
        updated: true,
        book: existingBook,
      };
    } else {
      this.books.push(bookObject);
      this.saveToLocalStorage();
      return {
        success: true,
        updated: false,
        book: bookObject,
      };
    }
  }

  findBookByISBN(isbn) {
    return (
      this.books.find((book) => book.isbn === isbn) || null
    );
  }

  deleteBookByISBN(isbn) {
    const bookIndex = this.books.findIndex(
      (book) => book.isbn === isbn
    );
    if (bookIndex > -1) {
      const deletedBookTitle = this.books[bookIndex].title;
      this.books.splice(bookIndex, 1);
      this.saveToLocalStorage();
      return { success: true, title: deletedBookTitle };
    }
    return { success: false };
  }

  borrowBookByISBN(isbn) {
    const book = this.findBookByISBN(isbn);
    if (book && book.borrowCopy()) {
      this.saveToLocalStorage();
      return { success: true, title: book.title };
    }
    return {
      success: false,
      title: book ? book.title : "",
    };
  }

  returnBookByISBN(isbn) {
    const book = this.findBookByISBN(isbn);
    if (book && book.returnCopy()) {
      this.saveToLocalStorage();
      return { success: true, title: book.title };
    }
    return {
      success: false,
      title: book ? book.title : "",
    };
  }
}

export default Library;
