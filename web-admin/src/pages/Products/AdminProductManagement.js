import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminProductManagement.css';

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    batchCode: '',
    producerId: '',
    origin: '',
    plantingDate: '',
    harvestDate: '',
    testType: '',
    testDate: '',
    testReport: '',
    safetyRiskTest: '',
    ingredientTest: '',
    isQualified: false,
    imageUrl: '',
    batchNotes: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchFarmers();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('获取产品列表失败:', error);
      alert('获取产品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/users?role=farmer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFarmers(response.data);
    } catch (error) {
      console.error('获取农户列表失败:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/products/admin', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('产品录入成功！');
      setShowAddModal(false);
      setFormData({
        name: '',
        batchCode: '',
        producerId: '',
        origin: '',
        plantingDate: '',
        harvestDate: '',
        testType: '',
        testDate: '',
        testReport: '',
        safetyRiskTest: '',
        ingredientTest: '',
        isQualified: false,
        imageUrl: '',
        batchNotes: ''
      });
      fetchProducts();
    } catch (error) {
      console.error('录入产品失败:', error);
      alert('录入产品失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (farmerId = null) => {
    try {
      const token = localStorage.getItem('token');
      const url = farmerId 
        ? `http://localhost:3000/api/products/export?farmerId=${farmerId}`
        : 'http://localhost:3000/api/products/export';
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url2 = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url2;
      a.download = farmerId ? `farmer_${farmerId}_test_results.csv` : 'all_farmers_test_results.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url2);
      document.body.removeChild(a);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败');
    }
  };

  return (
    <div className="admin-product-management">
      <div className="header">
        <h1>管理员产品管理</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddModal(true)}
          >
            录入产品
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => handleExport()}
          >
            导出全部检测结果
          </button>
        </div>
      </div>

      <div className="content">
        <div className="stats-section">
          <div className="stat-card">
            <h3>总产品数</h3>
            <p>{products.length}</p>
          </div>
          <div className="stat-card">
            <h3>合格产品</h3>
            <p>{products.filter(p => p.isQualified).length}</p>
          </div>
          <div className="stat-card">
            <h3>农户数量</h3>
            <p>{farmers.length}</p>
          </div>
        </div>

        <div className="products-section">
          <h2>产品列表</h2>
          {loading ? (
            <div className="loading">加载中...</div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-header">
                    <h3>{product.name}</h3>
                    <span className={`status ${product.isQualified ? 'qualified' : 'unqualified'}`}>
                      {product.isQualified ? '合格' : '不合格'}
                    </span>
                  </div>
                  <div className="product-info">
                    <p><strong>生产者:</strong> {product.producerName}</p>
                    <p><strong>批次:</strong> {product.batch?.batchCode}</p>
                    <p><strong>产地:</strong> {product.origin}</p>
                    <p><strong>检测类型:</strong> {product.testType}</p>
                    {product.safetyRiskTest && (
                      <p><strong>安全风险因子:</strong> {product.safetyRiskTest}</p>
                    )}
                    {product.ingredientTest && (
                      <p><strong>产品成分:</strong> {product.ingredientTest}</p>
                    )}
                  </div>
                  <div className="product-actions">
                    <button 
                      className="btn btn-small"
                      onClick={() => handleExport(product.producerId)}
                    >
                      导出该农户
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 录入产品弹窗 */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>录入产品</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label>产品名称 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>批次编号 *</label>
                <input
                  type="text"
                  name="batchCode"
                  value={formData.batchCode}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>选择农户 *</label>
                <select
                  name="producerId"
                  value={formData.producerId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">请选择农户</option>
                  {farmers.map(farmer => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.username} - {farmer.tel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>产地</label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>种植日期</label>
                  <input
                    type="date"
                    name="plantingDate"
                    value={formData.plantingDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>收获日期</label>
                  <input
                    type="date"
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>检测类型</label>
                  <input
                    type="text"
                    name="testType"
                    value={formData.testType}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>检测日期</label>
                  <input
                    type="date"
                    name="testDate"
                    value={formData.testDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>检测报告链接</label>
                <input
                  type="url"
                  name="testReport"
                  value={formData.testReport}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>安全风险因子检测</label>
                <textarea
                  name="safetyRiskTest"
                  value={formData.safetyRiskTest}
                  onChange={handleInputChange}
                  placeholder="如：重金属含量：铅<0.1mg/kg，镉<0.05mg/kg"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>产品成分检测</label>
                <textarea
                  name="ingredientTest"
                  value={formData.ingredientTest}
                  onChange={handleInputChange}
                  placeholder="如：蛋白质：2.1g/100g，维生素C：15mg/100g"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isQualified"
                    checked={formData.isQualified}
                    onChange={handleInputChange}
                  />
                  是否合格
                </label>
              </div>

              <div className="form-group">
                <label>产品图片链接</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>批次备注</label>
                <textarea
                  name="batchNotes"
                  value={formData.batchNotes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '提交中...' : '提交'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManagement; 