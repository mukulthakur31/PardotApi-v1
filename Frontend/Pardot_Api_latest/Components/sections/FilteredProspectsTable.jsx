import React, { useState } from 'react';

export default function FilteredProspectsTable({ prospects, isLoading }) {
  const [sortField, setSortField] = useState('lastActivityAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  if (isLoading) {
    return (
      <div style={{
        background: "rgba(30, 41, 59, 0.6)",
        borderRadius: "16px",
        padding: "32px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        textAlign: "center"
      }}>
        <div style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
          Loading prospects...
        </div>
      </div>
    );
  }

  if (!prospects || prospects.length === 0) {
    return (
      <div style={{
        background: "rgba(30, 41, 59, 0.6)",
        borderRadius: "16px",
        padding: "32px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        textAlign: "center"
      }}>
        <div style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
          No prospects found matching the current filters.
        </div>
      </div>
    );
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const sortedProspects = [...prospects].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'lastActivityAt' || sortField === 'createdAt') {
      aValue = aValue ? new Date(aValue) : new Date(0);
      bValue = bValue ? new Date(bValue) : new Date(0);
    }

    if (sortField === 'score') {
      aValue = aValue || 0;
      bValue = bValue || 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedProspects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProspects = sortedProspects.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getActivityStatus = (lastActivity) => {
    if (!lastActivity) return { text: 'Never', color: '#ef4444' };
    
    const daysSince = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
    
    if (daysSince <= 7) return { text: `${daysSince}d ago`, color: '#10b981' };
    if (daysSince <= 30) return { text: `${daysSince}d ago`, color: '#f59e0b' };
    return { text: `${daysSince}d ago`, color: '#ef4444' };
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ color: '#64748b' }}>↕</span>;
    return <span style={{ color: '#3b82f6' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div style={{
      background: "rgba(30, 41, 59, 0.6)",
      borderRadius: "16px",
      padding: "24px",
      border: "1px solid rgba(255, 255, 255, 0.05)"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px"
      }}>
        <h3 style={{
          fontSize: "1.25rem",
          fontWeight: "600",
          margin: 0,
          color: "#f1f5f9"
        }}>
          Filtered Prospects ({prospects.length})
        </h3>
        
        {/* Pagination Info */}
        <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
          Page {currentPage} of {totalPages} ({prospects.length} total)
        </div>
      </div>

      {/* Table */}
      <div style={{
        overflowX: "auto",
        background: "rgba(15, 23, 42, 0.8)",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.05)"
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse"
        }}>
          <thead>
            <tr style={{ background: "rgba(30, 41, 59, 0.8)" }}>
              <th style={{
                padding: "12px 16px",
                textAlign: "left",
                color: "#cbd5e1",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: "pointer",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
              }} onClick={() => handleSort('firstName')}>
                Name <SortIcon field="firstName" />
              </th>
              <th style={{
                padding: "12px 16px",
                textAlign: "left",
                color: "#cbd5e1",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: "pointer",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
              }} onClick={() => handleSort('email')}>
                Email <SortIcon field="email" />
              </th>
              <th style={{
                padding: "12px 16px",
                textAlign: "left",
                color: "#cbd5e1",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: "pointer",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
              }} onClick={() => handleSort('score')}>
                Score <SortIcon field="score" />
              </th>
              <th style={{
                padding: "12px 16px",
                textAlign: "left",
                color: "#cbd5e1",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: "pointer",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
              }} onClick={() => handleSort('grade')}>
                Grade <SortIcon field="grade" />
              </th>
              <th style={{
                padding: "12px 16px",
                textAlign: "left",
                color: "#cbd5e1",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: "pointer",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
              }} onClick={() => handleSort('lastActivityAt')}>
                Last Activity <SortIcon field="lastActivityAt" />
              </th>
              <th style={{
                padding: "12px 16px",
                textAlign: "left",
                color: "#cbd5e1",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: "pointer",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
              }} onClick={() => handleSort('createdAt')}>
                Created <SortIcon field="createdAt" />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedProspects.map((prospect, index) => {
              const activityStatus = getActivityStatus(prospect.lastActivityAt);
              return (
                <tr key={prospect.id || index} style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  transition: "background-color 0.2s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                  <td style={{
                    padding: "12px 16px",
                    color: "#f1f5f9",
                    fontSize: "0.9rem"
                  }}>
                    <div>
                      <div style={{ fontWeight: "500" }}>
                        {prospect.firstName || ''} {prospect.lastName || ''}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                        {prospect.jobTitle || 'No Title'}
                      </div>
                    </div>
                  </td>
                  <td style={{
                    padding: "12px 16px",
                    color: "#cbd5e1",
                    fontSize: "0.9rem"
                  }}>
                    {prospect.email || 'No Email'}
                  </td>
                  <td style={{
                    padding: "12px 16px",
                    fontSize: "0.9rem"
                  }}>
                    <span style={{
                      background: prospect.score > 75 ? "rgba(34, 197, 94, 0.2)" : 
                                 prospect.score > 50 ? "rgba(245, 158, 11, 0.2)" : 
                                 "rgba(107, 114, 128, 0.2)",
                      color: prospect.score > 75 ? "#22c55e" : 
                             prospect.score > 50 ? "#f59e0b" : 
                             "#6b7280",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      fontWeight: "600"
                    }}>
                      {prospect.score || 0}
                    </span>
                  </td>
                  <td style={{
                    padding: "12px 16px",
                    color: "#cbd5e1",
                    fontSize: "0.9rem"
                  }}>
                    {prospect.grade || 'No Grade'}
                  </td>
                  <td style={{
                    padding: "12px 16px",
                    fontSize: "0.9rem"
                  }}>
                    <div>
                      <div style={{ color: activityStatus.color, fontWeight: "500" }}>
                        {activityStatus.text}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                        {formatDate(prospect.lastActivityAt)}
                      </div>
                    </div>
                  </td>
                  <td style={{
                    padding: "12px 16px",
                    color: "#94a3b8",
                    fontSize: "0.9rem"
                  }}>
                    {formatDate(prospect.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          marginTop: "20px"
        }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "8px 12px",
              background: currentPage === 1 ? "rgba(107, 114, 128, 0.2)" : "rgba(59, 130, 246, 0.2)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              color: currentPage === 1 ? "#6b7280" : "#3b82f6",
              borderRadius: "6px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              fontSize: "0.9rem"
            }}
          >
            Previous
          </button>
          
          <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 12px",
              background: currentPage === totalPages ? "rgba(107, 114, 128, 0.2)" : "rgba(59, 130, 246, 0.2)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              color: currentPage === totalPages ? "#6b7280" : "#3b82f6",
              borderRadius: "6px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              fontSize: "0.9rem"
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}