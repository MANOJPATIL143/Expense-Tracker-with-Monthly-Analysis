import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FaTrash,
  FaEdit,
  FaRupeeSign,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import {
  listTransactionsAPI,
  updateTransactionAPI,
  deleteTransactionAPI,
} from "../../services/transactions/transactionService";
import { listCategoriesAPI } from "../../services/category/categoryService";
import "./swallcss.css";

const MySwal = withReactContent(Swal);

const TransactionList = () => {
  //!Filtering state
  // const itemsPerPage = 5;
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "",
    category: "",
  });

  //!Handle Filter Change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  //fetching
  const {
    data: categoriesData,
    isLoading: categoryLoading,
    error: categoryErr,
  } = useQuery({
    queryFn: listCategoriesAPI,
    queryKey: ["list-categories"],
  });
  //fetching
  const {
    data: transactions,
    isError,
    isLoading,
    isFetched,
    error,
    refetch,
  } = useQuery({
    queryFn: () => listTransactionsAPI(filters),
    queryKey: ["list-transactions", filters],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(transactions?.length / itemsPerPage);

  // Get transactions for the current page
  const paginatedTransactions = transactions?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizes = (e) => {
    setItemsPerPage(e.target.value);
  };

  const handleGenerateJSONReport = () => {
    if (!transactions || transactions.length === 0) {
      Swal.fire("No Data", "No transactions available to download.", "info");
      return;
    }

    // Create a new PDF document
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text("Transactions Report", 14, 15);

    // Format transaction data for the table
    const tableData = transactions.map((txn) => [
      txn.type.charAt(0).toUpperCase() + txn.type.slice(1), // Capitalize type
      txn.category,
      txn.amount,
      txn.description,
      new Date(txn.date).toLocaleDateString(), // Format Date
    ]);

    // Define table headers
    const headers = [["Type", "Category", "Amount", "Description", "Date"]];

    // Add autoTable
    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: 20,
      styles: { fontSize: 10 },
      theme: "striped",
      headStyles: { fillColor: [44, 62, 80] }, // Dark blue header
      bodyStyles: { textColor: [0, 0, 0] }, // Default black text
      didParseCell: function (data) {
        if (data.column.index === 0) {
          // Apply red color if type is 'Expense'
          if (data.cell.raw.toLowerCase() === "expense") {
            data.cell.styles.textColor = [255, 0, 0]; // Red color
          }
        }
      },
    });

    // Save the PDF
    doc.save(
      `transactions_report_${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  // Mutation for updating transaction
  const updateMutation = useMutation({
    mutationFn: ({ id, amount, description, type }) =>
      // console.log({ id, amount, description, type }),
      updateTransactionAPI(id, amount, description, type),
    onSuccess: () => {
      Swal.fire("Updated!", "Transaction updated successfully.", "success");
      refetch(); // Refresh the list after update
    },
    onError: (error) => {
      Swal.fire("Error!", error.message, "error");
    },
  });

  // Handle Update Transaction
  const handleUpdateTransaction = (transaction) => {
    console.log("Transaction to update:", transaction);

    MySwal.fire({
      title: "Edit Transaction",
      html: `
        <div class="swal-input-container">
          <input id="amount" type="number" class="swal2-input small-input" placeholder="Amount" value="${
            transaction.amount
          }" />
          <input id="description" type="text" class="swal2-input small-input" placeholder="Description" value="${
            transaction.description
          }" />
          <select id="type" class="swal2-select small-select">
            <option value="income" ${
              transaction.type === "income" ? "selected" : ""
            }>Income</option>
            <option value="expense" ${
              transaction.type === "expense" ? "selected" : ""
            }>Expense</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "small-swal",
        title: "small-swal-title",
        confirmButton: "small-swal-btn",
        cancelButton: "small-swal-btn",
      },
      preConfirm: () => {
        const amount = document.getElementById("amount").value.trim();
        const description = document.getElementById("description").value.trim();
        const type = document.getElementById("type").value;

        if (!amount || !description) {
          Swal.showValidationMessage("All fields are required");
          return false;
        }

        return { id: transaction._id, amount, description, type };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        updateMutation.mutate(result.value);
      }
    });
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = (transactionId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This transaction will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "small-swal", // Custom class for styling
        title: "small-swal-title",
        content: "small-swal-text",
        confirmButton: "small-swal-btn",
        cancelButton: "small-swal-btn",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // console.log("Deleted Transaction ID:", transactionId);
        deleteTransactionAPI(transactionId)
          .then(() => {
            Swal.fire({
              title: "Deleted!",
              text: "Transaction deleted successfully.",
              icon: "success",
              customClass: {
                popup: "small-swal",
                title: "small-swal-title",
                content: "small-swal-text",
                confirmButton: "small-swal-btn",
              },
            });
            refetch();
          })
          .catch((error) => {
            Swal.fire({
              title: "Error!",
              text: error.message,
              icon: "error",
              customClass: {
                popup: "small-swal",
                title: "small-swal-title",
                content: "small-swal-text",
                confirmButton: "small-swal-btn",
              },
            });
          });
      }
    });
  };

  return (
    <div className="my-4 p-4 shadow-lg rounded-lg bg-white">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Start Date */}
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="p-2 rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
        {/* End Date */}
        <input
          value={filters.endDate}
          onChange={handleFilterChange}
          type="date"
          name="endDate"
          className="p-2 rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
        {/* Type */}
        <div className="relative">
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="w-full p-2 rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 appearance-none"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <ChevronDownIcon className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
        {/* Category */}
        <div className="relative">
          <select
            value={filters.category}
            onChange={handleFilterChange}
            name="category"
            className="w-full p-2 rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 appearance-none"
          >
            <option value="All">All Categories</option>
            <option value="Uncategorized">Uncategorized</option>
            {categoriesData?.map((category) => {
              return (
                <option key={category?._id} value={category?.name}>
                  {category?.name}
                </option>
              );
            })}
          </select>
          <ChevronDownIcon className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>
      <div className="my-4 p-4 shadow-lg rounded-lg bg-white">
        {/* Inputs and selects for filtering (unchanged) */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-inner">
          {/* <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Filtered Transactions
          </h3> */}

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Filtered Transactions
            </h3>
            <button
              onClick={() => handleGenerateJSONReport()}
              className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-md shadow hover:bg-blue-600 transition"
            >
              <FaDownload className="mr-2" />
              Generate Report
            </button>
          </div>

          {paginatedTransactions?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {paginatedTransactions.map((transaction) => (
                <li
                  key={transaction._id}
                  className="bg-white p-3 rounded-md shadow border border-gray-200 flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                    <span
                      className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === "income"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.type.charAt(0).toUpperCase() +
                        transaction.type.slice(1)}
                    </span>
                    <span className="ml-2 text-gray-800">
                      {transaction.category?.name} -{" "}
                      <FaRupeeSign className="inline mr-2 text-blue-500" />
                      {transaction.amount.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600 italic ml-2">
                      {transaction.description}
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleUpdateTransaction(transaction)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-800 text-center">
              No transactions found
            </div>
          )}
          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-4 space-x-2">
            <span className="text-gray-700">
              Total Records: {transactions?.length}
            </span>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
            >
              <FaChevronLeft />
            </button>
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
            >
              <FaChevronRight />
            </button>
            <span className="text-gray-700">Showing per page</span>
            <select
              value={itemsPerPage}
              onChange={handlePageSizes}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
