// File: script.js

import Book from "./books.js";
import Library from "./library.js";

document.addEventListener("DOMContentLoaded", () => {
  // --- DIALOG (MODAL) LOGIC ---
  const notificationDialog = document.getElementById(
    "notificationDialog"
  );
  const dialogTitleElement =
    document.getElementById("dialogTitle");
  const dialogMessageElement =
    document.getElementById("dialogMessage");

  function showModal(title, message) {
    if (!notificationDialog) return;
    if (dialogTitleElement)
      dialogTitleElement.textContent = title;
    if (dialogMessageElement)
      dialogMessageElement.textContent = message;
    if (notificationDialog.hasAttribute("open"))
      notificationDialog.close();
    notificationDialog.showModal();
  }

  // --- VIEW / RENDER LOGIC ---
  function renderBooksToPage(booksToRender) {
    const booksListElement =
      document.getElementById("books-list");
    if (!booksListElement) return;
    booksListElement.innerHTML = "";

    if (booksToRender.length === 0) {
      booksListElement.innerHTML =
        '<p class="placeholder-text">No books found matching your criteria.</p>';
      return;
    }

    booksToRender.forEach((book) => {
      const bookItemElement = document.createElement("div");
      bookItemElement.classList.add("book-item");
      const availableCopies = book.getAvailableCopies();
      bookItemElement.innerHTML = `
                <div>
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${
                  book.author
                }</p>
                <p><strong>ISBN:</strong> ${book.isbn}</p>
                <p><strong>Year:</strong> ${
                  book.publicationYear
                }</p>
                <p><strong>Genre:</strong> ${book.genre}</p>
                <p><strong>Total Quantity:</strong> ${
                  book.quantity
                }</p>
                <p><strong>Borrowed:</strong> ${
                  book.borrowedCopies
                }</p>
                <p><strong>Available:</strong> ${availableCopies}</p>
                <div class="actions">
                    <button class="btn btn-borrow" data-isbn="${
                      book.isbn
                    }" ${
        availableCopies === 0 ? "disabled" : ""
      }>Borrow</button>
                    <button class="btn btn-return" data-isbn="${
                      book.isbn
                    }" ${
        book.borrowedCopies === 0 ? "disabled" : ""
      }>Return</button>
                    <button class="btn btn-delete" data-isbn="${
                      book.isbn
                    }">Delete</button>
                </div>
                </div>
                
            `;
      booksListElement.appendChild(bookItemElement);
    });
  }

  // --- INITIALIZE LIBRARY & SETUP ---
  const myCityLibrary = new Library(
    "City Central Digital Library"
  );
  myCityLibrary.loadFromLocalStorage(); // Load any saved books
  renderBooksToPage(myCityLibrary.books); // Initial render will show loaded books

  // --- EVENT LISTENERS ---
  const addBookForm =
    document.getElementById("add-book-form");
  const booksListElement =
    document.getElementById("books-list");
  const searchButton =
    document.getElementById("search-button"); // Get search button
  const searchQueryInput =
    document.getElementById("search-query"); // Get search input field

  // Add book form listener
  if (addBookForm) {
    addBookForm.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const title = document
          .getElementById("title")
          .value.trim();
        const author = document
          .getElementById("author")
          .value.trim();
        const isbn = document
          .getElementById("isbn")
          .value.trim();
        const publicationYear = document
          .getElementById("publicationYear")
          .value.trim();
        const genre = document
          .getElementById("genre")
          .value.trim();
        const quantityInput =
          document.getElementById("quantity").value;

        if (!title || !author || !isbn) {
          showModal(
            "Input Error",
            "Please ensure Title, Author, and ISBN are filled out."
          );
          return;
        }
        const quantity = parseInt(quantityInput);
        if (isNaN(quantity) || quantity < 1) {
          showModal(
            "Input Error",
            "Quantity must be a valid number and at least 1."
          );
          return;
        }

        const newBook = new Book(
          title,
          author,
          isbn,
          publicationYear,
          genre,
          quantity
        );
        const result = myCityLibrary.addBook(newBook);

        if (result.success) {
          if (result.updated) {
            showModal(
              "Book Updated",
              `Quantity for "${result.book.title}" increased. New total: ${result.book.quantity}.`
            );
          } else {
            showModal(
              "Book Added!",
              `"${result.book.title}" has been successfully added.`
            );
          }
        } else {
          showModal("Error", result.message);
        }

        renderBooksToPage(myCityLibrary.books); // Re-render the full list
        addBookForm.reset();
        document.getElementById("title").focus();
      }
    );
  }

  // Action buttons listener (borrow, return, delete)
  if (booksListElement) {
    booksListElement.addEventListener("click", (event) => {
      const targetButton = event.target;
      const isbn = targetButton.dataset.isbn;
      if (!isbn) return;

      if (targetButton.classList.contains("btn-borrow")) {
        const result = myCityLibrary.borrowBookByISBN(isbn);
        if (result.success) {
          showModal(
            "Book Borrowed",
            `One copy of "${result.title}" has been borrowed.`
          );
        } else {
          showModal(
            "Unavailable",
            `Sorry, no more copies of "${result.title}" are available.`
          );
        }
        renderBooksToPage(myCityLibrary.books);
      } else if (
        targetButton.classList.contains("btn-return")
      ) {
        const result = myCityLibrary.returnBookByISBN(isbn);
        if (result.success) {
          showModal(
            "Book Returned",
            `One copy of "${result.title}" has been returned.`
          );
        } else {
          showModal(
            "Error",
            `No copies of "${result.title}" were recorded as borrowed.`
          );
        }
        renderBooksToPage(myCityLibrary.books);
      } else if (
        targetButton.classList.contains("btn-delete")
      ) {
        const result = myCityLibrary.deleteBookByISBN(isbn);
        if (result.success) {
          showModal(
            "Book Deleted",
            `"${result.title}" has been removed from the library.`
          );
        }
        renderBooksToPage(myCityLibrary.books);
      }
    });
  }

  // --- NEW: Search Event Listeners ---

  function handleSearch() {
    const query = searchQueryInput.value;
    const searchResults = myCityLibrary.searchBooks(query);
    renderBooksToPage(searchResults);
  }

  if (searchButton && searchQueryInput) {
    // Search when the button is clicked
    searchButton.addEventListener("click", handleSearch);

    // Also search when the user types and hits 'Enter'
    searchQueryInput.addEventListener(
      "keypress",
      (event) => {
        if (event.key === "Enter") {
          handleSearch();
        }
      }
    );

    // Optional: Search in real-time as the user types
    // searchQueryInput.addEventListener('input', handleSearch);
  }
}); // End of DOMContentLoaded
