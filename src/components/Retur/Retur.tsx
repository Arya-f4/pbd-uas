"use client";

import React, { useState, useEffect, useMemo } from "react";
import DataTable from "react-data-table-component";

interface Retur {
  idretur: number;
  created_at: string;
  idpenerimaan: number;
  iduser: number;
}

interface DetailRetur {
  iddetail_retur: number;
  jumlah: number;
  alasan: string;
  iddetail_penerimaan: number;
  idretur: number;
  nama_barang: string;
}

export default function ReturPage() {
  const [returs, setReturs] = useState<Retur[]>([]);
  const [detailReturs, setDetailReturs] = useState<DetailRetur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRetur, setSelectedRetur] = useState<number | null>(null);
  const [filterText, setFilterText] = useState("");
  const [detailFilterText, setDetailFilterText] = useState("");

  const fetchReturs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/retur");
      const data = await response.json();
      if (data.data) {
        setReturs(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch retur data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetailReturs = async (idretur: number) => {
    try {
      const response = await fetch(`/api/retur?idretur=${idretur}`);
      const data = await response.json();
      if (data.data) {
        setDetailReturs(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch detail retur:", error);
    }
  };

  useEffect(() => {
    fetchReturs();
  }, []);

  const handleDetailClick = async (idretur: number) => {
    setSelectedRetur(idretur);
    await fetchDetailReturs(idretur);
  };

  const returColumns = [
    { name: "ID Retur", selector: (row: Retur) => row.idretur, sortable: true },
    { name: "Tanggal Retur", selector: (row: Retur) => new Date(row.created_at).toLocaleString(), sortable: true },
    { name: "ID Penerimaan", selector: (row: Retur) => row.idpenerimaan, sortable: true },
    { name: "ID User", selector: (row: Retur) => row.iduser, sortable: true },
    {
      name: "Aksi",
      cell: (row: Retur) => (
        <button
          onClick={() => handleDetailClick(row.idretur)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-full text-sm"
        >
          Detail
        </button>
      ),
    },
  ];

  const detailReturColumns = [
    { name: "ID Detail Retur", selector: (row: DetailRetur) => row.iddetail_retur, sortable: true },
    { name: "Nama Barang", selector: (row: DetailRetur) => row.nama_barang, sortable: true },
    { name: "Jumlah", selector: (row: DetailRetur) => row.jumlah, sortable: true },
    { name: "Alasan", selector: (row: DetailRetur) => row.alasan, sortable: true },
    { name: "ID Detail Penerimaan", selector: (row: DetailRetur) => row.iddetail_penerimaan, sortable: true },
  ];

  const filteredReturs = useMemo(() => {
    return returs.filter((retur) => {
      return (
        retur.idretur.toString().toLowerCase().includes(filterText.toLowerCase()) ||
        new Date(retur.created_at).toLocaleString().toLowerCase().includes(filterText.toLowerCase()) ||
        retur.idpenerimaan.toString().toLowerCase().includes(filterText.toLowerCase()) ||
        retur.iduser.toString().toLowerCase().includes(filterText.toLowerCase())
      );
    });
  }, [returs, filterText]);

  const filteredDetailReturs = useMemo(() => {
    return detailReturs.filter((detailRetur) => {
      return (
        detailRetur.iddetail_retur.toString().toLowerCase().includes(detailFilterText.toLowerCase()) ||
        detailRetur.nama_barang.toLowerCase().includes(detailFilterText.toLowerCase()) ||
        detailRetur.jumlah.toString().toLowerCase().includes(detailFilterText.toLowerCase()) ||
        detailRetur.alasan.toLowerCase().includes(detailFilterText.toLowerCase()) ||
        detailRetur.iddetail_penerimaan.toString().toLowerCase().includes(detailFilterText.toLowerCase())
      );
    });
  }, [detailReturs, detailFilterText]);

  const subHeaderComponent = (
    <input
      type="text"
      placeholder="Cari..."
      value={filterText}
      onChange={(e) => setFilterText(e.target.value)}
      className="border border-gray-300 rounded px-2 py-1 mb-2"
    />
  );

  const detailSubHeaderComponent = (
    <input
      type="text"
      placeholder="Cari detail..."
      value={detailFilterText}
      onChange={(e) => setDetailFilterText(e.target.value)}
      className="border border-gray-300 rounded px-2 py-1 mb-2"
    />
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Daftar Retur</h1>

      <DataTable
        columns={returColumns}
        data={filteredReturs}
        progressPending={isLoading}
        pagination
        responsive
        subHeader
        subHeaderComponent={subHeaderComponent}
      />

      {selectedRetur && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Detail Retur untuk ID: {selectedRetur}</h2>
          <DataTable
            columns={detailReturColumns}
            data={filteredDetailReturs}
            pagination
            responsive
            subHeader
            subHeaderComponent={detailSubHeaderComponent}
          />
        </div>
      )}
    </div>
  );
}