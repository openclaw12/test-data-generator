// Test Data Generator - React Frontend
// Production-ready React app with drag-and-drop template builder

import React, { useState, useEffect } from 'react';
import './App.css';
import { TemplateBuilder } from './components/TemplateBuilder';
import { DataGenerator } from './components/DataGenerator';
import { TemplateLibrary } from './components/TemplateLibrary';
import { Auth } from './components/Auth';

function App() {
  const [user, setUser] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('library');
  const [loading, setLoading] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchTemplates(token);
    }
  }, []);

  // Fetch templates
  const fetchTemplates = async (token) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle user login
  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    fetchTemplates(token);
  };

  // Handle user logout
  const handleLogout = () => {
    setUser(null);
    setTemplates([]);
    setSelectedTemplate(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Handle template created
  const handleTemplateCreated = (template) => {
    setTemplates([template, ...templates]);
    setSelectedTemplate(template);
    setActiveTab('generate');
  };

  // Handle template deleted
  const handleTemplateDeleted = (templateId) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>📊 Test Data Generator</h1>
          <div className="user-info">
            <span>{user.name} ({user.email})</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          📚 Template Library
        </button>
        <button
          className={`tab ${activeTab === 'builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('builder')}
        >
          🔧 Build Template
        </button>
        {selectedTemplate && (
          <button
            className={`tab ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            ⚡ Generate Data
          </button>
        )}
      </nav>

      {/* Main Content */}
      <main className="content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'library' && (
              <TemplateLibrary
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
                onDeleteTemplate={handleTemplateDeleted}
                onEdit={(template) => {
                  setSelectedTemplate(template);
                  setActiveTab('builder');
                }}
              />
            )}

            {activeTab === 'builder' && (
              <TemplateBuilder
                template={selectedTemplate}
                onTemplateCreated={handleTemplateCreated}
              />
            )}

            {activeTab === 'generate' && selectedTemplate && (
              <DataGenerator template={selectedTemplate} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Test Data Generator v1.0 | Built for labs, engineers, and scientists</p>
      </footer>
    </div>
  );
}

export default App;
