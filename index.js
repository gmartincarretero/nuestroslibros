import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "fairly-social-owlet.data-1.use1.tembo.io",
  database: "libros",
  password: "yR9UXgzbxCVdA2k2",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
    { id: 1, title: "El color de la magia", author: "Terry Pratchett", isbn: 9788497596794 },
    { id: 2, title: "Imágenes en acción", author: "Terry Pratchett", isbn: 9788497597630 },
  ];

let autores = "";

let titulos = "";

app.get("/", async (req, res) => {
    try {
      const autores_query = await db.query("SELECT DISTINCT author FROM libros ORDER BY author ASC")
      autores = autores_query.rows;
      const titulos_query = await db.query("SELECT DISTINCT title FROM libros ORDER BY title ASC")
      titulos = titulos_query.rows;
      const result = await db.query("SELECT * FROM libros ORDER BY author ASC");
      items = result.rows;
      res.render("index.ejs", {
        listItems: items,
        select_autor: autores,
        select_titulos: titulos,
      });
    } catch (err) {
      console.log(err);
    }
  });

  app.post("/filter", async (req, res) => {
    try {
      // Fetch unique authors and titles from the database
      const autores_query = await db.query("SELECT DISTINCT author FROM libros ORDER BY author ASC");
      const autores = autores_query.rows;
      
      const titulos_query = await db.query("SELECT DISTINCT title FROM libros ORDER BY title ASC");
      const titulos = titulos_query.rows;
  
      // Initialize items to an empty array
      let items = [];
  
      // Perform filtering based on selected criteria
      if (req.body.autores && req.body.titulos === "Filtrar por título" && req.body.propietario === "Filtrar por propietario") {
        const result = await db.query("SELECT * FROM libros WHERE author = $1 ORDER BY author ASC", [req.body.autores]);
        items = result.rows;
      } else if (req.body.autores === "Filtrar por autor" && req.body.titulos && req.body.propietario === "Filtrar por propietario") {
        const result = await db.query("SELECT * FROM libros WHERE title = $1 ORDER BY title ASC", [req.body.titulos]);
        items = result.rows;        
      } else if (req.body.autores === "Filtrar por autor" && req.body.titulos === "Filtrar por título" && req.body.propietario) {
        const result = await db.query("SELECT * FROM libros WHERE owner = $1 ORDER BY owner ASC", [req.body.propietario]);
        items = result.rows;          
      }
  
      // Render the results along with the select options
      res.render("index.ejs", {
        listItems: items,
        select_autor: autores,
        select_titulos: titulos,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  });

  app.post("/search", async (req, res) =>{
    try {
        // Fetch unique authors and titles from the database
        const autores_query = await db.query("SELECT DISTINCT author FROM libros ORDER BY author ASC");
        const autores = autores_query.rows;
        
        const titulos_query = await db.query("SELECT DISTINCT title FROM libros ORDER BY title ASC");
        const titulos = titulos_query.rows;
    
        // Initialize items to an empty array
        let items = [];
    
        // Perform filtering based on selected criteria
        console.log(req.body.buscador)
        if (req.body.buscador) {
            const searchTerm = '%' + req.body.buscador + '%';
        
            const result = await db.query(
                "SELECT * FROM libros WHERE ts @@ to_tsquery('spanish', $1) ORDER BY author ASC;",
                [searchTerm]
            );
            items = result.rows;
        }
        // Render the results along with the select options
        res.render("index.ejs", {
          listItems: items,
          select_autor: autores,
          select_titulos: titulos,
        });
      } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      }
    });
  
  app.post("/add", async (req, res) => {
    const new_author = req.body.newAuthor;
    const new_title = req.body.newTitle;
    const new_isbn = req.body.newISBN;
    const new_owner = req.body.newOwner;
    try {
      await db.query("INSERT INTO libros (author, title, isbn, owner) VALUES ($1, $2, $3)", [new_author, new_title, new_isbn, new_owner]);
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  });
  
  app.get("/add", (req, res) => {
    res.render("add.ejs");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});