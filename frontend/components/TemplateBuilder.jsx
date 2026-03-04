// TemplateBuilder Component - Drag & Drop Template Editor

import React, { useState } from 'react';

export function TemplateBuilder({ template, onTemplateCreated }) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [fields, setFields] = useState(template?.fields ? JSON.parse(template.fields) : []);
  const [newField, setNewField] = useState({ name: '', type: 'number', min: 0, max: 100 });

  // Add field
  const addField = () => {
    if (newField.name.trim()) {
      setFields([...fields, { ...newField }]);
      setNewField({ name: '', type: 'number', min: 0, max: 100 });
    }
  };

  // Remove field
  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  // Update field
  const updateField = (index, updates) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  // Save template
  const saveTemplate = async () => {
    const token = localStorage.getItem('token');
    const method = template?.id ? 'PUT' : 'POST';
    const url = template?.id 
      ? `${process.env.REACT_APP_API_URL}/api/templates/${template.id}`
      : `${process.env.REACT_APP_API_URL}/api/templates`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          fields
        })
      });

      const data = await response.json();
      onTemplateCreated(data);
      alert('Template saved successfully!');
    } catch (error) {
      alert('Error saving template: ' + error.message);
    }
  };

  return (
    <div className="template-builder">
      <h2>Template Builder</h2>

      {/* Template Info */}
      <div className="form-group">
        <label>Template Name *</label>
        <input
          type="text"
          placeholder="e.g., Material Tensile Testing"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          placeholder="What is this template used for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
        />
      </div>

      {/* Field Builder */}
      <div className="field-builder">
        <h3>Fields ({fields.length})</h3>

        {/* Add New Field */}
        <div className="add-field">
          <input
            type="text"
            placeholder="Field name"
            value={newField.name}
            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
          />

          <select
            value={newField.type}
            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
          >
            <option value="number">Number</option>
            <option value="string">String</option>
            <option value="date">Date</option>
            <option value="boolean">Boolean</option>
            <option value="enum">Dropdown (Enum)</option>
          </select>

          <button onClick={addField} className="btn-secondary">
            + Add Field
          </button>
        </div>

        {/* Field List */}
        <div className="fields-list">
          {fields.length === 0 ? (
            <p className="empty">No fields yet. Add your first field above.</p>
          ) : (
            fields.map((field, index) => (
              <div key={index} className="field-item">
                <div className="field-header">
                  <strong>{field.name}</strong>
                  <span className="field-type">{field.type}</span>
                </div>

                <div className="field-config">
                  {field.type === 'number' && (
                    <>
                      <div className="inline-inputs">
                        <label>Min:</label>
                        <input
                          type="number"
                          value={field.min}
                          onChange={(e) => updateField(index, { min: parseFloat(e.target.value) })}
                        />
                        <label>Max:</label>
                        <input
                          type="number"
                          value={field.max}
                          onChange={(e) => updateField(index, { max: parseFloat(e.target.value) })}
                        />
                      </div>

                      <select
                        value={field.distribution || 'uniform'}
                        onChange={(e) => updateField(index, { distribution: e.target.value })}
                      >
                        <option value="uniform">Uniform Distribution</option>
                        <option value="normal">Normal Distribution</option>
                        <option value="weighted">Weighted (Towards Mean)</option>
                      </select>

                      {field.unit && (
                        <input
                          type="text"
                          placeholder="Unit (e.g., kg, celsius)"
                          value={field.unit}
                          onChange={(e) => updateField(index, { unit: e.target.value })}
                        />
                      )}
                    </>
                  )}

                  {field.type === 'string' && (
                    <select
                      value={field.pattern || 'random'}
                      onChange={(e) => updateField(index, { pattern: e.target.value })}
                    >
                      <option value="random">Random String</option>
                      <option value="uuid">UUID</option>
                      <option value="email">Email Format</option>
                    </select>
                  )}

                  {field.type === 'enum' && (
                    <>
                      <textarea
                        placeholder="Options (comma-separated)"
                        value={(field.options || []).join(', ')}
                        onChange={(e) => updateField(index, { 
                          options: e.target.value.split(',').map(v => v.trim()) 
                        })}
                        rows="3"
                      />
                    </>
                  )}
                </div>

                <button
                  onClick={() => removeField(index)}
                  className="btn-danger btn-small"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="actions">
        <button onClick={saveTemplate} className="btn-primary btn-large">
          {template?.id ? '💾 Update Template' : '✨ Create Template'}
        </button>
      </div>
    </div>
  );
}
