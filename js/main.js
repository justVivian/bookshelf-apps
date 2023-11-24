const books = [];
let filtered_books = [];
const RENDER_EVENT = 'render-books';
const SEARCH_EVENT = 'search-books';
const SAVED_EVENT = 'saved-books';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        searchBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = Number(document.getElementById('inputBookYear').value);
    const isChecked = document.getElementById('inputBookIsComplete').checked;

    const generateID = generateId();
    const bookObject = generateBookObject(generateID, title, author, year, isChecked);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    showMessage("Buku baru telah disimpan");
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookshelfList');
    incompleteBookList.innerHTML = '';

    const completeBookList = document.getElementById('completeBookshelfList');
    completeBookList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = createBook(bookItem);
        if(bookItem.isComplete) {
            completeBookList.append(bookElement);
        }
        else {
            incompleteBookList.append(bookElement);
        }
    }
});

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser tidak mendukung local storage!');
        return false;
    }
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
})

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function createBook(bookObject) {
    const titleText = document.createElement('h3');
    titleText.innerText = bookObject.title;

    const authorText = document.createElement('p');
    authorText.innerText = bookObject.author;

    const yearText = document.createElement('p');
    yearText.innerText = bookObject.year;

    const bookArticle = document.createElement('div');
    bookArticle.classList.add('book_item');
    bookArticle.append(titleText, authorText, yearText);
    bookArticle.setAttribute('id', `book-${bookObject.id}`);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');

    if(bookObject.isComplete) {
        const uncompleteButton = document.createElement('button');
        uncompleteButton.classList.add('green');
        uncompleteButton.innerText = 'Belum selesai dibaca';

        uncompleteButton.addEventListener('click', function() {
            undoBookFromComplete(bookObject.id);
        });

        buttonContainer.append(uncompleteButton);
    }
    else {
        const completeButton = document.createElement('button');
        completeButton.classList.add('green');
        completeButton.innerText =  'Selesai dibaca';

        completeButton.addEventListener('click', function () {
            addBookToComplete(bookObject.id);
        });

        buttonContainer.append(completeButton);
    }

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('red');
    deleteButton.innerText = 'Hapus Buku';

    deleteButton.addEventListener('click', function() {
        deleteBook(bookObject.id);
    });

    buttonContainer.append(deleteButton);
    bookArticle.append(buttonContainer);

    return bookArticle;
}

function addBookToComplete(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    showMessage("Data buku diperbarui");
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function undoBookFromComplete(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    showMessage("Data buku diperbarui");
}

function deleteBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    if(confirm("Anda yakin menghapus buku?")) {
        books.splice(bookTarget, 1);
        showMessage("Buku dihapus");
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function searchBook() {
    const bookTitle = document.getElementById('searchBookTitle').value;

    filtered_books = books.filter((book) => book.title.toLowerCase().includes(bookTitle.toLowerCase()));

    document.dispatchEvent(new Event(SEARCH_EVENT));
}

document.addEventListener(SEARCH_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookshelfList');
    incompleteBookList.innerHTML = '';

    const completeBookList = document.getElementById('completeBookshelfList');
    completeBookList.innerHTML = '';

    for (const bookItem of filtered_books) {
        const bookElement = createBook(bookItem);
        if(bookItem.isComplete) {
            completeBookList.append(bookElement);
        }
        else {
            incompleteBookList.append(bookElement);
        }
    }
});

// referensi dari: https://www.w3schools.com/howto/howto_js_snackbar.asp
function showMessage(message) {
    const show_message = document.getElementById('toast');
    show_message.classList.add('show');
    show_message.innerText = message;

    setTimeout(function() {
        show_message.className = show_message.className.replace("show", "");
    }, 3000);
}