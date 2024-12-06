const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  };
//database connection
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root', 
  database: 'penjualan'
});

const queryAsync = (query, data = []) => {
  return new Promise((resolve, reject) => {
    connection.query(query, data, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Satuan Seeder
const seedSatuan = async () => {
  const satuanData = [
    ['PCS', 1],
    ['BOX', 1],
    ['KARTON', 1],
  ];

  const query = `INSERT INTO satuan (nama_satuan, status) VALUES ?`;
  await queryAsync(query, [satuanData]);
  console.log('Satuan data inserted');
};

// Vendor Seeder
const seedVendor = async () => {
  const vendorData = [
    ['Vendor A', 'B', '1'],
    ['Vendor B', 'C', '1'],
  ];

  const query = `INSERT INTO vendor (nama_vendor, badan_hukum, status) VALUES ?`;
  await queryAsync(query, [vendorData]);
  console.log('Vendor data inserted');
};

// Role Seeder
const seedRole = async () => {
  const roleData = [
    ['Admin'],
    ['Kasir'],
  ];

  const query = `INSERT INTO role (nama_role) VALUES ?`;
  await queryAsync(query, [roleData]);
  console.log('Role data inserted');
};

// User Seeder
const seedUser = async () => {
    const users = [
      { username: 'admin', password: 'password1', idrole: 1 },
      { username: 'customer', password: 'password2', idrole: 2 },
    ];
  
    // Hash passwords for each user
    const userData = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await hashPassword(user.password);
        return [user.username, hashedPassword, user.idrole];
      })
    );
  
    const query = `INSERT INTO user (username, password, idrole) VALUES ?`;
    await queryAsync(query, [userData]);
    console.log('User data inserted with hashed passwords');
  };

// Barang Seeder
const seedBarang = async () => {
  const barangData = [
    ['Barang A','1', '1', 1, '2024-01-01 00:00:00','10000'],
    ['Barang B','2', '1', 1, '2024-01-01 00:00:00','20000'],
  ];

  const query = `INSERT INTO barang (nama,idsatuan, jenis, status, created_at,harga) VALUES ?`;
  await queryAsync(query, [barangData]);
  console.log('Barang data inserted');
};

// Pengadaan Seeder
const seedPengadaan = async () => {
  const pengadaanData = [
    ['2024-01-01 00:00:00', 1, 1, 10000, 1000, 11000],
  ];

  const query = `INSERT INTO pengadaan (timestamp, user_iduser, vendor_idvendor, subtotal_nilai, ppn, total_nilai) VALUES ?`;
  await queryAsync(query, [pengadaanData]);
  console.log('Pengadaan data inserted');
};

// Penerimaan Seeder
const seedPenerimaan = async () => {
  const penerimaanData = [
    ['2024-01-01 00:00:00', 'A', 1, 1],
  ];

  const query = `INSERT INTO penerimaan (created_at, status, iduser, idpengadaan) VALUES ?`;
  await queryAsync(query, [penerimaanData]);
  console.log('Penerimaan data inserted');
};

// Kartu Stok Seeder
const seedKartuStok = async () => {
  const kartuStokData = [
    ['A', 10, 5, 5, '2024-01-01 00:00:00', 1, 1],
  ];

  const query = `INSERT INTO kartu_stok (jenis_transaksi, masuk, keluar, stock, created_at, idtransaksi, idbarang) VALUES ?`;
  await queryAsync(query, [kartuStokData]);
  console.log('Kartu Stok data inserted');
};

// Detail Pengadaan Seeder
const seedDetailPengadaan = async () => {
  const detailPengadaanData = [
    [500, 10, 5000, 1, 1],
  ];

  const query = `INSERT INTO detail_pengadaan (harga_satuan, jumlah, sub_total, idpengadaan, idbarang) VALUES ?`;
  await queryAsync(query, [detailPengadaanData]);
  console.log('Detail Pengadaan data inserted');
};

// Detail Penerimaan Seeder
const seedDetailPenerimaan = async () => {
  const detailPenerimaanData = [
    [1, 1, 10, 500, 5000],
  ];

  const query = `INSERT INTO detail_penerimaan (idpenerimaan, barang_idbarang, jumlah_terima, harga_satuan_terima, sub_total_terima) VALUES ?`;
  await queryAsync(query, [detailPenerimaanData]);
  console.log('Detail Penerimaan data inserted');
};

// Margin Penjualan Seeder
const seedMarginPenjualan = async () => {
  const marginPenjualanData = [
    ['2024-01-01 00:00:00', 10.5, 1, 1, '2024-01-01 00:00:00'],
  ];

  const query = `INSERT INTO margin_penjualan (created_at, persen, status, iduser, updated_at) VALUES ?`;
  await queryAsync(query, [marginPenjualanData]);
  console.log('Margin Penjualan data inserted');
};

// Penjualan Seeder
const seedPenjualan = async () => {
  const penjualanData = [
    ['2024-01-01 00:00:00', 10000, 1000, 11000, 1, 1],
  ];

  const query = `INSERT INTO penjualan (created_at, subtotal_nilai, ppn, total_nilai, iduser, idmargin_penjualan) VALUES ?`;
  const result = await queryAsync(query, [penjualanData]);
  console.log('Penjualan data inserted');

  const insertedPenjualanId = result.insertId;

  await seedDetailPenjualan(insertedPenjualanId);
};

// Detail Penjualan Seeder
const seedDetailPenjualan = async (penjualanId) => {
  const detailPenjualanData = [
    [500, 10, 5000, penjualanId, 1], 
  ];

  const query = `INSERT INTO detail_penjualan (harga_satuan, jumlah, subtotal, penjualan_idpenjualan, idbarang) VALUES ?`;
  await queryAsync(query, [detailPenjualanData]);
  console.log('Detail Penjualan data inserted');
};

// Retur Seeder
const seedRetur = async () => {
  const returData = [
    ['2024-01-01 00:00:00', 1, 1],
  ];

  const query = `INSERT INTO retur (created_at, idpenerimaan, iduser) VALUES ?`;
  await queryAsync(query, [returData]);
  console.log('Retur data inserted');
};

// Detail Retur Seeder
const seedDetailRetur = async () => {
  const detailReturData = [
    [10, 'Damaged goods', 1, 1],
  ];

  const query = `INSERT INTO detail_retur (jumlah, alasan, idbarang, iddetail_penerimaan) VALUES ?`;
  await queryAsync(query, [detailReturData]);
  console.log('Detail Retur data inserted');
};

// Seed function untuk run semua seeder
const seedDatabase = async () => {
  try {
    await seedSatuan();
    await seedVendor();
    await seedRole();
    await seedUser();
    await seedBarang();
    await seedPengadaan();
    await seedPenerimaan();
    await seedKartuStok();
    await seedDetailPengadaan();
    await seedDetailPenerimaan();
    await seedMarginPenjualan();
    await seedPenjualan();
    await seedRetur();
    await seedDetailRetur();

    console.log('All data inserted successfully');
  } catch (err) {
    console.error('Error seeding the database:', err);
  } finally {
    // Close the connection setelah seeder berjalan
    connection.end();
  }
};

// Connect ke database dan run seeder
connection.connect(async (err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id', connection.threadId);
  await seedDatabase();
});
