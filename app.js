const express = require('express');
const mysql = require('mysql');

const app = express();

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'project'
});

// Connect to MySQL
connection.connect();

// Serve HTML page for search
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/search_results.html');
});

// Handle search request
app.get('/search', (req, res) => {
  // Parse search query parameters
  const { semester, htno, grade } = req.query;

  // Construct SQL query based on search criteria
  let sql = `SELECT Htno, Subcode, Subname, Internals, Grade, Credits FROM ${getTableName(semester)}`;

  const conditions = [];
  const params = [];

  if (htno) {
    conditions.push(`Htno = ?`);
    params.push(htno);
  }

  if (grade) {
    conditions.push(`Grade = ?`);
    params.push(grade);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  // Execute SQL query
  connection.query(sql, params, (error, results, fields) => {
    if (error) {
      console.error('Error retrieving data:', error);
      res.status(500).send('Error retrieving data from database');
      return;
    }

    // Calculate grade counts
    const gradeCounts = {};
    results.forEach(result => {
      const grade = result.Grade;
      if (gradeCounts[grade]) {
        gradeCounts[grade]++;
      } else {
        gradeCounts[grade] = 1;
      }
    });

    // Send retrieved data and grade counts back to client
    res.json({ results: results, gradeCounts: gradeCounts });
  });
});

// Function to get table name based on semester
function getTableName(semester) {
  if (!semester) {
    // Default to the first semester if no semester is provided
    return 'semester_1_1';
  }
  // No need to replace underscores
  return semester;
}

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
