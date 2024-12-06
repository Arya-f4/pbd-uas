"use client";

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";

interface User {
  iduser: number;
  username: string;
  idrole: number;
}

export default function UserManage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    idrole: 2,
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to add user");
      await fetchUsers();
      setIsAddDialogOpen(false);
      setNewUser({ username: "", password: "", idrole: 2 });
      alert("User added successfully");
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user. Please try again.");
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingUser),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update user");
      await fetchUsers();
      setIsEditDialogOpen(false);
      setEditingUser(null);
      alert("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  const handleDeleteUser = async (iduser: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ iduser }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete user");
      await fetchUsers();
      alert("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const columns = [
    {
      name: "ID",
      selector: (row: User) => row.iduser,
      sortable: true,
    },
    {
      name: "Username",
      selector: (row: User) => row.username,
      sortable: true,
    },
    {
      name: "Role",
      selector: (row: User) => (row.idrole === 1 ? "Admin" : "User"),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: User) => (
        <div>
          <button
            onClick={() => {
              setEditingUser(row);
              setIsEditDialogOpen(true);
            }}
            style={{
              marginRight: "8px",
              padding: "4px 8px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteUser(row.iduser)}
            style={{
              padding: "4px 8px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
      >
        User Management
      </h1>
      <button
        onClick={() => setIsAddDialogOpen(true)}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
      >
        Add User
      </button>
      <DataTable
        columns={columns}
        data={users}
        pagination
        paginationRowsPerPageOptions={[10, 20, 30]}
        responsive
        highlightOnHover
        subHeader
        subHeaderComponent={
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) =>
              setUsers(
                users.filter((user) =>
                  user.username
                    .toLowerCase()
                    .includes(e.target.value.toLowerCase()),
                ),
              )
            }
            className="rounded border p-2 dark:bg-gray-800"
          />
        }
      />

      {isAddDialogOpen && (
        // ... existing code ...
        <div className="fixed inset-0 z-99 flex items-center justify-center bg-gray-50 bg-opacity-50">
          <div
            className="w-72 rounded-lg bg-white p-6 shadow-lg" // Ganti style dengan Tailwind CSS
          >
            <h2 className="mb-4">Add New User</h2>
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
              className="mb-2 w-full rounded border p-1" // Ganti style dengan Tailwind CSS
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              className="mb-2 w-full rounded border p-1" // Ganti style dengan Tailwind CSS
            />
            <select
              value={newUser.idrole}
              onChange={(e) =>
                setNewUser({ ...newUser, idrole: parseInt(e.target.value) })
              }
              className="mb-4 w-full rounded border p-1" // Ganti style dengan Tailwind CSS
            >
              <option value={2}>User</option>
              <option value={1}>Admin</option>
            </select>
            <button
              onClick={handleAddUser}
              className="mr-2 rounded bg-blue-500 px-4 py-2 text-white" // Ganti style dengan Tailwind CSS
            >
              Add User
            </button>
            <button
              onClick={() => setIsAddDialogOpen(false)}
              className="rounded bg-gray-300 px-4 py-2 text-white" // Ganti style dengan Tailwind CSS
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isEditDialogOpen && editingUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "300px",
            }}
          >
            <h2 style={{ marginBottom: "16px" }}>Edit User</h2>
            <input
              type="text"
              placeholder="Username"
              value={editingUser.username}
              onChange={(e) =>
                setEditingUser({ ...editingUser, username: e.target.value })
              }
              className="w-full rounded border p-2"
            />
            <select
              value={editingUser.idrole}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  idrole: parseInt(e.target.value),
                })
              }
              className="w-full rounded border p-2"
            >
              <option value={2}>User</option>
              <option value={1}>Admin</option>
            </select>
            <button
              onClick={handleEditUser}
              className="rounded bg-blue-500 px-4 py-2 text-white"
            >
              Update User
            </button>
            <button
              onClick={() => setIsEditDialogOpen(false)}
              className="rounded bg-gray-300 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
