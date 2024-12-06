"use client";

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";

interface StokBarang {
  idbarang: number;
  nama_barang: string;
  stok: number;
}

interface KartuStok {
  idkartu_stok: number;
  timestamp: string;
  jenis_transaksi: string;
  jumlah: number;
  keterangan: string;
  idbarang: number;
  nama_barang: string;
}

export default function StokPage() {
  const [stokBarang, setStokBarang] = useState<StokBarang[]>([]);
  const [kartuStok, setKartuStok] = useState<KartuStok[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState<StokBarang | null>(null);
  const [formData, setFormData] = useState({
    idbarang: 0,
    jenis_transaksi: "masuk",
    jumlah: 0,
    keterangan: "",
  });

  const fetchStokBarang = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stok");
      const result = await response.json();
      if (result.data) {
        setStokBarang(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch stock:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKartuStok = async (idbarang: number) => {
    try {
      const response = await fetch(`/api/stok/kartu?idbarang=${idbarang}`);
      const result = await response.json();
      if (result.data) {
        setKartuStok(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch stock card:", error);
    }
  };

  useEffect(() => {
    fetchStokBarang();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'jumlah' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/stok/movement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setIsOpen(false);
        fetchStokBarang();
        if (selectedBarang) {
          fetchKartuStok(selectedBarang.idbarang);
        }
      } else {
        throw new Error("Failed to save stock movement");
      }
    } catch (error) {
      console.error("Error saving stock movement:", error);
    }
  };

  const stokColumns = [
    { name: "ID", selector: (row: StokBarang) => row.idbarang, sortable: true },
    { name: "Product Name", selector: (row: StokBarang) => row.nama_barang, sortable: true },
    { name: "Stock", selector: (row: StokBarang) => row.stok, sortable: true },
    {
      name: "Actions",
      cell: (row: StokBarang) => (
        <button
          onClick={() => {
            setSelectedBarang(row);
            fetchKartuStok(row.idbarang);
            setFormData(prev => ({ ...prev, idbarang: row.idbarang }));
            setIsOpen(true);
          }}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Manage Stock
        </button>
      ),
    },
  ];

  const kartuStokColumns = [
    { name: "ID", selector: (row: KartuStok) => row.idkartu_stok, sortable: true },
    { name: "Timestamp", selector: (row: KartuStok) => row.timestamp, sortable: true },
    { name: "Transaction Type", selector: (row: KartuStok) => row.jenis_transaksi, sortable: true },
    { name: "Quantity", selector: (row: KartuStok) => row.jumlah, sortable: true },
    { name: "Description", selector: (row: KartuStok) => row.keterangan, sortable: true },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Stock Management</h1>

      <DataTable
        title="Product Stock"
        columns={stokColumns}
        data={stokBarang}
        pagination
        progressPending={isLoading}
      />

      {selectedBarang && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Stock Card for {selectedBarang.nama_barang}</h2>
          <DataTable
            columns={kartuStokColumns}
            data={kartuStok}
            pagination
            progressPending={isLoading}
          />
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h2 className="text-xl font-bold mb-4">Record Stock Movement</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Transaction Type</label>
                <select
                  name="jenis_transaksi"
                  value={formData.jenis_transaksi}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="masuk">Stock In</option>
                  <option value="keluar">Stock Out</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Quantity</label>
                <input
                  type="number"
                  name="jumlah"
                  value={formData.jumlah}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Description</label>
                <input
                  type="text"
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setIsOpen(false)} className="bg-gray-300 text-black p-2 rounded mr-2">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}