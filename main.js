const books = [];
const RENDER_EVENT = 'render-book';

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

document.addEventListener('DOMContentLoaded', function() {
	const submitForm = document.getElementById('inputBook');
	submitForm.addEventListener('submit', function(event) {
		event.preventDefault();
		addBook();	
	});

	if(isStorageExist()) {
	    loadDataFromStorage();
	}
});

function addBook() {
	const bookTitle = document.getElementById('inputBookTitle').value;
	const bookAuthor = document.getElementById('inputBookAuthor').value;
	const bookYear = document.getElementById('inputBookYear').value;
	const isCompleted = document.getElementById('inputBookIsComplete').checked;

	const generateID = generateId();
	const bookObject = generateBookObject(generateID, bookTitle, bookAuthor, bookYear, isCompleted);
	books.push(bookObject);

	document.dispatchEvent(new Event(RENDER_EVENT));

	if(isCompleted == true) {
		snackbar(`BUKU ${bookTitle} BERHASIL DITAMBAHKAN DAN MASUK RAK SELESAI DIBACA`);
	} else {
		snackbar(`BUKU ${bookTitle} BERHASIL DITAMBAHKAN DAN MASUK RAK BELUM DIBACA`);
	}
	saveData();
}

function generateId() {
	return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
	return {
		id,
		title,
		author,
		year,
		isCompleted
	}
}

document.addEventListener(RENDER_EVENT, function() {
	console.log(books);
	const uncompletedBook = document.getElementById('incompleteBookshelfList');
	uncompletedBook.innerHTML = '';

	const completedBook = document.getElementById('completeBookshelfList');
	completedBook.innerHTML = '';

	for(const bookItem of books) {
		const bookElement = makeBook(bookItem);
		if(!bookItem.isCompleted) {
			uncompletedBook.append(bookElement);	
		} else {
			completedBook.append(bookElement);
		}
	}
});

function makeBook(bookObject) {
	const textTitle = document.createElement('h3');
	textTitle.innerText = bookObject.title;

	const textAuthor = document.createElement('p');
	textAuthor.innerText = "Penulis : " + bookObject.author;

	const textYear = document.createElement('p');
	textYear.innerText = "Tahun : " + bookObject.year;

	const article = document.createElement("article");
	article.classList.add("book_item");
	article.append(textTitle, textAuthor, textYear);


	if(bookObject.isCompleted) {
		const buttonUndo = document.createElement("button");
		buttonUndo.classList.add("green");
		buttonUndo.innerText = "Belum selesai dibaca";
		buttonUndo.addEventListener('click', function() {
			undoBookFromList(bookObject.id);
		});

		const buttonDelete = document.createElement("button");
		buttonDelete.classList.add("red");
		buttonDelete.innerText = "Hapus buku";
		buttonDelete.addEventListener('click', function() {
			deleteBookFromList(bookObject.id);
		});

		const div = document.createElement("div");
		div.classList.add("action");
		div.append(buttonUndo, buttonDelete);

		article.append(div);
	} else {
		const buttonDone = document.createElement("button");
		buttonDone.classList.add("green");
		buttonDone.innerText = "Selesai dibaca";
		buttonDone.addEventListener('click', function() {
			addBookToCompleted(bookObject.id);
		});

		const buttonDelete = document.createElement("button");
		buttonDelete.classList.add("red");
		buttonDelete.innerText = "Hapus buku";
		buttonDelete.addEventListener('click', function() {
			deleteBookFromList(bookObject.id);
		});

		const div = document.createElement("div");
		div.classList.add("action");
		div.append(buttonDone, buttonDelete);

		article.append(div);
	}

	return article;
}

function findBook(bookId) {
	for(const bookItem of books) {
		if(bookItem.id === bookId) {
			return bookItem;
		}
	}
	return null;
}

function findBookIndex(bookId) {
	for(const index in books) {
		if(books[index].id === bookId) {
			return index;
		}
	}
	return -1;
}

function addBookToCompleted(bookId) {
	const bookTarget = findBook(bookId);

	if(bookTarget == null) return;

	bookTarget.isCompleted = true;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
	snackbar(`BUKU ${bookTarget.title} SELESAI DIBACA`);
}

function deleteBookFromList(bookId) {
	const bookTarget = findBookIndex(bookId);
	const bookTargets = findBook(bookId);
	const askToDelete = confirm(`Yakin Mau Hapus Buku ${bookTargets.title}?`);

	if(askToDelete) {
		if(bookTarget === -1) return;

		books.splice(bookTarget, 1);
		document.dispatchEvent(new Event(RENDER_EVENT));
		saveData();
		snackbar(`BUKU ${bookTargets.title} BERHASIL DIHAPUS`);	
	}
	
}

function undoBookFromList(bookId) {
	const bookTarget = findBook(bookId);

	if(bookTarget == null) return;

	bookTarget.isCompleted = false;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
	snackbar(`BUKU ${bookTarget.title} BELUM SELESAI DIBACA`);
}


function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}
 
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if(data !== null) {
    for(const bookObject of data) {
      books.push(bookObject);
    }
  }
 
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function snackbar(pesan) {
  var snack = document.getElementById("snackbar");
  snack.innerText = pesan;

  snack.className = "show";

  setTimeout(function(){ snack.className = snack.className.replace("show", ""); }, 3000);
}