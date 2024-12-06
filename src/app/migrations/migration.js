const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'penjualan',
  multipleStatements: true  // Enable multiple statements

});

const query = `
  CREATE TABLE IF NOT EXISTS satuan (
    idsatuan INT AUTO_INCREMENT PRIMARY KEY,
    nama_satuan VARCHAR(45),
    status TINYINT
  );


  CREATE TABLE IF NOT EXISTS vendor (
    idvendor INT AUTO_INCREMENT PRIMARY KEY,
    nama_vendor VARCHAR(100),
    badan_hukum CHAR(1),
    status CHAR(1)
  );

  CREATE TABLE IF NOT EXISTS role (
    idrole INT AUTO_INCREMENT PRIMARY KEY,
    nama_role VARCHAR(100)
  );

  CREATE TABLE IF NOT EXISTS user (
    iduser INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(45),
    password VARCHAR(100),
    idrole INT,
    FOREIGN KEY (idrole) REFERENCES role(idrole)
  );

  CREATE TABLE IF NOT EXISTS barang (
    idbarang INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(45),
    idsatuan INT,
    jenis CHAR(1),
    status TINYINT,
    created_at TIMESTAMP,
    harga INT,
    FOREIGN KEY (idsatuan) REFERENCES satuan(idsatuan)
  );

  CREATE TABLE IF NOT EXISTS pengadaan (
    idpengadaan BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP,
    user_iduser INT,
    status CHAR(1),
    vendor_idvendor INT,
    subtotal_nilai INT,
    ppn INT,
    total_nilai INT,
    FOREIGN KEY (user_iduser) REFERENCES user(iduser),
    FOREIGN KEY (vendor_idvendor) REFERENCES vendor(idvendor)
  );

  CREATE TABLE IF NOT EXISTS penerimaan (
    idpenerimaan BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP,
    status CHAR(1),
    iduser INT,
    idpengadaan BIGINT,
    FOREIGN KEY (iduser) REFERENCES user(iduser),
    FOREIGN KEY (idpengadaan) REFERENCES pengadaan(idpengadaan)
  );
  CREATE TABLE IF NOT EXISTS kartu_stok (
    idkartu_stok BIGINT AUTO_INCREMENT PRIMARY KEY,
    jenis_transaksi CHAR(1),
    masuk INT,
    keluar INT,
    stock INT,
    created_at TIMESTAMP,
    idtransaksi INT,
    idbarang INT,
    FOREIGN KEY (idbarang) REFERENCES barang(idbarang)
  );

  CREATE TABLE IF NOT EXISTS detail_pengadaan (
    iddetail_pengadaan BIGINT AUTO_INCREMENT PRIMARY KEY,
    harga_satuan INT,
    jumlah INT,
    sub_total INT,
    idpengadaan BIGINT,
    idbarang INT,
    FOREIGN KEY (idpengadaan) REFERENCES pengadaan(idpengadaan),
    FOREIGN KEY (idbarang) REFERENCES barang(idbarang)
  );

  CREATE TABLE IF NOT EXISTS detail_penerimaan (
    iddetail_penerimaan BIGINT AUTO_INCREMENT PRIMARY KEY,
    idpenerimaan BIGINT,
    barang_idbarang INT,
    jumlah_terima INT,
    harga_satuan_terima INT,
    sub_total_terima INT,
    FOREIGN KEY (idpenerimaan) REFERENCES penerimaan(idpenerimaan),
    FOREIGN KEY (barang_idbarang) REFERENCES barang(idbarang)
  );

  
    CREATE TABLE IF NOT EXISTS margin_penjualan (
      idmargin_penjualan INT AUTO_INCREMENT PRIMARY KEY,
      created_at TIMESTAMP,
      persen DOUBLE,
      status TINYINT,
      iduser INT,
      updated_at TIMESTAMP,
      FOREIGN KEY (iduser) REFERENCES user(iduser) ON UPDATE CASCADE
    );
  CREATE TABLE IF NOT EXISTS penjualan (
    idpenjualan INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP,
    subtotal_nilai INT,
    ppn INT,
    total_nilai INT,
    iduser INT,
    idmargin_penjualan INT,
    FOREIGN KEY (iduser) REFERENCES user(iduser),
    FOREIGN KEY (idmargin_penjualan) REFERENCES margin_penjualan(idmargin_penjualan) ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS detail_penjualan (
    iddetail_penjualan BIGINT AUTO_INCREMENT PRIMARY KEY,
    harga_satuan INT,
    jumlah INT,
    subtotal INT,
    penjualan_idpenjualan INT,
    idbarang INT,
    FOREIGN KEY (penjualan_idpenjualan) REFERENCES penjualan(idpenjualan),
    FOREIGN KEY (idbarang) REFERENCES barang(idbarang)
  );

  CREATE TABLE IF NOT EXISTS retur (
    idretur BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP,
    idpenerimaan BIGINT,
    iduser INT,
    FOREIGN KEY (idpenerimaan) REFERENCES penerimaan(idpenerimaan),
    FOREIGN KEY (iduser) REFERENCES user(iduser)
  );

  CREATE TABLE IF NOT EXISTS detail_retur (
    iddetail_retur INT AUTO_INCREMENT PRIMARY KEY,
    jumlah INT,
    alasan VARCHAR(200),
    idbarang INT,
    iddetail_penerimaan BIGINT,
    FOREIGN KEY (idbarang) REFERENCES barang(idbarang),
    FOREIGN KEY (iddetail_penerimaan) REFERENCES detail_penerimaan(iddetail_penerimaan)
  );

CREATE VIEW view_barang AS
SELECT 
    b.idbarang,
    b.nama AS item_name,
    b.jenis AS item_type,
    s.nama_satuan AS unit_name,
    b.status
FROM 
    barang b
JOIN 
    satuan s ON b.idsatuan = s.idsatuan;


    CREATE VIEW view_vendor AS
SELECT 
    v.idvendor,
    v.nama_vendor AS vendor_name,
    v.badan_hukum AS legal_status,
    v.status
FROM 
    vendor v;
  


    CREATE VIEW view_pengadaan AS
SELECT 
    p.idpengadaan,
    p.timestamp AS procurement_date,
    u.username AS user_name,
    v.nama_vendor AS vendor_name,
    p.subtotal_nilai AS subtotal_value,
    p.ppn AS tax,
    p.total_nilai AS total_value
FROM 
    pengadaan p
JOIN 
    vendor v ON p.vendor_idvendor = v.idvendor
JOIN 
    user u ON p.user_iduser = u.iduser;




    CREATE VIEW view_detail_pengadaan AS
SELECT 
    dp.iddetail_pengadaan,
    dp.idpengadaan,
    b.nama AS item_name,
    dp.harga_satuan AS unit_price,
    dp.jumlah AS quantity,
    dp.sub_total AS sub_total
FROM 
    detail_pengadaan dp
JOIN 
    barang b ON dp.idbarang = b.idbarang;




    CREATE VIEW view_penerimaan AS
SELECT 
    pn.idpenerimaan,
    pn.created_at AS reception_date,
    pn.status,
    u.username AS received_by,
    p.idpengadaan AS procurement_id
FROM 
    penerimaan pn
JOIN 
    user u ON pn.iduser = u.iduser
JOIN 
    pengadaan p ON pn.idpengadaan = p.idpengadaan;





    CREATE VIEW view_detail_penerimaan AS
SELECT 
    dpn.iddetail_penerimaan,
    dpn.idpenerimaan,
    b.nama AS item_name,
    dpn.jumlah_terima AS quantity_received,
    dpn.harga_satuan_terima AS received_unit_price,
    dpn.sub_total_terima AS received_sub_total
FROM 
    detail_penerimaan dpn
JOIN 
    barang b ON dpn.barang_idbarang = b.idbarang;








    CREATE VIEW view_penjualan AS
SELECT 
    pj.idpenjualan,
    pj.created_at AS sale_date,
    pj.subtotal_nilai AS subtotal,
    pj.ppn AS tax,
    pj.total_nilai AS total,
    u.username AS handled_by
FROM 
    penjualan pj
JOIN 
    user u ON pj.iduser = u.iduser;



    CREATE VIEW view_detail_penjualan AS
SELECT 
    dpj.iddetail_penjualan,

    b.nama AS item_name,
    dpj.harga_satuan AS unit_price,
    dpj.jumlah AS quantity,
    dpj.subtotal AS sub_total
FROM 
    detail_penjualan dpj
JOIN 
    barang b ON dpj.idbarang = b.idbarang;


    CREATE VIEW view_kartu_stok AS
SELECT 
    ks.idkartu_stok,
    ks.jenis_transaksi AS transaction_type,
    b.nama AS item_name,
    ks.masuk AS quantity_in,
    ks.keluar AS quantity_out,
    ks.stock,
    ks.created_at AS transaction_date
FROM 
    kartu_stok ks
JOIN 
    barang b ON ks.idbarang = b.idbarang;


    CREATE VIEW view_retur AS
SELECT 
    r.idretur,
    r.created_at AS return_date,
    pn.idpenerimaan AS reception_id,
    u.username AS handled_by,
    dtr.alasan AS reason
FROM 
    retur r
JOIN 
    penerimaan pn ON r.idpenerimaan = pn.idpenerimaan
JOIN 
    user u ON r.iduser = u.iduser
JOIN 
    detail_retur dtr ON dtr.iddetail_retur = r.idretur;


    CREATE VIEW view_user AS
SELECT 
    u.iduser,
    u.username,
    r.nama_role AS role_name
FROM 
    user u
JOIN 
    role r ON u.idrole = r.idrole;

CREATE VIEW view_margin_penjualan AS
SELECT 
    mp.idmargin_penjualan,
    mp.created_at AS margin_date,
    mp.persen AS margin_percentage,
    mp.status
FROM 
    margin_penjualan mp;



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
      console.log('Tables created successfully.');
    }
    connection.end();  
  });
});
