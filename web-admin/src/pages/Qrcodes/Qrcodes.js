import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  InputNumber,
  Image
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QrcodeOutlined,
  DownloadOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import './Qrcodes.css';

const { Option } = Select;
const { TextArea } = Input;

const Qrcodes = () => {
  const [qrcodes, setQrcodes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [editingQrcode, setEditingQrcode] = useState(null);
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadQrcodes();
    loadProducts();
  }, []);

  const loadQrcodes = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockQrcodes = [
        {
          id: 1,
          qrcodeId: 'QR001',
          productId: 1,
          productName: '有机西红柿',
          batchId: 1,
          batchCode: 'BATCH001',
          generateTime: '2024-01-15 10:00:00',
          scanCount: 25,
          status: 'active',
          qrcodeDataUrl: 'https://via.placeholder.com/150x150/1890ff/ffffff?text=QR001',
          notes: '第一批次西红柿二维码'
        },
        {
          id: 2,
          qrcodeId: 'QR002',
          productId: 1,
          productName: '有机西红柿',
          batchId: 1,
          batchCode: 'BATCH001',
          generateTime: '2024-01-15 10:05:00',
          scanCount: 18,
          status: 'active',
          qrcodeDataUrl: 'https://via.placeholder.com/150x150/1890ff/ffffff?text=QR002',
          notes: '第二批次西红柿二维码'
        },
        {
          id: 3,
          qrcodeId: 'QR003',
          productId: 2,
          productName: '绿色生菜',
          batchId: 2,
          batchCode: 'BATCH002',
          generateTime: '2024-01-20 14:30:00',
          scanCount: 32,
          status: 'active',
          qrcodeDataUrl: 'https://via.placeholder.com/150x150/52c41a/ffffff?text=QR003',
          notes: '生菜批次二维码'
        },
        {
          id: 4,
          qrcodeId: 'QR004',
          productId: 3,
          productName: '有机胡萝卜',
          batchId: 3,
          batchCode: 'BATCH003',
          generateTime: '2024-02-01 09:15:00',
          scanCount: 0,
          status: 'inactive',
          qrcodeDataUrl: 'https://via.placeholder.com/150x150/faad14/ffffff?text=QR004',
          notes: '胡萝卜批次二维码（未激活）'
        }
      ];
      setQrcodes(mockQrcodes);
    } catch (error) {
      message.error('加载二维码数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      // 模拟产品数据
      const mockProducts = [
        { id: 1, name: '有机西红柿' },
        { id: 2, name: '绿色生菜' },
        { id: 3, name: '有机胡萝卜' }
      ];
      setProducts(mockProducts);
    } catch (error) {
      message.error('加载产品数据失败');
    }
  };

  const handleAdd = () => {
    setEditingQrcode(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleBatchGenerate = () => {
    batchForm.resetFields();
    setBatchModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingQrcode(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      setQrcodes(qrcodes.filter(qrcode => qrcode.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const product = products.find(p => p.id === values.productId);
      const qrcodeData = {
        ...values,
        productName: product?.name,
        qrcodeId: `QR${String(Date.now()).slice(-6)}`,
        generateTime: new Date().toLocaleString(),
        scanCount: 0,
        status: 'active',
        qrcodeDataUrl: `https://via.placeholder.com/150x150/1890ff/ffffff?text=${values.qrcodeId || 'QR'}`,
      };

      if (editingQrcode) {
        // 更新二维码
        const updatedQrcodes = qrcodes.map(qrcode =>
          qrcode.id === editingQrcode.id ? { ...qrcode, ...qrcodeData } : qrcode
        );
        setQrcodes(updatedQrcodes);
        message.success('更新成功');
      } else {
        // 添加二维码
        const newQrcode = {
          id: Date.now(),
          ...qrcodeData,
        };
        setQrcodes([...qrcodes, newQrcode]);
        message.success('生成成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleBatchSubmit = async (values) => {
    try {
      const product = products.find(p => p.id === values.productId);
      const newQrcodes = [];
      
      for (let i = 0; i < values.count; i++) {
        const qrcodeId = `QR${String(Date.now() + i).slice(-6)}`;
        newQrcodes.push({
          id: Date.now() + i,
          qrcodeId,
          productId: values.productId,
          productName: product?.name,
          batchId: values.batchId || 1,
          batchCode: values.batchCode || 'BATCH001',
          generateTime: new Date().toLocaleString(),
          scanCount: 0,
          status: 'active',
          qrcodeDataUrl: `https://via.placeholder.com/150x150/1890ff/ffffff?text=${qrcodeId}`,
          notes: values.notes || `批量生成第${i + 1}个二维码`
        });
      }
      
      setQrcodes([...qrcodes, ...newQrcodes]);
      message.success(`成功生成 ${values.count} 个二维码`);
      setBatchModalVisible(false);
    } catch (error) {
      message.error('批量生成失败');
    }
  };

  const handleDownload = (record) => {
    // 模拟下载功能
    const link = document.createElement('a');
    link.href = record.qrcodeDataUrl;
    link.download = `${record.qrcodeId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('下载成功');
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'green' : 'red';
  };

  const columns = [
    {
      title: '二维码',
      dataIndex: 'qrcodeDataUrl',
      key: 'qrcodeDataUrl',
      width: 80,
      render: (imageUrl) => (
        <Image
          width={50}
          height={50}
          src={imageUrl}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          style={{ borderRadius: '4px' }}
        />
      ),
    },
    {
      title: '二维码ID',
      dataIndex: 'qrcodeId',
      key: 'qrcodeId',
      width: 120,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '关联产品',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '批次编号',
      dataIndex: 'batchCode',
      key: 'batchCode',
      width: 120,
    },
    {
      title: '扫描次数',
      dataIndex: 'scanCount',
      key: 'scanCount',
      width: 100,
      render: (count) => (
        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
          {count}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status === 'active' ? '活跃' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '生成时间',
      dataIndex: 'generateTime',
      key: 'generateTime',
      width: 150,
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="下载二维码">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个二维码吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredQrcodes = qrcodes.filter(qrcode =>
    qrcode.qrcodeId.toLowerCase().includes(searchText.toLowerCase()) ||
    qrcode.productName.toLowerCase().includes(searchText.toLowerCase()) ||
    qrcode.batchCode.toLowerCase().includes(searchText.toLowerCase())
  );

  const stats = {
    total: qrcodes.length,
    active: qrcodes.filter(q => q.status === 'active').length,
    inactive: qrcodes.filter(q => q.status === 'inactive').length,
    totalScans: qrcodes.reduce((sum, q) => sum + q.scanCount, 0),
    avgScans: qrcodes.length > 0 ? Math.round(qrcodes.reduce((sum, q) => sum + q.scanCount, 0) / qrcodes.length) : 0,
    mostScanned: qrcodes.length > 0 ? Math.max(...qrcodes.map(q => q.scanCount)) : 0,
  };

  return (
    <div className="qrcodes-page">
      <div className="page-header">
        <h1>二维码管理</h1>
        <Space>
          <Button
            icon={<QrcodeOutlined />}
            onClick={handleBatchGenerate}
          >
            批量生成
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            生成二维码
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="总二维码数"
              value={stats.total}
              prefix={<QrcodeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="活跃二维码"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="总扫描次数"
              value={stats.totalScans}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="平均扫描次数"
              value={stats.avgScans}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="最高扫描次数"
              value={stats.mostScanned}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="使用率"
              value={stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}
              suffix="%"
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和表格 */}
      <Card className="table-card">
        <div className="table-header">
          <Input
            placeholder="搜索二维码ID、产品名称或批次编号"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={loadQrcodes}
          >
            刷新
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredQrcodes}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Card>

      {/* 添加/编辑二维码模态框 */}
      <Modal
        title={editingQrcode ? '编辑二维码' : '生成二维码'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productId"
                label="关联产品"
                rules={[{ required: true, message: '请选择关联产品' }]}
              >
                <Select placeholder="请选择产品">
                  {products.map(product => (
                    <Option key={product.id} value={product.id}>
                      {product.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="batchId"
                label="批次ID"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入批次ID"
                  min={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="batchCode"
                label="批次编号"
              >
                <Input placeholder="请输入批次编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="qrcodeId"
                label="二维码ID"
              >
                <Input placeholder="系统自动生成" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea
              rows={3}
              placeholder="请输入备注信息（可选）"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingQrcode ? '更新' : '生成'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量生成二维码模态框 */}
      <Modal
        title="批量生成二维码"
        open={batchModalVisible}
        onCancel={() => setBatchModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={batchForm}
          layout="vertical"
          onFinish={handleBatchSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productId"
                label="关联产品"
                rules={[{ required: true, message: '请选择关联产品' }]}
              >
                <Select placeholder="请选择产品">
                  {products.map(product => (
                    <Option key={product.id} value={product.id}>
                      {product.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="count"
                label="生成数量"
                rules={[
                  { required: true, message: '请输入生成数量' },
                  { type: 'number', min: 1, max: 100, message: '数量范围1-100' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入生成数量"
                  min={1}
                  max={100}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="batchId"
                label="批次ID"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入批次ID"
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="batchCode"
                label="批次编号"
              >
                <Input placeholder="请输入批次编号" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea
              rows={3}
              placeholder="请输入备注信息（可选）"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                批量生成
              </Button>
              <Button onClick={() => setBatchModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Qrcodes; 