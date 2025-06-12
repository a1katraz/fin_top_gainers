// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mysql = require('mysql');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Type } = require('@google/genai');
const cors = require('cors');

const app = express();
const port = 3010;

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "defaultdb"
});

console.log(con.config);

app.use(express.json());
app.use(cors());

app.post('/save', (req, res) => {
    const data = req.body.data;

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid data format. Expected an array." });
    }

    // Clear the history before processing new data
    history = [];

    // Process each item in the data array
    data.forEach(item => {
        if (item.title && typeof item.title === 'string') {
            history.push({ role: 'user', parts: [{ text: item.title }] });
        } else {
            console.warn("Invalid item in data:", item);
        }
    });

    res.json({ message: "Data uploaded successfully." });
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "INSERT INTO top_gainers (perf_date, site, stock_name, link, end_price, change_price, pct_change) VALUES ?";
  var values = [
    ['2025-06-11', 'Mint', 'Neuland Labs', 'Haha', 13360.00, 956.00, 0.754]
  ];
  con.query(sql, [values], function (err, result) {
    if (err) throw err;
    console.log("Number of records inserted: " + result.affectedRows);
  });
});