const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'penjualan',
  multipleStatements: true  // Enable multiple statements
});

const query = `

CREATE FUNCTION margin_persen(p_id_margin_penjualan INT)
	RETURNS DOUBLE
DETERMINISTIC
BEGIN
	DECLARE result DOUBLE;
	-- Memilih persen value untuk id yang diberikan
	SELECT persen
	INTO result
	FROM margin_penjualan
	WHERE id_margin_penjualan = p_id_margin_penjualan AND status =1;

	RETURN result;
END

`;

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id', connection.threadId);

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error creating tables:', error.stack);
    } else {
      console.log('Function created successfully.');
    }
    connection.end();  
  });
});
