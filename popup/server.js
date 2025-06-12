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

//console.log(con.config);

app.use(express.json());
app.use(cors());

app.post('/save', (req, res) => {
    const data = req.body.data;

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid data format. Expected an array." });
    }

    // Process each item in the data array
    const values = data.map(item => `(
        '${item.date}',
        '${item.site}',
        '${item.stock_name}',
        '${item.link}',
        ${item.end_price},
        ${item.change_price},
        ${item.pct_change}
      )`).join(',');

    let sql = `INSERT INTO top_gainers (perf_date, site, stock_name, link, end_price, change_price, pct_change) VALUES ${values};`;

    con.query(sql, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: "Database insertion error." });
        }
        console.log('Data inserted successfully:', result);
    });
    
    
    /*
    data.forEach(item => {
        console.log('Processing item:', item);
        con.query(
            'INSERT INTO top_gainers (perf_date, site, stock_name, link, end_price, change_price, pct_change) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [item.date, item.site, item.stock_name, item.link, item.end_price, item.change_price, item.pct_change],
            (err, result) => {
                if (err) {
                    console.error('Error inserting data:', err);
                } else {
                    console.log('Data inserted successfully:', result);
                }
            }
        );
    });
    */

    res.json({ message: "Data uploaded successfully." });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Database connection status: ${con.state}`);
});
/*
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

*/