import React, { useState } from 'react';

export default function ProspectFilters({ onFiltersChange, totalProspects, filteredCount }) {
  const [filters, setFilters] = useState({
    view: 'All Prospects',
    activity: 'Last Activity',
    time: 'All Time',
    customStartDate: '',
    customEndDate: '',
    tags: ''
  });

  const [showCustomDate, setShowCustomDate] = useState(false);

  const viewOptions = [
    'All Prospects',
    'Active Prospects',
    'Active Prospects For Review',
    'Assigned Prospects',
    'Mailable Prospects',
    'My Prospects',
    'My Starred Prospects',
    'Never Active Prospects',
    'Prospects Not In Salesforce',
    'Reviewed Prospects',
    'Unassigned Prospects',
    'Unmailable Prospects',
    'Unsubscribed Prospects',
    'Paused Prospects',
    'Undelivered Prospects'
  ];

  const activityOptions = [
    'Last Activity',
    'Created',
    'Updated',
    'First Assigned'
  ];

  const timeOptions = [
    'All Time',
    'Today',
    'Yesterday',
    'This Month',
    'This Quarter',
    'This Year',
    'Last 7 Days',
    'Last Week',
    'Last Month',
    'Last Quarter',
    'Last Year',
    'Custom'
  ];

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    
    if (filterType === 'time' && value === 'Custom') {
      setShowCustomDate(true);
    } else if (filterType === 'time' && value !== 'Custom') {
      setShowCustomDate(false);
      newFilters.customStartDate = '';
      newFilters.customEndDate = '';
    }
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCustomDateChange = (dateType, value) => {
    const newFilters = { ...filters, [dateType]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      view: 'All Prospects',
      activity: 'Last Activity',
      time: 'All Time',
      customStartDate: '',
      customEndDate: '',
      tags: ''
    };
    setFilters(defaultFilters);
    setShowCustomDate(false);
    onFiltersChange(defaultFilters);
  };

  return (
    <div style={{
      background: "rgba(30, 41, 59, 0.6)",
      borderRadius: "16px",
      padding: "24px",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      marginBottom: "24px"
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
          Prospect Filters
        </h3>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          <span style={{
            color: "#94a3b8",
            fontSize: "0.9rem"
          }}>
            Showing {filteredCount} of {totalProspects} prospects
          </span>
          <button
            onClick={clearFilters}
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid #ef4444",
              color: "#ef4444",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.8rem"
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "16px"
      }}>
        {/* View Filter */}
        <div>
          <label style={{
            display: "block",
            color: "#cbd5e1",
            fontSize: "0.9rem",
            marginBottom: "6px",
            fontWeight: "500"
          }}>
            View
          </label>
          <select
            value={filters.view}
            onChange={(e) => handleFilterChange('view', e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "6px",
              color: "#f1f5f9",
              fontSize: "0.9rem"
            }}
          >
            {viewOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Activity Filter */}
        <div>
          <label style={{
            display: "block",
            color: "#cbd5e1",
            fontSize: "0.9rem",
            marginBottom: "6px",
            fontWeight: "500"
          }}>
            Activity Type
          </label>
          <select
            value={filters.activity}
            onChange={(e) => handleFilterChange('activity', e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "6px",
              color: "#f1f5f9",
              fontSize: "0.9rem"
            }}
          >
            {activityOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Time Filter */}
        <div>
          <label style={{
            display: "block",
            color: "#cbd5e1",
            fontSize: "0.9rem",
            marginBottom: "6px",
            fontWeight: "500"
          }}>
            Time Period
          </label>
          <select
            value={filters.time}
            onChange={(e) => handleFilterChange('time', e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "6px",
              color: "#f1f5f9",
              fontSize: "0.9rem"
            }}
          >
            {timeOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Tags Filter */}
        <div>
          <label style={{
            display: "block",
            color: "#cbd5e1",
            fontSize: "0.9rem",
            marginBottom: "6px",
            fontWeight: "500"
          }}>
            Tags
          </label>
          <input
            type="text"
            value={filters.tags}
            onChange={(e) => handleFilterChange('tags', e.target.value)}
            placeholder="Enter tags (comma separated)"
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "6px",
              color: "#f1f5f9",
              fontSize: "0.9rem"
            }}
          />
        </div>
      </div>

      {/* Custom Date Range */}
      {showCustomDate && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginTop: "16px",
          padding: "16px",
          background: "rgba(15, 23, 42, 0.6)",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.05)"
        }}>
          <div>
            <label style={{
              display: "block",
              color: "#cbd5e1",
              fontSize: "0.9rem",
              marginBottom: "6px",
              fontWeight: "500"
            }}>
              Start Date
            </label>
            <input
              type="date"
              value={filters.customStartDate}
              onChange={(e) => handleCustomDateChange('customStartDate', e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(30, 41, 59, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                color: "#f1f5f9",
                fontSize: "0.9rem"
              }}
            />
          </div>
          <div>
            <label style={{
              display: "block",
              color: "#cbd5e1",
              fontSize: "0.9rem",
              marginBottom: "6px",
              fontWeight: "500"
            }}>
              End Date
            </label>
            <input
              type="date"
              value={filters.customEndDate}
              onChange={(e) => handleCustomDateChange('customEndDate', e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(30, 41, 59, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                color: "#f1f5f9",
                fontSize: "0.9rem"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}