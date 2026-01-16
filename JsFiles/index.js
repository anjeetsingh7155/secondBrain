"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dns = require("dns");
const express = require("express");
const app = express();
const cors = require('cors');
const port = 5000;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const dbUrl = process.env.databaseURL;
//this for connecting Database
const databaseConnection = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(dbUrl).then(resolve).catch(reject);
    });
};
databaseConnection().then((e) => {
    console.log("dataBase is Connected");
}).catch((e) => {
    console.log(`an error occured ${e}`);
});
//some inportant middlewares
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send("This route is made using typescript");
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map