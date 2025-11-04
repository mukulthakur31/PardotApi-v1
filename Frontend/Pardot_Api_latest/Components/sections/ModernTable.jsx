import React, { useState } from 'react';

export default function ModernTable({ data, columns, title, isLoading }) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  if (isLoading) {
    return (
      <div style={{
        background: "rgba(0, 0, 0, 0.2)",
        borderRadius: "16px",
        padding: "40px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        textAlign: "center"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(59, 130, 246, 0.3)",
          borderTop: "4px solid #3B82F6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 16px"
        }}></div>
        <p style={{ color: "#9CA3AF", margin: 0 }}>Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{
        background: "rgba(0, 0, 0, 0.2)",
        borderRadius: "16px",
        padding: "40px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
        <h3 style={{ color: "#F9FAFB", margin: "0 0 8px 0" }}>No Data Available</h3>
        <p style={{ color: "#9CA3AF", margin: 0 }}>No records found matching the current criteria.</p>
      </div>
    );
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{
      background: "rgba(0, 0, 0, 0.2)",
      borderRadius: "16px",
      padding: "32px",
      border: "1px solid rgba(255, 255, 255, 0.1)"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px"
      }}>
        <h3 style={{
          fontSize: "20px",
          fontWeight: "600",
          margin: 0,
          color: "#F9FAFB"
        }}>
          {title} ({data.length})
        </h3>
        
        <div style={{
          color: "#9CA3AF",
          fontSize: "14px"
        }}>
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Table */}
      <div style={{
        overflowX: "auto",
        background: "rgba(0, 0, 0, 0.3)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse"
        }}>
          <thead>
            <tr style={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
              borderBottom: "1px solid rgba(59, 130, 246, 0.2)"
            }}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && handleSort(column.key)}
                  style={{
                    padding: "16px 20px",
                    textAlign: "left",
                    color: "#F9FAFB",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: column.sortable ? "pointer" : "default",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    position: "relative"
                  }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    {column.label}
                    {column.sortable && (
                      <span style={{
                        color: sortField === column.key ? "#3B82F6" : "#6B7280",
                        fontSize: "12px"
                      }}>
                        {sortField === column.key 
                          ? (sortDirection === 'asc' ? '↑' : '↓')
                          : '↕'
                        }
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  transition: "background-color 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{
                      padding: "16px 20px",
                      color: "#E5E7EB",
                      fontSize: "14px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                    }}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
          marginTop: "24px"
        }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "8px 16px",
              background: currentPage === 1 ? "rgba(107, 114, 128, 0.2)" : "rgba(59, 130, 246, 0.2)",
              border: `1px solid ${currentPage === 1 ? "#6B7280" : "#3B82F6"}`,
              color: currentPage === 1 ? "#6B7280" : "#3B82F6",
              borderRadius: "8px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s ease"
            }}
          >
            Previous
          </button>
          
          <span style={{
            color: "#9CA3AF",
            fontSize: "14px",
            fontWeight: "500"
          }}>
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 16px",
              background: currentPage === totalPages ? "rgba(107, 114, 128, 0.2)" : "rgba(59, 130, 246, 0.2)",
              border: `1px solid ${currentPage === totalPages ? "#6B7280" : "#3B82F6"}`,
              color: currentPage === totalPages ? "#6B7280" : "#3B82F6",
              borderRadius: "8px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s ease"
            }}
          >
            Next
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}