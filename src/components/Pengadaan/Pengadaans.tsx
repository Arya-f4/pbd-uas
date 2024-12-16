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
 }

 interface Penerimaan {
  idpenerimaan: number;
  reception_date : Date;
  status: 'A' | 'C' | 'D' | 'P';
  idpengadaan: number;
received_by: string;
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
      const [details, setDetails] = useState([{ idbarang: '', jumlah: '', harga_satuan: '', subtotal: 0 }]);

  const [pengadaan, setPengadaan] = useState<Pengadaan[]>([]);
  const [detailPengadaan, setDetailPengadaan] = useState<DetailPengadaan[]>([]);
  const [barang, setBarang] = useState<Barang[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPenerimaanFormOpen, setIsPenerimaanFormOpen] = useState(false);
  const [editingPengadaan, setEditingPengadaan] = useState<Pengadaan | null>(null);
  const [formData, setFormData] = useState({
    vendor_idvendor: 0,
    details: [{ idbarang: 0, jumlah: 0 }],
  });
  const [penerimaanFormData, setPenerimaanFormData] = useState<{ [key: string]: { jumlah: number, harga_satuan: number, subtotal: number } }>({});

  const [subtotal, setSubtotal] = useState(0);


  useEffect(() => {
    const newSubtotal = Object.values(penerimaanFormData).reduce((acc, item) => {
      return acc + (item.subtotal || 0);
    }, 0);
    setSubtotal(newSubtotal);
  }, [penerimaanFormData]);
  console.log(penerimaanFormData)

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



  const handleTerimaBarang = async (id: number) => {
    setSelectedId(id);
    await fetchDetailPengadaan(id);
    setIsPenerimaanFormOpen(true);
  };

  const handleChange = (idbarang: string, field: string, value: string) => {
    setPenerimaanFormData(prevState => {
      const detailItem = detailPengadaan.find(item => item.idbarang.toString() === idbarang);
      const currentItem = prevState[idbarang] || { 
        jumlah: 0, 
        harga_satuan: detailItem ? detailItem.harga_satuan : 0, 
        subtotal: 0 
      };
      const updatedItem = {
        ...currentItem,
        [field]: parseFloat(value) || 0
      };
      
      // Always recalculate subtotal when either jumlah or harga_satuan changes
      updatedItem.subtotal = updatedItem.jumlah * updatedItem.harga_satuan;

      return {
        ...prevState,
        [idbarang]: updatedItem
      };
    });
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
  const fetchUserId = async () => {
    try {
      const response = await fetch('/api/auth');
      if (!response.ok) {
        throw new Error('Failed to fetch user ID');
      }
      const data = await response.json();
      return data.iduser;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null;
    }
  };

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

  const fetchDetailPengadaan = async (idpengadaan: number) => {
    try {
      const response = await fetch(`/api/pengadaan/${idpengadaan}`);
      const result = await response.json();

      if (result.data) {
        setDetailPengadaan(result.data);
        initializePenerimaanFormData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch detail pengadaan:", error);
    }
  };
  const initializePenerimaanFormData = (details: DetailPengadaan[]) => {
    const initialData: { [key: string]: { jumlah: number; harga_satuan: number; subtotal: number } } = {};
    details.forEach(detail => {
      initialData[detail.idbarang] = {
        jumlah: 0,
        harga_satuan: detail.harga_satuan,
        subtotal: 0
      };
    });
    setPenerimaanFormData(initialData);
  };





  const fetchRemainingQuantities = async (idpengadaan: number) => {
    const response = await fetch(`/api/pengadaan/${idpengadaan}/remaining`);
    const data = await response.json();
    return data.items;
  };

  const handleReceiveClick = async (pengadaan: Pengadaan) => {
    if (pengadaan.status === 'C' || pengadaan.status === 'D') return;
    
    setEditingPengadaan(pengadaan);
    const remainingItems = await fetchRemainingQuantities(pengadaan.idpengadaan);
    setDetailPengadaan(remainingItems);
    setIsPenerimaanFormOpen(true);
  };

 
  const handlePenerimaanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    try {
      const response = await fetch(`/api/pengadaan/${selectedId}/penerimaan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 'A',
          iduser, // Replace with actual user ID
          details: Object.entries(penerimaanFormData).map(([idbarang, { jumlah, harga_satuan, subtotal }]) => ({
            idbarang: parseInt(idbarang),
            jumlah: jumlah,
            harga_satuan: harga_satuan,
            subtotal: subtotal
          }))
        }),
      });

      if (response.ok) {
        setIsPenerimaanFormOpen(false);
        setPenerimaanFormData({});
        setSelectedId(null);
        await fetchPengadaan();
      } else {
        const errorData = await response.json();
        console.error("Error submitting penerimaan:", errorData);
      }
    } catch (error) {
      console.error("Error submitting penerimaan:", error);
    }
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
      selector: (row: Penerimaan) => row.status,
      sortable: true,
      cell: (row: Penerimaan) => (
        <span className={`px-2 py-1 rounded text-sm ${
          row.status === 'C' ? 'bg-green-100 text-green-800' :
          row.status === 'A' ? 'bg-blue-100 text-blue-800' :
          row.status === 'D' ? 'bg-gray-100 text-gray-800' :
 'bg-yellow-100 text-yellow-800'
        }`}>
          {
            row.status === 'C' ? 'Completed' :
            row.status === 'A' ? 'Partially Received':
          row.status === 'D' ? 'Cancelled' :
          'Pending'}
         
        </span>
      )
    },
    {
      name: 'Actions',
      cell: (row: Penerimaan, rowpengadaan: Pengadaan) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setEditingPengadaan(row);
              fetchDetailPengadaan(row.idpengadaan);
              setIsDetailOpen(true);
            }}
            className="bg-blue-500 w-full text-white p-2 rounded"
          >
            Detail
          </button>
          {row.status !== 'C' && row.reception_status !== 'Sudah Diterima' && (
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
    <div className="container mx-auto p-4">
      <div className=" mx-auto">
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
      )}      {isPenerimaanFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Penerimaan Barang untuk Pengadaan ID: {selectedId}</h2>
            <form onSubmit={handlePenerimaanSubmit}>
              {detailPengadaan.map((item) => (
                <div key={item.idbarang} className="mb-4 flex items-center gap-4">
                  <span className="flex-1">{item.nama_barang}</span>
                  <input
                    type="number"
                    min="0"
                    max={item.jumlah}
                    value={penerimaanFormData[item.idbarang]?.jumlah || 0}
                    onChange={(e) => handleChange(item.idbarang.toString(), 'jumlah', e.target.value)}
                    className="w-24 px-2 py-1 border rounded"
                  />
                  <span className="text-sm text-gray-500">
                    Sisa: {item.jumlah}
                  </span>
                  <span className="text-sm text-gray-500">
                    Harga Satuan:
                  </span>
                  <input
                    type="number"
                    name="harga_satuan"
                    value={penerimaanFormData[item.idbarang]?.harga_satuan || item.harga_satuan || ''}
                    onChange={e => handleChange(item.idbarang.toString(), 'harga_satuan', e.target.value)}
                    placeholder="Harga Satuan"
                    className="w-24 px-2 py-1 border rounded"
                  />
                  <span className="text-sm text-gray-500">
                    Subtotal: {(penerimaanFormData[item.idbarang]?.subtotal || 0).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="mt-4 text-right">
                <span className="font-bold">Total Subtotal: {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsPenerimaanFormOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Simpan Penerimaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    
    
  );
};