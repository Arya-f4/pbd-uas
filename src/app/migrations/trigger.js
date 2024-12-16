const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'penjualan',
  multipleStatements: true  // Enable multiple statements
});

const query = `
-- Trigger for updating stock after a sale
CREATE TRIGGER IF NOT EXISTS after_detail_penjualan_insert
AFTER INSERT ON detail_penjualan
FOR EACH ROW
BEGIN
    DECLARE last_stock INT;

    -- Get the last stock value, default to 0 if no record exists
    SELECT COALESCE(stock, 0) INTO last_stock 
    FROM kartu_stok 
    WHERE idbarang = NEW.idbarang 
    ORDER BY idkartu_stok DESC 
    LIMIT 1;

    -- Insert a new entry into kartu_stok
    INSERT INTO kartu_stok (jenis_transaksi, keluar, stock, created_at, idtransaksi, idbarang)
    VALUES ('K', NEW.jumlah, last_stock - NEW.jumlah, NOW(), NEW.penjualan_idpenjualan, NEW.idbarang);

  
END;

DELIMITER //

CREATE TRIGGER after_detail_retur_insert
AFTER INSERT ON detail_retur
FOR EACH ROW
BEGIN
    DECLARE v_idbarang INT;
    DECLARE last_stock INT DEFAULT 0;

    -- Get the idbarang from detail_penerimaan
    SELECT dp.barang_idbarang INTO v_idbarang
    FROM detail_penerimaan dp
    WHERE dp.iddetail_penerimaan = NEW.iddetail_penerimaan;

    -- Get the last stock value, default to 0 if no record exists
    SELECT COALESCE(stock, 0) INTO last_stock 
    FROM kartu_stok 
    WHERE idbarang = v_idbarang
    ORDER BY idkartu_stok DESC 
    LIMIT 1;

    -- Insert a new entry into kartu_stok
    INSERT INTO kartu_stok (jenis_transaksi, masuk, stock, created_at, idtransaksi, idbarang)
    VALUES ('M', NEW.jumlah, last_stock + NEW.jumlah, NOW(), NEW.iddetail_retur, v_idbarang);

    -- Update the stock in barang table if needed
    -- UPDATE barang SET stock = stock + NEW.jumlah WHERE idbarang = v_idbarang;
END;
//

DELIMITER ;

-- Trigger for updating stock after a receipt
DELIMITER //
CREATE TRIGGER after_detail_penerimaan_insert
AFTER INSERT ON detail_penerimaan
FOR EACH ROW
BEGIN
    DECLARE last_stock INT DEFAULT 0;

    -- Get the last stock value, default to 0 if no record exists
    SELECT COALESCE(stock, 0) INTO last_stock 
    FROM kartu_stok 
    WHERE idbarang = NEW.barang_idbarang 
    ORDER BY idkartu_stok DESC 
    LIMIT 1;

    -- Insert a new entry into kartu_stok
    INSERT INTO kartu_stok (jenis_transaksi, masuk, stock, created_at, idtransaksi, idbarang)
    VALUES ('M', NEW.jumlah_terima, last_stock + NEW.jumlah_terima, NOW(), NEW.idpenerimaan, NEW.barang_idbarang);

    -- Update the stock in barang table
    -- Add your update statement here if needed
END;
//
DELIMITER ;
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
