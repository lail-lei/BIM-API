require("dotenv").config();
const express = require("express");
const port = 1984;

const upload = require("./middleware/upload.js")

const mongoose = require('mongoose');
// create app 
const app = express();
app.use(express.json());

// connect to db
mongoose.connect(`mongodb://${process.env.MONGO_URL}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  });

// database connection 
const db = mongoose.connection;

db.on("error", (error) => console.log(error));
db.once("open", () => upload.uploadNew());


/**  ROUTES   */
app.get("/api/echo", async (req, res) => {res.sendStatus(200)});


app.listen(port, () => console.log(`BIM listening on port ${port}`)); 