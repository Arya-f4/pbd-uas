"use client";

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";

interface Penerimaan {
  idpenerimaan: number;
  created_at: string;
  status: string;
  idpengadaan: number;
  iduser: number;
  pengadaan_no: string;
  user_name: string;
  total_items: number;
  received_items: number;
}

interface DetailPenerimaan {
  iddetail_penerimaan: number;
  idpenerimaan: number;
  idbarang: number;
  nama_barang: string;
  jumlah: number;
  jumlah_diterima: number;
  harga_satuan: number;
}

interface ReturFormData {
  idpenerimaan: number;
  details: {
    idbarang: number;
    jumlah: number;
    alasan: string;
  }[];
}

export default function PenerimaanPage() {
  const [penerimaan, setPenerimaan] = useState<Penerimaan[]>([]);
  const [detailPenerimaan, setDetailPenerimaan] = useState<DetailPenerimaan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReturOpen, setIsReturOpen] = useState(false);
  const [selectedPenerimaan, setSelectedPenerimaan] = useState<Penerimaan | null>(null);
  const [returFormData, setReturFormData] = useState<ReturFormData>({
    idpenerimaan: 0,
    details: []
  });

  const fetchPenerimaan = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/penerimaan");
      const result = await response.json();
      if (result.data) {
        setPenerimaan(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch penerimaan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetailPenerimaan = async (idpenerimaan: number) => {
    try {
      const response = await fetch(`/api/penerimaan/${idpenerimaan}`);
      const result = await response.json();
      if (result.data) {
        setDetailPenerimaan(result.data);
        setReturFormData({
          idpenerimaan,
          details: result.data.map((detail: DetailPenerimaan) => ({
            idbarang: detail.idbarang,
            jumlah: 0,
            alasan: ""
          }))
        });
      }
    } catch (error) {
      console.error("Failed to fetch detail penerimaan:", error);
    }
  };

  useEffect(() => {
    fetchPenerimaan();
  }, []);

  const handleReturSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/retur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(returFormData),
      });
      if (response.ok) {
        setIsReturOpen(false);
        fetchPenerimaan();
      } else {
        throw new Error("Failed to submit retur");
      }
    } catch (error) {
      console.error("Error submitting retur:", error);
    }
  };

  const handleReturDetailChange = (idbarang: number, field: 'jumlah' | 'alasan', value: string) => {
    setReturFormData(prev => ({
      ...prev,
      details: prev.details.map(detail => 
        detail.idbarang === idbarang
          ? { ...detail, [field]: field === 'jumlah' ? parseInt(value) || 0 : value }
          : detail
      )
    }));
  };

  const getReceptionStatus = (row: Penerimaan) => {
    if (row.received_items === 0) return "Not Yet Received";
    if (row.received_items === row.total_items) return "Fully Received";
    return "Partially Received";
  };

  const columns = [
    { name: "ID", selector: (row: Penerimaan) => row.idpenerimaan, sortable: true },
    { name: "Created At", selector: (row: Penerimaan) => new Date(row.created_at).toLocaleString(), sortable: true },
    { 
      name: "Status", 
      selector: (row: Penerimaan) => getReceptionStatus(row),
      sortable: true,
      cell: (row: Penerimaan) => (
        <span className={`px-2 py-1 rounded text-sm ${
          row.received_items === 0 ? 'bg-red-100 text-red-800' :
          row.received_items === row.total_items ? 'bg-green-100 text-green-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {getReceptionStatus(row)}
        </span>
      )
    },
    { name: "Pengadaan No", selector: (row: Penerimaan) => row.pengadaan_no, sortable: true },
    { name: "User", selector: (row: Penerimaan) => row.user_name, sortable: true },
    {
      name: "Progress",
      selector: (row: Penerimaan) => `${row.received_items}/${row.total_items}`,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: Penerimaan) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedPenerimaan(row);
              fetchDetailPenerimaan(row.idpenerimaan);
              setIsDetailOpen(true);
            }}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Detail
          </button>
          {row.received_items > 0 && (
            <button
              onClick={() => {
                setSelectedPenerimaan(row);
                fetchDetailPenerimaan(row.idpenerimaan);
                setIsReturOpen(true);
              }}
              className="bg-red-500 text-white p-2 rounded"
            >
              Return
            </button>
          )}
        </div>
      ),
    },
  ];

  const detailColumns = [
    { name: "Product", selector: (row: DetailPenerimaan) => row.nama_barang, sortable: true },
    { name: "Quantity Ordered", selector: (row: DetailPenerimaan) => row.jumlah, sortable: true },
    { name: "Quantity Received", selector: (row: DetailPenerimaan) => row.jumlah_diterima, sortable: true },
    { name: "Unit Price", selector: (row: DetailPenerimaan) => `Rp ${row.harga_satuan.toLocaleString()}`, sortable: true },
    { 
      name: "Status",
      cell: (row: DetailPenerimaan) => (
        <span className={`px-2 py-1 rounded text-sm ${
          row.jumlah_diterima === 0 ? 'bg-red-100 text-red-800' :
          row.jumlah_diterima === row.jumlah ? 'bg-green-100 text-green-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.jumlah_diterima === 0 ? 'Not Received' :
           row.jumlah_diterima === row.jumlah ? 'Fully Received' :
           'Partially Received'}
        </span>
      )
    }
  ];

  return (
    <div className="container mx-auto p-4 lg:pl-64">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Daftar Penerimaan</h1>
        <DataTable
          columns={columns}
          data={penerimaan}
          progressPending={isLoading}
          pagination
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          highlightOnHover
          responsive
        />
      </div>

      {isDetailOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <h2 className="text-xl font-bold mb-4">Detail Penerimaan</h2>
            <DataTable
              columns={detailColumns}
              data={detailPenerimaan}
              pagination
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
              highlightOnHover
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

      {isReturOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <h2 className="text-xl font-bold mb-4">Return Form</h2>
            <form onSubmit={handleReturSubmit}>
              <div className="grid gap-4 py-4">
                {detailPenerimaan.map((detail) => (
                  <div key={detail.idbarang} className="grid gap-2">
                    <label htmlFor={`quantity-${detail.idbarang}`} className="font-medium">{detail.nama_barang}</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          id={`quantity-${detail.idbarang}`}
                          type="number"
                          min="0"
                          max={detail.jumlah_diterima}
                          value={returFormData.details.find(d => d.idbarang === detail.idbarang)?.jumlah || 0}
                          onChange={(e) => handleReturDetailChange(detail.idbarang, 'jumlah', e.target.value)}
                          placeholder="Quantity to return"
                          className="w-full p-2 border rounded"
                        />
                        <span className="text-sm text-gray-500 mt-1 block">
                          Max: {detail.jumlah_diterima}
                        </span>
                      </div>
                      <input
                        id={`reason-${detail.idbarang}`}
                        value={returFormData.details.find(d => d.idbarang === detail.idbarang)?.alasan || ''}
                        onChange={(e) => handleReturDetailChange(detail.idbarang, 'alasan', e.target.value)}
                        placeholder="Reason for return"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button type="button" onClick={() => setIsReturOpen(false)} className="bg-gray-300 text-black p-2 rounded">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                  Submit Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}