import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import fs from "fs";
import url from "url";

const app = express();
const port = 3000;

const config = {
    user: "avnadmin",
    password: "AVNS_hnHbtO_-ARD0zCK4j7O",
    host: "dblibros-nuestroslibros.l.aivencloud.com",
    port: 24170,
    database: "postgres",
    ssl: {
        rejectUnauthorized: true,
        ca: `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUOEr7aiGf6LL4PLWSO1Y8r5KYE4AwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvMDczZWMzMWMtNWZmOC00ZjQyLWE1OTYtOTFiNTkyZjRl
YmExIFByb2plY3QgQ0EwHhcNMjUwMTI3MTU1OTUyWhcNMzUwMTI1MTU1OTUyWjA6
MTgwNgYDVQQDDC8wNzNlYzMxYy01ZmY4LTRmNDItYTU5Ni05MWI1OTJmNGViYTEg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAJAqCmue
lJGl/wABRbNKDhtrn6z6cocCC9NjZ7dMM35ZMkgA7Bw/TJno8YrSrQWRqDdBj8g3
spgPkq3CmMBZKAn4GVI4m2pigDnzMcycSirZ9hgd2M938AFZ5yRIYM6wEYkxjjQS
UpEwgSkZvnE9nQKcYOOf/PvdSXrIDjmxRcfFYL6IJhJytiVuTE5iT6rgZrYvODxI
kHcNKXOSYVHvXOOdI/OIYa+9xjuen7VmpS9VNVv1rq5PgeO8moONVxngVDrD0otw
cLBOlyWWQfyqFf03Cjzvgn8n7idzQzb0wKR3LBY5+R2j5Sgb5bnAhor3tcwy994f
K7x9DDTc905qzrl/7EbOlwylUo/IRLjxTqRlgamNr+fT5eBVWX4q4TzHEsl7yPQR
8jNSKUgEeig90Cu0NNQ/gm5JY/oKpEVHES61VQbCkflk68Jf67ZtLdt4cJqiXx2R
YOZp4yFLUa8RVcbzCfDBa52w5buJeV1cOxvXCC1brxwWxd7mVrcS8kWjJwIDAQAB
oz8wPTAdBgNVHQ4EFgQUrV3gc6qkq0PdjPuHpKjVvosUa8gwDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAEVlvEJAjcOAuGEH
R6kIxmea+1A//ZeepqR6j+jnpuHHeIzmHxKlB2VybaBdeVRcIpqVtxDfdF/Z5euj
cAhXMrtVTcbnE1hNUi7wZs5g32eDnMiUrlYAhJMXxGu0l+mr5+mjWH/U+vFG7EKH
fkR1eDAAWw//RPFM85Z5WOH1GsTvWQyd/U0L/36mGJb3NcpMQIZXBwHbUfxZRZrM
FrB6EGDCQ6I7m59MZAxnSA6FfUQb91sBvJP2Vzu5DwMIGtoH8DlD75lJYRWu9YMW
KrzvI74wNmyhgaZwCX/0nkz0XbeqOkK3972NRKa2RKTBNRH9PvS/LlNtFqGYD6dz
H3WiENmPgTylEuvBg0ZooRGWHoV3rNS61Tew+ENfDoGf4D29aCDc1MIZtM+2codT
c0FbfG26Od95hRiRz+ev9I9KNVOO2DQl1/rL1ZODXucajLst1Dnq/4MH3konIYEC
pBlnDmlvvLD4bTLZm0Wm1SkwITZXS11WlaskCorF3MEnHZRy4Q==
-----END CERTIFICATE-----`,
    },
};

const client = new pg.Client(config);
client.connect(function (err) {
    if (err)
        throw err;
    client.query("SELECT VERSION()", [], function (err, result) {
        if (err)
            throw err;

        console.log(result.rows[0].version);
        client.end(function (err) {
            if (err)
                throw err;
        });
    });
});

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