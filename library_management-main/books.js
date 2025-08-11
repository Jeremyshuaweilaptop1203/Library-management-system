// File: Book.js

/**
 * Represents a single book.
 * This class is exported as a module.
 */
class Book {
  constructor(
    title,
    author,
    isbn,
    publicationYear,
    genre,
    quantity
  ) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.publicationYear = publicationYear
      ? String(publicationYear)
      : "N/A";
    this.genre = genre || "N/A";
    this.quantity = parseInt(quantity) || 1;
    if (this.quantity < 1) this.quantity = 1;
    this.borrowedCopies = 0;
  }

  getAvailableCopies() {
    const available = this.quantity - this.borrowedCopies;
    return available > 0 ? available : 0;
  }

  borrowCopy() {
    if (this.getAvailableCopies() > 0) {
      this.borrowedCopies++;
      return true;
    }
    return false;
  }

  returnCopy() {
    if (this.borrowedCopies > 0) {
      this.borrowedCopies--;
      return true;
    }
    return false;
  }

  getDetailsObject() {
    return {
      title: this.title,
      author: this.author,
      isbn: this.isbn,
      publicationYear: this.publicationYear,
      genre: this.genre,
      quantity: this.quantity,
      borrowedCopies: this.borrowedCopies,
      availableCopies: this.getAvailableCopies(),
    };
  }
}

// Make the Book class available to other files
export default Book;
