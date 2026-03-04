// TemplateLibrary Component - Browse and manage templates

import React from 'react';

export function TemplateLibrary({ templates, selectedTemplate, onSelectTemplate, onDeleteTemplate, onEdit }) {
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      onDeleteTemplate(id);
    }
  };

  return (
    <div className="template-library">
      <h2>Template Library</h2>
      <p className="subtitle">Choose a template to generate test data</p>

      {templates.length === 0 ? (
        <div className="empty-state">
          <p>📋 No templates yet</p>
          <p>Create your first template to get started</p>
        </div>
      ) : (
        <div className="templates-grid">
          {templates.map(template => (
            <div
              key={template.id}
              className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
              onClick={() => onSelectTemplate(template)}
            >
              <div className="card-header">
                <h3>{template.name}</h3>
                <span className="field-count">{JSON.parse(template.fields).length} fields</span>
              </div>

              <p className="card-description">{template.description}</p>

              <div className="fields-preview">
                {JSON.parse(template.fields).slice(0, 3).map((field, idx) => (
                  <span key={idx} className="field-badge">{field.name}</span>
                ))}
                {JSON.parse(template.fields).length > 3 && (
                  <span className="field-badge">+{JSON.parse(template.fields).length - 3}</span>
                )}
              </div>

              <div className="card-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(template);
                  }}
                  className="btn-secondary btn-small"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(template.id);
                  }}
                  className="btn-danger btn-small"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
