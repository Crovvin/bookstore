process.env.NODE_ENV = "test"
const db = require("../db");
const app = require("../app");

let booksISBN;

beforeEach(async () => {
    let output = await db.query(`
      INSERT INTO
        books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES(
          '27194013',
          'https://amazon.com/book',
          'Jon Smith',
          'English',
          340,
          'Book publisher inc.',
          'super good book title', 2016)
        RETURNING isbn`);
  
    booksISBN = output.rows[0].isbn
  });

  describe("GET /books", function () {
    test("Gets a book", async function () {
      const response = await request(app).get(`/books`);
      const books = response.body.books;
      expect(books).toHaveLength(1);
      expect(books[0]).toHaveProperty("isbn");
      expect(books[0]).toHaveProperty("amazon_url");
    });
  });
  
  describe("GET /books/:isbn", function () {
    test("Gets a book", async function () {
      const response = await request(app)
          .get(`/books/${booksISBN}`)
      expect(response.body.book).toHaveProperty("isbn");
      expect(response.body.book.isbn).toBe(booksISBN);
    });
    test("Error if book is not found", async function () {
      const response = await request(app)
          .get(`/books/103293223421`)
      expect(response.statusCode).toBe(404);
    });
  });
  
  describe("POST /books", function () {
    test("Makes a book", async function () {
      const response = await request(app)
          .post(`/books`)
          .send({
            isbn: '19475723',
            amazon_url: "https://amazon.com/book2",
            author: "Mary Jane",
            language: "English",
            pages: 329,
            publisher: "feathers",
            title: "best story ever",
            year: 1990
          });
      expect(response.statusCode).toBe(201);
      expect(response.body.book).toHaveProperty("isbn");
    });
  });
  
  describe("PUT /books/:id", function () {
    test("Updates a book", async function () {
      const response = await request(app)
          .put(`/books/${booksISBN}`)
          .send({
            amazon_url: "https://amazon.com/book2",
            author: "Mary Jane",
            language: "English",
            pages: 329,
            publisher: "feathers",
            title: "real best story ever!",
            year: 1990
          });
      expect(response.body.book).toHaveProperty("isbn");
      expect(response.body.book.title).toBe("real best story ever!");
    });
    test("Error if book is not found", async function () {
      await request(app)
          .delete(`/books/${booksISBN}`)
      const response = await request(app).delete(`/books/${booksISBN}`);
      expect(response.statusCode).toBe(404);
    });
  });
  
  describe("DELETE /books/:id", function () {
    test("Deletes a book", async function () {
      const response = await request(app)
          .delete(`/books/${booksISBN}`)
      expect(response.body).toEqual({message: "Book has been deleted"});
    });
  });

  afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
  });
  
  afterAll(async function () {
    await db.end()
  });