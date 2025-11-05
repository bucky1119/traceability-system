import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import api, { productBatchAPI, producerAPI } from '../../services/api';
import './AdminProductManagement.css';

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    producerId: '',
    vegetableName: '',
    vegetableVariety: '',
    origin: '',
    plantingTime: '',
    harvestTime: '',
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchFarmers();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const list = await productBatchAPI.getBatches();
      setProducts(list || []);
    } catch (error) {
      console.error('获取产品批次失败:', error);
      message.error('获取产品批次失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmers = async () => {
    try {
      const list = await producerAPI.getProducers();
      setFarmers(list || []);
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
      // 简单校验
      if (!formData.producerId) return message.warning('请选择农户');
      if (!formData.vegetableName) return message.warning('请输入蔬菜名称');
      if (!formData.origin) return message.warning('请输入产地');
      if (!formData.plantingTime || !formData.harvestTime) return message.warning('请选择种植/收获日期');

      await productBatchAPI.createBatch({
        producerId: Number(formData.producerId),
        vegetableName: formData.vegetableName,
        vegetableVariety: formData.vegetableVariety || undefined,
        origin: formData.origin,
        plantingTime: formData.plantingTime,
        harvestTime: formData.harvestTime,
        description: formData.description || undefined,
        imageUrl: formData.imageUrl || undefined,
      });

      message.success('产品录入成功！');
      setShowAddModal(false);
      setFormData({
        producerId: '',
        vegetableName: '',
        vegetableVariety: '',
        origin: '',
        plantingTime: '',
        harvestTime: '',
        description: '',
        imageUrl: '',
      });
      fetchProducts();
    } catch (error) {
      console.error('录入产品失败:', error);
      message.error('录入产品失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (farmerId = null) => {
    try {
      const resp = await productBatchAPI.exportCsv(farmerId ? Number(farmerId) : undefined);
      const blob = new Blob([resp], { type: 'text/csv;charset=utf-8' });
      const url2 = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url2;
      a.download = farmerId ? `producer_${farmerId}_products.csv` : 'all_products.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url2);
      document.body.removeChild(a);
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
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
            下载Excel（全部产品）
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
                    <h3>{product.vegetableName}</h3>
                  </div>
                  <div className="product-info">
                    <p><strong>农户账号:</strong> {product?.producer?.account || product.producerId}</p>
                    <p><strong>农户姓名:</strong> {product?.producer?.name || '-'}</p>
                    <p><strong>产地:</strong> {product.origin}</p>
                    <p><strong>种植时间:</strong> {product.plantingTime}</p>
                    <p><strong>收获时间:</strong> {product.harvestTime}</p>
                  </div>
                  <div className="product-actions">
                    <button 
                      className="btn btn-small"
                      onClick={() => handleExport(product.producerId)}
                    >
                      下载该农户Excel
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
              <h2>录入产品（批次）</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label>蔬菜名称 *</label>
                <input
                  type="text"
                  name="vegetableName"
                  value={formData.vegetableName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>品种</label>
                <input
                  type="text"
                  name="vegetableVariety"
                  value={formData.vegetableVariety}
                  onChange={handleInputChange}
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
                      {farmer.account} - {farmer.name || '-'} ({farmer.phone || '-'})
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
                  <label>种植日期 *</label>
                  <input
                    type="date"
                    name="plantingTime"
                    value={formData.plantingTime}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>收获日期 *</label>
                  <input
                    type="date"
                    name="harvestTime"
                    value={formData.harvestTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>产品图片链接（可选）</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>备注描述</label>
                <textarea
                  name="description"
                  value={formData.description}
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