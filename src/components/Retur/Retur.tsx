"use client";
import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { toast } from 'react-toastify'; // For notifications

interface Retur {
  idretur: number;
  timestamp: string;
  vendor_idvendor: number;
  nama_vendor: string;
  status: string;
}

interface DetailRetur {
  iddetail_retur: number;
  idbarang: number;
  nama_barang: string;
  jumlah: number;
  alasan: string;
}

export default function BarangRetur() {
  const [returs, setReturs] = useState<Retur[]>([]);
  const [detailReturs, setDetailReturs] = useState<DetailRetur[]>([]);
  const [selectedRetur, setSelectedRetur] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [returnQuantity, setReturnQuantity] = useState<number>(0);
  const [returnReason, setReturnReason] = useState<string>("");

  // Fetch data for retur and detail retur
  const fetchReturs = async () => {
    try {
      const response = await fetch("/api/retur");
      const data = await response.json();
      setReturs(data);
    } catch (error) {
      console.error("Failed to fetch retur data:", error);
    }
  };

  const fetchDetailReturs = async () => {
    try {
      const response = await fetch("/api/detail_retur");
      const data = await response.json();
      setDetailReturs(data);
    } catch (error) {
      console.error("Failed to fetch detail retur:", error);
    }
  };

  const handleReturnGoods = async () => {
    if (selectedRetur !== null && returnQuantity > 0 && returnReason) {
      try {
        // Simulate saving return data
        const response = await fetch(`/api/retur/${selectedRetur}`, {
          method: "POST",
          body: JSON.stringify({ returnQuantity, returnReason }),
          headers: { "Content-Type": "application/json" },
        });
       
        if (response.ok) {
          toast.success("Return processed successfully!");
          fetchReturs();  // Refresh the retur data after saving
          setIsModalOpen(false);
        } else {
          toast.error("Failed to process return.");
        }
      } catch (error) {
        console.error("Error during return:", error);
        toast.error("An error occurred.");
      }
    } else {
      toast.warning("Please enter valid return quantity and reason.");
    }
  };

  useEffect(() => {
    fetchReturs();
    fetchDetailReturs();
  }, []);

  const returColumns = [
    { name: "ID", selector: (row: Retur) => row.idretur, sortable: true },
    { name: "Vendor", selector: (row: Retur) => row.nama_vendor, sortable: true },
    { name: "Status", selector: (row: Retur) => row.status, sortable: true },
    {
      name: "Actions",
      cell: (row: Retur) => (
        <button
          onClick={() => {
            setSelectedRetur(row.idretur);
            setIsModalOpen(true);
          }}
          className="bg-red-500 text-white p-2 rounded"
        >
          Process Return
        </button>
      ),
    },
  ];

  const detailReturColumns = [
    { name: "ID", selector: (row: DetailRetur) => row.iddetail_retur, sortable: true },
    { name: "Item", selector: (row: DetailRetur) => row.nama_barang, sortable: true },
    { name: "Quantity", selector: (row: DetailRetur) => row.jumlah, sortable: true },
    { name: "Reason", selector: (row: DetailRetur) => row.alasan, sortable: true },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Goods Return</h1>
      
      {/* Main Return Table */}
      <DataTable
        columns={returColumns}
        data={returs}
        progressPending={false}
        pagination
        highlightOnHover
        responsive
      />

      {/* Return Details Table */}
      <h2 className="text-xl font-semibold mt-6">Return Details</h2>
      <DataTable
        columns={detailReturColumns}
        data={detailReturs.filter((retur) => retur.idretur === selectedRetur)}
        progressPending={false}
        pagination
        highlightOnHover
        responsive
      />

      {/* Modal for Processing Return */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <h2 className="text-xl font-bold mb-4">Process Return</h2>
            <div className="mb-4">
              <label htmlFor="returnQuantity" className="block text-sm font-medium text-gray-700">
                Return Quantity
              </label>
              <input
                id="returnQuantity"
                type="number"
                className="w-full p-2 border rounded"
                value={returnQuantity}
                onChange={(e) => setReturnQuantity(Number(e.target.value))}
                min={1}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="returnReason" className="block text-sm font-medium text-gray-700">
                Return Reason
              </label>
              <textarea
                id="returnReason"
                className="w-full p-2 border rounded"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-300 text-black p-2 rounded mr-2">
                Cancel
              </button>
              <button
                onClick={handleReturnGoods}
                className="bg-red-500 text-white p-2 rounded"
                disabled={false}
              >
                Process Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
