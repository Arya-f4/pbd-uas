"use client";

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";

interface Barang {
  idbarang: number;
  nama: string;
  idsatuan: number;
  nama_satuan: string;
  status: number;
  harga: number;
}

interface Satuan {
  idsatuan: number;
  nama_satuan: string;
}

export default function BarangPage() {
  const [barang, setBarang] = useState<Barang[]>([]);
  const [satuan, setSatuan] = useState<Satuan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingBarang, setEditingBarang] = useState<Barang | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    idsatuan: 0,
    status: 1,
  });

  const fetchBarang = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/barang");
      const result = await response.json();
      if (result.data) {
        setBarang(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch barang:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSatuan = async () => {
    try {
      const response = await fetch("/api/satuan");
      const result = await response.json();
      if (result.data) {
        setSatuan(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch satuan:", error);
    }
  };

  useEffect(() => {
    fetchBarang();
    fetchSatuan();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'idsatuan' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBarang 
        ? `/api/barang?id=${editingBarang.idbarang}`
        : "/api/barang";
      const method = editingBarang ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setIsOpen(false);
        fetchBarang();
      } else {
        throw new Error("Failed to save barang");
      }
    } catch (error) {
      console.error("Error saving barang:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/barang?id=${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          fetchBarang();
        } else {
          throw new Error("Failed to delete barang");
        }
      } catch (error) {
        console.error("Error deleting barang:", error);
      }
    }
  };

  const columns = [
    { name: "ID", selector: (row: Barang) => row.idbarang, sortable: true },
    { name: "Name", selector: (row: Barang) => row.nama, sortable: true },
    { name: "Unit", selector: (row: Barang) => row.nama_satuan, sortable: true },
    { name: "Status", selector: (row: Barang) => row.status ? "Active" : "Inactive", sortable: true },
    { name: "Price", selector: (row: Barang) => row.harga, sortable: true },
    {
      name: "Actions",
      cell: (row: Barang) => (
        <>
          <button onClick={() => {
            setEditingBarang(row);
            setFormData({ nama: row.nama, idsatuan: row.idsatuan, status: row.status });
            setIsOpen(true);
          }} className="bg-blue-500 text-white p-2 rounded mr-2">
            Edit
          </button>
          <button onClick={() => handleDelete(row.idbarang)} className="bg-red-500 text-white p-2 rounded">
            Delete
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Management</h1>
      <button onClick={() => {
        setEditingBarang(null);
        setFormData({ nama: "", idsatuan: 0, status: 1 });
        setIsOpen(true);
      }} className="bg-green-500 text-white p-2 rounded mb-4">
        Add New Product
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h2 className="text-xl font-bold mb-4">{editingBarang ? "Edit Product" : "Add New Product"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Unit</label>
                <select
                  name="idsatuan"
                  value={formData.idsatuan}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Unit</option>
                  {satuan.map(s => (
                    <option key={s.idsatuan} value={s.idsatuan}>{s.nama_satuan}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Price</label>
                <input
                  type="number"
                  name="harga"
                  value={formData.harga}
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

      <DataTable
        columns={columns}
        data={barang}
        progressPending={isLoading}
        pagination
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        highlightOnHover
        responsive
        subHeader
        subHeaderComponent={
            <input
              type="text"
              placeholder="Search..."
              className="rounded border p-2"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredData = barang.filter((barang) =>
                  barang.nama.toLowerCase().includes(searchTerm)
                );
                setBarang(filteredData);
              }}
            />
          }
      />
    </div>
  );
}