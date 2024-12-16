"use client";

import React, { useState, useEffect, useMemo } from "react";
import DataTable from 'react-data-table-component';

interface Penerimaan {
  idpengadaan: number;
  idpenerimaan: number;
  reception_date: string;
  status: string;
  received_by: string;
  nama_barang: string;
  jumlah_dipesan: number;
  total_diterima: number;
  sisa_barang: number;
}

interface ReturFormData {
  idpenerimaan: number;
  iduser: number;
  details: {
    idbarang: number;
    jumlah: number;
    alasan: string;
    iddetail_penerimaan: number;
  }[];
}

interface DetailPenerimaan {
  idpenerimaan: number;
  reception_date: string;
  received_by: string;
  nama_barang: string;
  jumlah_terima: number;
  harga_satuan_terima: number;
  sub_total_terima: number;
  iddetail_penerimaan: number;
}

export default function PenerimaanPage() {
  const [penerimaan, setPenerimaan] = useState<Penerimaan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPengadaan, setSelectedPengadaan] = useState<number | null>(null);
  const [detailPenerimaan, setDetailPenerimaan] = useState<DetailPenerimaan[]>([]);
  const [returFormData, setReturFormData] = useState<ReturFormData>({
    idpenerimaan: 0,
    iduser: 1, // Replace with actual user ID
    details: []
  });
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  const [returQuantity, setReturQuantity] = useState(0);
  const [returReason, setReturReason] = useState('');
  const [maxReturQuantity, setMaxReturQuantity] = useState(0);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

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

  const fetchDetailPenerimaan = async (idpengadaan: number) => {
    try {
      const response = await fetch(`/api/penerimaan/${idpengadaan}/detail`);
      const result = await response.json();
      if (result.data) {
        setDetailPenerimaan(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch detail penerimaan:", error);
    }
  };

  useEffect(() => {
    fetchPenerimaan();
  }, []);

  const handleDetailClick = async (idpengadaan: number) => {
    setSelectedPengadaan(idpengadaan);
    await fetchDetailPenerimaan(idpengadaan);
    setIsDetailModalOpen(true);
  };

  const handleReturSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    if (!selectedValue) {
      return;
    }

    const [idpenerimaan, index] = selectedValue.split('-').map(Number);

    if (isNaN(idpenerimaan) || isNaN(index)) {
      console.error("Invalid ID selected:", selectedValue);
      return;
    }

    const selectedDetailPenerimaan = detailPenerimaan[index];

    if (selectedDetailPenerimaan) {
      setSelectedDetailId(selectedDetailPenerimaan.iddetail_penerimaan);
      setReturFormData(prev => ({
        ...prev,
        idpenerimaan: idpenerimaan,
      }));

      setReturQuantity(0);
      setMaxReturQuantity(selectedDetailPenerimaan.jumlah_terima);
      setReturReason('');
    } else {
      console.log("Detail penerimaan not found for selected ID:", idpenerimaan);
    }
  };

  const handleReturSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDetailId) {
      alert("Please select a detail penerimaan first");
      return;
    }

    const selectedDetailPenerimaan = detailPenerimaan.find(d => d.iddetail_penerimaan === selectedDetailId);

    if (!selectedDetailPenerimaan) {
      alert("Selected detail penerimaan not found");
      return;
    }

    const returData: ReturFormData = {
      idpenerimaan: selectedDetailPenerimaan.idpenerimaan,
      iduser: 1, // Replace with actual user ID
      details: [{
        idbarang: 0, // We don't have this information in the current data structure
        jumlah: returQuantity,
        alasan: returReason,
        iddetail_penerimaan: selectedDetailId
      }]
    };

    try {
      const response = await fetch("/api/retur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(returData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Retur submitted successfully!");
        setIsDetailModalOpen(false);
        fetchPenerimaan();
      } else {
        alert(`Error: ${result.message || "Failed to submit retur"}`);
      }
    } catch (error) {
      console.error("Error submitting retur:", error);
      alert("An unexpected error occurred");
    }
  };

  const columns = [
    {
      name: 'ID Penerimaan',
      selector: (row: Penerimaan) => row.idpenerimaan,
      sortable: true,
    },
    {
      name: 'ID Pengadaan',
      selector: (row: Penerimaan) => row.idpengadaan,
      sortable: true,
    },
    {
      name: 'Nama Barang',
      selector: (row: Penerimaan) => row.nama_barang,
      sortable: true,
    },
    {
      name: 'Jumlah Dipesan',
      selector: (row: Penerimaan) => row.jumlah_dipesan,
      sortable: true,
    },
    {
      name: 'Jumlah Diterima Total',
      selector: (row: Penerimaan) => row.total_diterima,
      sortable: true,
    },
    {
      name: 'Sisa Barang',
      selector: (row: Penerimaan) => row.sisa_barang,
      sortable: true,
    },
    {
      name: 'Status Penerimaan',
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
            row.status === 'A' ? 'Partially Received' :
            row.status === 'D' ? 'Cancelled' :
            'Pending'
          }
        </span>
      )
    },
    {
      name: 'User Penerima',
      selector: (row: Penerimaan) => row.received_by,
      sortable: true,
    },
    {
      name: 'Tanggal Penerimaan',
      selector: (row: Penerimaan) => row.reception_date,
      sortable: true,
      format: (row: Penerimaan) => new Date(row.reception_date).toLocaleString(),
    },
    {
      name: 'Aksi',
      cell: (row: Penerimaan) => (
        <button
          onClick={() => handleDetailClick(row.idpengadaan)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-full text-sm transition duration-300"
        >
          Detail
        </button>
      ),
    },
  ];

  const filteredItems = penerimaan.filter(
    item =>
      item.idpenerimaan.toString().toLowerCase().includes(filterText.toLowerCase()) ||
      item.idpengadaan.toString().toLowerCase().includes(filterText.toLowerCase()) ||
      item.nama_barang.toLowerCase().includes(filterText.toLowerCase()) ||
      item.status.toLowerCase().includes(filterText.toLowerCase()) ||
      item.received_by.toLowerCase().includes(filterText.toLowerCase())
  );

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
      }
    };

    return (
      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search Penerimaan..."
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={handleClear} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none transition duration-300">
          Clear
        </button>
      </div>
    );
  }, [filterText, resetPaginationToggle]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Daftar Penerimaan</h1>

      <DataTable
        columns={columns}
        data={filteredItems}
        progressPending={isLoading}
        pagination
        paginationResetDefaultPage={resetPaginationToggle}
        subHeader
        subHeaderComponent={subHeaderComponentMemo}
        persistTableHead
        responsive
        highlightOnHover
        pointerOnHover
      />

      {isDetailModalOpen && selectedPengadaan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Detail Penerimaan untuk Pengadaan ID: {selectedPengadaan}</h2>

            <DataTable
              columns={[
                { name: 'ID Penerimaan', selector: (row: DetailPenerimaan) => row.idpenerimaan },
                { name: 'Tanggal Penerimaan', selector: (row: DetailPenerimaan) => new Date(row.reception_date).toLocaleString() },
                { name: 'User Penerima', selector: (row: DetailPenerimaan) => row.received_by },
                { name: 'Nama Barang', selector: (row: DetailPenerimaan) => row.nama_barang },
                { name: 'Jumlah Diterima', selector: (row: DetailPenerimaan) => row.jumlah_terima },
                { name: 'Harga Satuan', selector: (row: DetailPenerimaan) => row.harga_satuan_terima },
                { name: 'Sub Total', selector: (row: DetailPenerimaan) => row.sub_total_terima },
              ]}
              data={detailPenerimaan}
              pagination
              responsive
              highlightOnHover
            />

            <h3 className="text-lg font-semibold mt-6 mb-4 text-gray-800">Form Retur Barang</h3>
            <form onSubmit={handleReturSubmit} className="space-y-4">
              <div>
                <label htmlFor="detailPenerimaan" className="block text-sm font-medium text-gray-700">
                  Pilih Detail Penerimaan
                </label>
                <select
                  id="detailPenerimaan"
                  value={selectedDetailId ? `${returFormData.idpenerimaan}-${detailPenerimaan.findIndex(d => d.iddetail_penerimaan === selectedDetailId)}` : ''}
                  onChange={handleReturSelect}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                >
                  <option value="">Pilih Detail Penerimaan</option>
                  {detailPenerimaan.map((detail, index) => (
                    <option
                      key={`${detail.idpenerimaan}-${index}`}
                      value={`${detail.idpenerimaan}-${index}`}
                    >
                      {`${detail.idpenerimaan} - ${detail.nama_barang} (${detail.jumlah_terima} tersedia)`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700">Jumlah Retur</label>
                <input
                  id="jumlah"
                  type="number"
                  value={returQuantity}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value, 10);
                    if (!isNaN(newValue) && newValue >= 0 && newValue <= maxReturQuantity) {
                      setReturQuantity(newValue);
                    }
                  }}
                  min="0"
                  max={maxReturQuantity}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">Maximum: {maxReturQuantity}</p>
              </div>
              <div>
                <label htmlFor="alasan" className="block text-sm font-medium text-gray-700">Alasan Retur</label>
                <textarea
                  id="alasan"
                  value={returReason}
                  onChange={(e) => setReturReason(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition duration-300"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={!selectedDetailId || returQuantity <= 0}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                >
                  Submit Retur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}