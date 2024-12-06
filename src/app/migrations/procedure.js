const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'penjualan',
  multipleStatements: true  // Enable multiple statements
});

const query = `
CREATE PROCEDURE InsertPenerimaan(
  IN p_status CHAR(1),
  IN p_idpengadaan BIGINT,
  IN p_iduser INT
)
BEGIN
  INSERT INTO penerimaan (status, idpengadaan, iduser, created_at)
  VALUES (p_status, p_idpengadaan, p_iduser, NOW());
  
  SELECT LAST_INSERT_ID() AS idpenerimaan;
END;

CREATE PROCEDURE UpdatePenerimaan(
  IN p_idpenerimaan BIGINT,
  IN p_status CHAR(1),
  IN p_idpengadaan BIGINT,
  IN p_iduser INT
)
BEGIN
  UPDATE penerimaan
  SET status = p_status,
      idpengadaan = p_idpengadaan,
      iduser = p_iduser
  WHERE idpenerimaan = p_idpenerimaan;
END;

CREATE PROCEDURE DeletePenerimaan(
  IN p_idpenerimaan BIGINT
)
BEGIN
  DELETE FROM penerimaan
  WHERE idpenerimaan = p_idpenerimaan;
END;
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
      console.log('Triggers created successfully.');
    }
    connection.end();  
  });
});
