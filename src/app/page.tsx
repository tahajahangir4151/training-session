"use client";

import { OrderRow } from "@/types/type";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import Image from "next/image";
import React, { useEffect, useState } from "react";

function Home() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "product", headerName: "Product", flex: 1 },
    {
      field: "image",
      headerName: "Image",
      flex: 1,
      renderCell: (param) => {
        return (
          <Image
            src={param.value}
            alt={param.row.product}
           width={50}
           height={50}
          />
        );
      },
    },
    { field: "brand", headerName: "Brand", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    fetchOrders();
  }, [page, pageSize, debouncedSearch]);

  async function fetchOrders() {
    setLoading(true);

    const skip = page * pageSize;

    const url = search
      ? `https://dummyjson.com/products/search?q=${search}&limit=${pageSize}&skip=${skip}`
      : `https://dummyjson.com/products?limit=${pageSize}&skip=${skip}`;

    const res = await fetch(url);
    const data = await res.json();

    const mapped = data.products.map((item: any) => ({
      id: item.id,
      product: item.title,
      image: item.images[0],
      brand: item.brand,
      price: `$${item.price}`,
    }));

    setRows(mapped);
    setTotalRows(data.total);
    setLoading(false);
  }

  return (
    <div>
      <h2>Orders</h2>
      <input
        placeholder="Search product..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
        style={{
          padding: 8,
          marginBottom: 10,
          width: 250,
        }}
      />
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        rowCount={totalRows}
        paginationMode="server"
        pageSizeOptions={[5, 10, 20]}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(model: GridPaginationModel) => {
          setPage(model.page);
          setPageSize(model.pageSize);
        }}
        showToolbar
        onCellKeyDown={(params, event) => {
          if (event.key === "Enter") {
            alert(`Selected row: ${params.row.product} (${params.row.brand})`);
          }
          if (event.key === "Delete") {
            setRows((prev) => prev.filter((r) => r.id !== params.id));
          }
        }}
        tabNavigation="content"
      />
    </div>
  );
}

export default Home;
