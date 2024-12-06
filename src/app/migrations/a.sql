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
    FOREIGN KEY (idsatuan) REFERENCES satuan(idsatuan)
  );

  CREATE TABLE IF NOT EXISTS pengadaan (
    idpengadaan BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP,
    user_iduser INT,
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


  -- Seeder


  -- Batas DUNIA antara seeder lama dan modul 9

-- soal 1

DELIMITER $$

CREATE PROCEDURE proc_lat1()
BEGIN
    SELECT CONCAT(first_name, ' ', last_name) as 'Nama' ,   j.job_title AS 'Nama Pekerjaan', salary as 'Gaji'
    FROM employees e
    JOIN 
    jobs j ON e.job_id = j.job_id
    WHERE (j.job_id = 'IT_PROG' OR j.job_id = 'FI_ACCOUNT')
      AND salary NOT IN (4800, 6000, 9000);
END $$

DELIMITER ;

CALL proc_lat1();


-- soal 2
DELIMITER $$

CREATE PROCEDURE proc_lat2(in peg VARCHAR(250))
BEGIN
SELECT Concat(e.first_name,' ',e.last_name) AS "Nama_Pegawai" ,
        e.SALARY as 'Gaji',
    Concat(m.first_name,' ',m.last_name) AS "Nama_Manager"
from employees e
join employees m on e.MANAGER_ID=m.EMPLOYEE_ID
WHERE Concat(m.first_name,' ',m.last_name) LIKE peg ;
END $$

DELIMITER ;


call proc_lat2('Alexander Hunold');

-- soal 3
DELIMITER $$

CREATE PROCEDURE proc_lat3(IN dept_name VARCHAR(100))
BEGIN
    SELECT e.first_name, e.last_name, d.department_name,
           (e.salary * 12) AS yearly_salary,
           IFNULL(e.commission * 12, 0) AS yearly_commission
    FROM employees e
    INNER JOIN departments d ON e.department_id = d.department_id
    WHERE d.department_name = dept_name;
END $$

DELIMITER ;

CALL proc_lat3('Marketing');
-- soal 4

DELIMITER $$

CREATE FUNCTION volume_tabung(r DOUBLE, t DOUBLE) 
RETURNS DOUBLE
DETERMINISTIC
BEGIN
    DECLARE volume DOUBLE;
    
  
    SET volume = PI() * r * r * t;
    
	RETURN volume;
END $$

DELIMITER ;

SELECT volume_tabung(7, 10) AS 'Volume Tabung';

-- soal 5
DELIMITER $$

CREATE FUNCTION celsius_to_fahrenheit(celsius DOUBLE) 
RETURNS DOUBLE
DETERMINISTIC
BEGIN
    DECLARE fahrenheit DOUBLE;
    
    SET fahrenheit = (celsius * 9 / 5) + 32;
    
    RETURN fahrenheit;
END $$

-- soal 6
DELIMITER ;
SELECT celsius_to_fahrenheit(40)




CREATE FUNCTION employee_info(emp_id INT) 
RETURNS VARCHAR(255)
DETERMINISTIC
BEGIN
    DECLARE full_info VARCHAR(255);
    
    
    SELECT CONCAT(first_name, ' ', last_name, ', Salary: ', salary)
    INTO full_info
    FROM employees
    WHERE employee_id = emp_id;
    
    
    RETURN full_info;
END $$

DELIMITER ;

SELECT employee_info(100) as Detail_Gaji


-- soal 7
DELIMITER $$

CREATE FUNCTION calculate_work_duration(emp_id INT) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE work_duration INT;
    
    SELECT TIMESTAMPDIFF(MONTH, hire_date, CURDATE())
    INTO work_duration
    FROM employees
    WHERE employee_id = emp_id;
    
	RETURN work_duration;
END $$
DELIMITER ;
SELECT calculate_work_duration(100) AS 'Lama Bekerja'


-- soal 8
DELIMITER $$
CREATE FUNCTION calculate_revised_salary(emp_id INT) 
RETURNS DOUBLE
DETERMINISTIC
BEGIN
    DECLARE revised_salary DOUBLE;
    DECLARE current_salary DOUBLE;
    DECLARE job_id VARCHAR(50);
    SELECT salary, job_id
    INTO current_salary, job_id
    FROM employees
    WHERE employee_id = emp_id;
    SET revised_salary = CASE
        WHEN job_id LIKE '%VIP%' THEN current_salary * 1.35
        WHEN job_id LIKE '%MAN%' THEN current_salary * 1.30
        WHEN job_id LIKE '%ACCOUNT%' THEN current_salary * 1.20
        ELSE current_salary * 1.10
    END;
    RETURN revised_salary;
END $$
DELIMITER ;

SELECT calculate_revised_salary(100)





-- TM - 10 PBD

-- soal 1
CREATE TABLE `tugas-tm10`.`barang` (
  `kodebrg` VARCHAR(10) NOT NULL,
  `namabrg` VARCHAR(255) NOT NULL,
  `satuan` VARCHAR(5) NOT NULL,
  `stok` INT NOT NULL,
  PRIMARY KEY (`kodebrg`));
  
  
  CREATE TABLE `tugas-tm10`.`pembelian` (
  `nofaktur` VARCHAR(15) PRIMARY KEY,
  `tgl` DATE NOT NULL,
  `kodebrg` VARCHAR(15) NOT NULL,
  `qty` INT NOT NULL,
  FOREIGN KEY (`kodebrg`) REFERENCES BARANG(kodebrg));
  
  CREATE TABLE `tugas-tm10`.`kategori`(
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nama` VARCHAR(255) NOT NULL);
  

  -- soal 2

DELIMITER //

CREATE TRIGGER generate_kodebrg
BEFORE INSERT ON BARANG
FOR EACH ROW
BEGIN
    DECLARE jenis INT;
    DECLARE nomor_urut INT;

    SELECT CASE WHEN nama = 'makanan' THEN 1 ELSE 2 END
    INTO jenis
    FROM KATEGORI
    WHERE id = NEW.kategori_id;
    SELECT COALESCE(MAX(CAST(SUBSTRING(kodebrg, 7) AS UNSIGNED)), 0) + 1
    INTO nomor_urut
    FROM BARANG
    WHERE SUBSTRING(kodebrg, 5, 1) = jenis;

 
    SET NEW.kodebrg = CONCAT('BAR-', jenis, '-', LPAD(nomor_urut, 4, '0'));
END//

DELIMITER ;


-- soal 3

DELIMITER //

CREATE TRIGGER generate_nofaktur
BEFORE INSERT ON PEMBELIAN
FOR EACH ROW
BEGIN
    DECLARE max_urut INT;
    DECLARE tanggal_terakhir DATE;

    
    SELECT MAX(tgl) INTO tanggal_terakhir FROM PEMBELIAN;
    
    
    IF NEW.tgl != tanggal_terakhir THEN
        SET max_urut = 1; 
    ELSE
    
        SELECT COALESCE(MAX(CAST(SUBSTRING(nofaktur, -3) AS UNSIGNED)), 0) + 1
        INTO max_urut
        FROM PEMBELIAN
        WHERE tgl = NEW.tgl;
    END IF;
    
    
    SET NEW.nofaktur = CONCAT('BL.', DATE_FORMAT(NEW.tgl, '%d%m%Y'), '.', LPAD(max_urut, 3, '0'));
END//

DELIMITER ;



-- soal 4
DELIMITER //

CREATE TRIGGER update_stok_on_purchase
BEFORE INSERT ON PEMBELIAN
FOR EACH ROW
BEGIN
    DECLARE current_stok INT;


    SELECT stok INTO current_stok
    FROM BARANG
    WHERE kodebrg = NEW.kodebrg;

    IF NEW.qty > current_stok THEN
        SIGNAL SQLSTATE '45000' -- SIGNAL SQLSTATE 45000 artinya akan menghentikan query sql jika quantity melebihi stok
        SET MESSAGE_TEXT = 'Transaksi pembelian melebihi jumlah stok';
    ELSE
        UPDATE BARANG
        SET stok = stok - NEW.qty
        WHERE kodebrg = NEW.kodebrg;
    END IF;
END//


-- SQL MODUL 11 PBD

-- soal 1
CREATE TABLE `hr`.`my_employee` (
  `ID` VARCHAR(4) NOT NULL,
  `LAST_NAME` VARCHAR(25) NULL,
  `FIRST_NAME` VARCHAR(25) NULL,
  `USERID` VARCHAR(8) NULL,
  `SALARY` INT(9) NULL,
  PRIMARY KEY (`ID`));


  -- soal 2
  SET autocommit = OFF;

  -- Soal 3
START TRANSACTION;

-- Soal 4
INSERT INTO MY_EMPLOYEE (ID, LAST_NAME, FIRST_NAME, USERID, SALARY) VALUES
(1, 'Patel', 'Ralph', 'rpatel', 795),
(2, 'Dancs', 'Betty', 'bdancs', 860),
(3, 'Biri', 'Ben', 'bbiri', 1100),
(4, 'Newman', 'Chad', 'cnewman', 750),
(5, 'Ropebur', 'Audry', 'aropebur', 1550);

-- Soal 5
SELECT * FROM MY_EMPLOYEE;

-- Soal 

ROLLBACK;
SELECT * FROM MY_EMPLOYEE;

-- Soal 7
START TRANSACTION;

INSERT INTO MY_EMPLOYEE (ID, LAST_NAME, FIRST_NAME, USERID, SALARY) VALUES
(1, 'Patel', 'Ralph', 'rpatel', 795),
(2, 'Dancs', 'Betty', 'bdancs', 860),
(3, 'Biri', 'Ben', 'bbiri', 1100),
(4, 'Newman', 'Chad', 'cnewman', 750),
(5, 'Ropebur', 'Audry', 'aropebur', 1550);

COMMIT;

-- Soal 8
START TRANSACTION;

UPDATE MY_EMPLOYEE
SET LAST_NAME = 'Drexler'
WHERE ID = 3;

SELECT * FROM MY_EMPLOYEE;


-- Soal 9
UPDATE MY_EMPLOYEE
SET SALARY = 1000
WHERE SALARY < 900;
SELECT * FROM MY_EMPLOYEE;


-- Soal 10 SS

-- Soal 11
DELETE FROM MY_EMPLOYEE
WHERE FIRST_NAME = 'Betty' AND LAST_NAME = 'Dancs';

-- Soal 12
COMMIT;

-- Soal 13
START TRANSACTION;

SAVEPOINT sini;

-- Soal 14
DELETE FROM my_employee;

-- Soal 15
SELECT * FROM MY_EMPLOYEE;

-- SOAL 16
ROLLBACK TO sini;


-- SOAL 17
SELECT * FROM MY_EMPLOYEE;

-- Soal 18
USE hr;

START TRANSACTION;

-- Soal 19 a
INSERT INTO your_master_table (column1, column2, column3, ...) VALUES
('Value1', 'Value2', 'Value3', ...),
('Value4', 'Value5', 'Value6', ...),
('Value7', 'Value8', 'Value9', ...),
('Value10', 'Value11', 'Value12', ...),
('Value13', 'Value14', 'Value15', ...);


START TRANSACTION;
INSERT INTO barang (idbarang, nama, idsatuan ,jenis, status, created_at)
VALUES 
    (3, 'Product A', 1,'A', 1, NOW()),
    (4, 'Product B', 1,'B', 1, NOW()),
    (5, 'Product C', 1,'A', 1, NOW()),
    (6, 'Product D', 1,'C', 1, NOW()),
    (7, 'Product E', 1,'B', 1, NOW());
SELECT * FROM penjualan.barang;



-- Tugas Basis data modul 12

-- Soal 1
CREATE USER 'SCOTT'@'localhost' IDENTIFIED BY 'password1';
CREATE USER 'DEHAAN'@'localhost' IDENTIFIED BY 'password2';
CREATE USER 'KOCHHAR'@'localhost' IDENTIFIED BY 'password3';


-- soal 2 alasan dan ngecek


-- soal 3

CREATE ROLE 'CTABLER';
GRANT CREATE ON HR.* TO 'CTABLER';
GRANT 'CTABLER' TO 'SCOTT'@'localhost';

-- soal 4

SET ROLE 'CTABLER';
CREATE TABLE HR.test_table (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);

-- soal 5


CREATE ROLE 'Manager_role';
GRANT SELECT ON HR.employees TO 'Manager_role';
GRANT 'Manager_role' TO 'DEHAAN'@'localhost';



SET ROLE 'Manager_role';
SELECT * FROM HR.employees;


-- soal 6

GRANT INSERT ON HR.employees TO 'DEHAAN'@'localhost';

INSERT INTO `hr`.`employees` (`EMPLOYEE_ID`, `FIRST_NAME`, `LAST_NAME`, `EMAIL`, `PHONE_INTEGER`, `HIRE_DATE`, `JOB_ID`, `SALARY`, `COMMISSION_PCT`, `MANAGER_ID`, `DEPARTMENT_ID`)
 VALUES ('302', 'Arya', 'Here', 'ARYA', '081241414141', '2000-01-01', 'IT_PROG', '99999', '0.50', '100', '20');
SELECT * FROM HR.employees;


-- soal 7

INSERT INTO `HR`.`employees` (`EMPLOYEE_ID`, `FIRST_NAME`, `LAST_NAME`, `EMAIL`, `PHONE_INTEGER`, `HIRE_DATE`, `JOB_ID`, `SALARY`) VALUES ('303', 'Kiki', 'Amalia', 'KAMALIA', '12345', '1998-04-01', 'ST_MAN', '6000');


-- soal 8

GRANT SELECT,INSERT,UPDATE ON hr.jobs TO 'SCOTT'@'localhost' WITH GRANT OPTION;


-- soal 9
GRANT SELECT ON HR.JOBS TO 'DEHAAN'@'localhost';
GRANT INSERT ON HR.JOBS TO 'KOCHHAR'@'localhost';
