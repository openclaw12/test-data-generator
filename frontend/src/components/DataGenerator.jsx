// DataGenerator Component - Generate and export test data

import React, { useState } from 'react';

export function DataGenerator({ template }) {
  const [count, setCount] = useState(100);
  const [format, setFormat] = useState('json');
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Generate test data
  const handleGenerate = async () => {
    setGenerating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            templateId: template.id,
            count: parseInt(count),
            format
          })
        }
      );

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError('Error generating data: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  // Export data
  const handleExport = () => {
    if (!data) return;

    let content, filename, type;

    if (format === 'csv') {
      // Convert to CSV
      const fields = JSON.parse(template.fields);
      const headers = fields.map(f => f.name).join(',');
      const rows = data.map(row =>
        fields.map(f => {
          const val = row[f.name];
          if (typeof val === 'string' && val.includes(',')) {
            return `"${val}"`;
          }
          return val;
        }).join(',')
      );
      content = [headers, ...rows].join('\n');
      filename = `${template.name}-${Date.now()}.csv`;
      type = 'text/csv';
    } else if (format === 'excel') {
      // Simple Excel format (you would use xlsx library in production)
      content = JSON.stringify(data, null, 2);
      filename = `${template.name}-${Date.now()}.xlsx`;
      type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else {
      // JSON
      content = JSON.stringify(data, null, 2);
      filename = `${template.name}-${Date.now()}.json`;
      type = 'application/json';
    }

    // Download
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert('Data copied to clipboard!');
  };

  return (
    <div className="data-generator">
      <h2>Generate Test Data</h2>

      <div className="template-info">
        <h3>{template.name}</h3>
        <p>{template.description}</p>
      </div>

      {/* Generate Options */}
      <div className="generator-options">
        <div className="form-group">
          <label>Number of Records</label>
          <input
            type="number"
            min="1"
            max="10000"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Export Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary"
        >
          {generating ? '⏳ Generating...' : '⚡ Generate Data'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Preview */}
      {data && (
        <div className="data-preview">
          <h3>Preview ({data.length} records)</h3>

          <div className="preview-actions">
            <button onClick={handleExport} className="btn-secondary">
              💾 Download {format.toUpperCase()}
            </button>
            <button onClick={handleCopy} className="btn-secondary">
              📋 Copy to Clipboard
            </button>
          </div>

          {/* Table Preview */}
          {format === 'json' ? (
            <pre className="data-view">
              {JSON.stringify(data.slice(0, 10), null, 2)}
              {data.length > 10 && `\n... and ${data.length - 10} more records`}
            </pre>
          ) : (
            <div className="table-preview">
              <table>
                <thead>
                  <tr>
                    {JSON.parse(template.fields).map(field => (
                      <th key={field.name}>{field.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 20).map((row, idx) => (
                    <tr key={idx}>
                      {JSON.parse(template.fields).map(field => (
                        <td key={field.name}>
                          {typeof row[field.name] === 'object'
                            ? JSON.stringify(row[field.name])
                            : String(row[field.name])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 20 && (
                <p className="more-data">
                  Showing 20 of {data.length} records. Download to see all.
                </p>
              )}
            </div>
          )}

          <div className="stats">
            <p>✅ Generated {data.length} records</p>
            <p>📦 Size: {(JSON.stringify(data).length / 1024).toFixed(2)} KB</p>
          </div>
        </div>
      )}
    </div>
  );
}
