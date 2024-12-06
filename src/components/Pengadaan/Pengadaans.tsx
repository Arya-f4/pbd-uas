"use client";

import React, { useState, useEffect } from "react";
import DataTable from 'react-data-table-component';

interface Pengadaan {
  idpengadaan: number;
  timestamp: string;
  status: 'A' | 'I';
  vendor_idvendor: number;
  nama_vendor: string;
  subtotal_nilai: number;
  ppn: number;
  total_nilai: number;
  reception_status: 'Belum Diterima' | 'Diterima Sebagian' | 'Sudah Diterima';
}

interface DetailPengadaan {
  iddetail_pengadaan: number;
  harga_satuan: number;
  jumlah: number;
  jumlah_diterima?: number;
  sub_total: number;
  idbarang: number;
  nama_barang: string;
  idpengadaan: number;
}

interface Barang {
  idbarang: number;
  nama: string;
  harga: number;
}

interface Vendor {
  idvendor: number;
  vendor_name: string;
}

interface PenerimaanFormData {
  [key: number]: number; // idbarang: jumlah
}

export default function PengadaanPage() {
  const [pengadaan, setPengadaan] = useState<Pengadaan[]>([]);
  const [detailPengadaan, setDetailPengadaan] = useState<DetailPengadaan[]>([]);
  const [barang, setBarang] = useState<Barang[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPenerimaanFormOpen, setIsPenerimaanFormOpen] = useState(false);
  const [editingPengadaan, setEditingPengadaan] = useState<Pengadaan | null>(null);
  const [formData, setFormData] = useState({
    vendor_idvendor: 0,
    details: [{ idbarang: 0, jumlah: 0 }],
  });
  const [penerimaanFormData, setPenerimaanFormData] = useState<PenerimaanFormData>({});

  const fetchPengadaan = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/pengadaan?include_reception_status=true");
      const result = await response.json();
      if (result.data) {
        setPengadaan(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch pengadaan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBarang = async () => {
    try {
      const response = await fetch("/api/barang");
      const result = await response.json();
      if (result.data) {
        setBarang(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch barang:", error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch("/api/vendor");
      const result = await response.json();
      if (result.data) {
        setVendors(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    }
  };

  const fetchDetailPengadaan = async (idpengadaan: number) => {
    try {
      const response = await fetch(`/api/pengadaan/${idpengadaan}`);
      const result = await response.json();
      if (result.data) {
        setDetailPengadaan(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch detail pengadaan:", error);
    }
  };

  useEffect(() => {
    fetchPengadaan();
    fetchBarang();
    fetchVendors();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedDetails = [...formData.details];
    updatedDetails[index] = { ...updatedDetails[index], [name]: parseInt(value) };
    setFormData(prev => ({ ...prev, details: updatedDetails }));
  };

  const addDetailRow = () => {
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, { idbarang: 0, jumlah: 0 }],
    }));
  };

  const removeDetailRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  const calculateSubTotal = (idbarang: number, jumlah: number) => {
    const selectedBarang = barang.find(b => b.idbarang === idbarang);
    return selectedBarang ? selectedBarang.harga * jumlah : 0;
  };

  const calculateTotal = () => {
    return formData.details.reduce((total, detail) => {
      return total + calculateSubTotal(detail.idbarang, detail.jumlah);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPengadaan 
        ? `/api/pengadaan?id=${editingPengadaan.idpengadaan}`
        : "/api/pengadaan";
      const method = editingPengadaan ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setIsOpen(false);
        fetchPengadaan();
      } else {
        throw new Error("Failed to save pengadaan");
      }
    } catch (error) {
      console.error("Error saving pengadaan:", error);
    }
  };

  const handlePenerimaanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPengadaan) return;

    try {
      const response = await fetch(`/api/pengadaan/${editingPengadaan.idpengadaan}/penerimaan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 'A', // Assuming 'A' for active status
          iduser: 1, // Replace with actual user ID
          details: Object.entries(penerimaanFormData).map(([idbarang, jumlah]) => ({
            idbarang: parseInt(idbarang),
            jumlah
          }))
        }),
      });

      if (response.ok) {
        setIsPenerimaanFormOpen(false);
        setPenerimaanFormData({});
        await fetchPengadaan();
      } else {
        throw new Error ("Failed to submit penerimaan");
      }
    } catch (error) {
      console.error("Error submitting penerimaan:", error);
    }
  };

  const handlePenerimaanQuantityChange = (idbarang: number, jumlah: string) => {
    setPenerimaanFormData(prev => ({
      ...prev,
      [idbarang]: parseInt(jumlah) || 0
    }));
  };

  const handleStatusChange = async (idpengadaan: number, status: 'A' | 'I') => {
    try {
      const response = await fetch(`/api/pengadaan/${idpengadaan}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      fetchPengadaan();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleReceiveGoods = async (pengadaan: Pengadaan) => {
    setEditingPengadaan(pengadaan);
    await fetchDetailPengadaan(pengadaan.idpengadaan);
    setIsPenerimaanFormOpen(true);
  };

  const columns = [
    {
      name: 'ID',
      selector: (row: Pengadaan) => row.idpengadaan,
      sortable: true,
    },
    {
      name: 'Timestamp',
      selector: (row: Pengadaan) => row.timestamp,
      sortable: true,
      format: (row: Pengadaan) => new Date(row.timestamp).toLocaleString(),
    },
    {
      name: 'Status',
      selector: (row: Pengadaan) => row.status,
      sortable: true,
      cell: (row: Pengadaan) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row.idpengadaan, e.target.value as 'A' | 'I')}
          className="p-1 border rounded"
        >
          <option value="A">Active</option>
          <option value="I">Inactive</option>
        </select>
      ),
    },
    {
      name: 'Vendor',
      selector: (row: Pengadaan) => row.nama_vendor,
      sortable: true,
    },
    {
      name: 'Subtotal',
      selector: (row: Pengadaan) => row.subtotal_nilai,
      sortable: true,
      format: (row: Pengadaan) => `Rp ${row.subtotal_nilai ? row.subtotal_nilai.toLocaleString() : 'Rp 0'}`,
    },
    {
      name: 'PPN',
      selector: (row: Pengadaan) => row.ppn,
      sortable: true,
      format: (row: Pengadaan) => `Rp ${row.ppn ? row.ppn.toLocaleString() : 'Rp 0'}`,
    },
    {
      name: 'Total',
      selector: (row: Pengadaan) => row.total_nilai,
      sortable: true,
      format: (row: Pengadaan) => `Rp ${row.total_nilai ? row.total_nilai.toLocaleString() : 'Rp 0'}`,
    },
    {
      name: 'Reception Status',
      selector: (row: Pengadaan) => row.reception_status,
      sortable: true,
      cell: (row: Pengadaan) => (
        <span className={`px-2 py-1 rounded text-sm ${
          row.reception_status === 'Sudah Diterima' ? 'bg-green-100 text-green-800' :
          row.reception_status === 'Diterima Sebagian' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.reception_status}
        </span>
      ),
    },
    {
      name: 'Actions',
      cell: (row: Pengadaan) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setEditingPengadaan(row);
              fetchDetailPengadaan(row.idpengadaan);
              setIsDetailOpen(true);
            }}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Detail
          </button>
          {row.status === 'A' && row.reception_status !== 'Sudah Diterima' && (
            <button
              onClick={() => handleReceiveGoods(row)}
              className="bg-green-500 text-white p-2 rounded"
            >
              Terima Pengadaan
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4 lg:pl-64">
      <div className=" max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Procurement Management</h1>
        <button 
          onClick={() => {
            setEditingPengadaan(null);
            setFormData({
              vendor_idvendor: 0,
              details: [{ idbarang: 0, jumlah: 0 }],
            });
            setIsOpen(true);
          }} 
          className="bg-green-500 text-white p-2 rounded mb-4"
        >
          Add New Procurement
        </button>

        <DataTable
          columns={columns}
          data={pengadaan}
          progressPending={isLoading}
          pagination
          responsive
        />
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <h2 className="text-xl font-bold mb-4">{editingPengadaan ? "Edit Procurement" : "Add New Procurement"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Vendor</label>
                <select
                  name="vendor_idvendor"
                  value={formData.vendor_idvendor}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(v => (
                    <option key={v.idvendor} value={v.idvendor}>{v.vendor_name}</option>
                  ))}
                </select>
              </div>
            
              <h3 className="text-lg font-semibold mb-2">Details</h3>
              {formData.details.map((detail, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 mb-4">
                  <div className="col-span-2">
                    <label htmlFor={`product-${index}`} className="block mb-1 text-sm font-medium text-gray-700">Product</label>
                    <select
                      id={`product-${index}`}
                      name="idbarang"
                      value={detail.idbarang}
                      onChange={(e) => handleDetailChange(index, e)}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select Product</option>
                      {barang.map(b => (
                        <option key={b.idbarang} value={b.idbarang}>{b.nama} - Rp {b.harga.toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label htmlFor={`quantity-${index}`} className="block mb-1 text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      id={`quantity-${index}`}
                      type="number"
                      name="jumlah"
                      value={detail.jumlah}
                      onChange={(e) => handleDetailChange(index, e)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block mb-1 text-sm font-medium text-gray-700">Subtotal</label>
                    <p className="p-2 bg-gray-100 rounded">
                      Rp {calculateSubTotal(detail.idbarang, detail.jumlah).toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-1 flex items-end">
                    <button type="button" onClick={() => removeDetailRow(index)} className="bg-red-500 text-white p-2 rounded">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addDetailRow} className="bg-blue-500 text-white p-2 rounded mb-4">
                Add Detail
              </button>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">Total</label>
                <p className="p-2 bg-gray-100 rounded font-bold">
                  Rp {calculateTotal().toLocaleString()}
                </p>
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

      {isDetailOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <h2 className="text-xl font-bold mb-4">Procurement Details</h2>
            <DataTable
              columns={[
                {
                  name: 'Product',
                  selector: (row: DetailPengadaan) => row.nama_barang,
                  sortable: true,
                },
                {
                  name: 'Quantity',
                  selector: (row: DetailPengadaan) => row.jumlah,
                  sortable: true,
                },
                {
                  name: 'Unit Price',
                  selector: (row: DetailPengadaan) => row.harga_satuan,
                  sortable: true,
                  format: (row: DetailPengadaan) => `Rp ${row.harga_satuan.toLocaleString()}`,
                },
                {
                  name: 'Subtotal',
                  selector: (row: DetailPengadaan) => row.sub_total,
                  sortable: true,
                  format: (row: DetailPengadaan) => `Rp ${row.sub_total.toLocaleString()}`,
                },
              ]}
              data={detailPengadaan}
              pagination
              responsive
            />
            <div className="flex justify-end mt-4">
              <button onClick={() => setIsDetailOpen(false)} className="bg-blue-500 text-white p-2 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isPenerimaanFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <h2 className="text-xl font-bold mb-4">Penerimaan Barang</h2>
            <form onSubmit={handlePenerimaanSubmit}>
              <div className="grid gap-4 py-4">
                {detailPengadaan.map((detail) => {
                  const remainingQuantity = detail.jumlah - (detail.jumlah_diterima || 0);
                  return (
                    <div key={detail.idbarang} className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor={`quantity-${detail.idbarang}`} className="text-right">
                        {detail.nama_barang}
                      </label>
                      <div className="col-span-3">
                        <input
                          id={`quantity-${detail.idbarang}`}
                          type="number"
                          min="0"
                          max={remainingQuantity}
                          value={penerimaanFormData[detail.idbarang] || 0}
                          onChange={(e) => handlePenerimaanQuantityChange(detail.idbarang, e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                        <span className="text-sm text-gray-500 mt-1 block">
                          Available: {remainingQuantity} of {detail.jumlah}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsPenerimaanFormOpen(false)} className="bg-gray-300 text-black p-2 rounded">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                  Submit Penerimaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
