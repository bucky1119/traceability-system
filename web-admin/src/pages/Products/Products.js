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
  DatePicker,
  Switch,
  Image
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppleOutlined,
  EyeOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import './Products.css';

const { Option } = Select;
const { TextArea } = Input;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadProducts();
    loadEnterprises();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockProducts = [
        {
          id: 1,
          name: '有机西红柿',
          code: 'TOMATO001',
          category: 'vegetable',
          enterpriseId: 1,
          enterpriseName: '绿色农场',
          origin: '北京市朝阳区',
          plantingDate: '2024-01-15',
          harvestDate: '2024-03-20',
          testType: '农药残留检测',
          testDate: '2024-03-18',
          isQualified: true,
          imageUrl: 'https://via.placeholder.com/150x150/ff6b6b/ffffff?text=西红柿',
          description: '采用有机种植技术，无农药残留，口感鲜美',
          status: 'active',
          createdAt: '2024-01-15 10:00:00',
          qrcodeCount: 5
        },
        {
          id: 2,
          name: '绿色生菜',
          code: 'LETTUCE002',
          category: 'vegetable',
          enterpriseId: 1,
          enterpriseName: '绿色农场',
          origin: '北京市朝阳区',
          plantingDate: '2024-01-20',
          harvestDate: '2024-02-25',
          testType: '重金属检测',
          testDate: '2024-02-23',
          isQualified: true,
          imageUrl: 'https://via.placeholder.com/150x150/51cf66/ffffff?text=生菜',
          description: '温室种植，新鲜脆嫩，营养丰富',
          status: 'active',
          createdAt: '2024-01-20 14:30:00',
          qrcodeCount: 3
        },
        {
          id: 3,
          name: '有机胡萝卜',
          code: 'CARROT003',
          category: 'vegetable',
          enterpriseId: 2,
          enterpriseName: '丰收农业合作社',
          origin: '上海市浦东新区',
          plantingDate: '2024-02-01',
          harvestDate: '2024-04-15',
          testType: '农药残留检测',
          testDate: '2024-04-12',
          isQualified: false,
          imageUrl: 'https://via.placeholder.com/150x150/ff922b/ffffff?text=胡萝卜',
          description: '有机种植，甜脆可口，富含胡萝卜素',
          status: 'inactive',
          createdAt: '2024-02-01 09:15:00',
          qrcodeCount: 0
        }
      ];
      setProducts(mockProducts);
    } catch (error) {
      message.error('加载产品数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadEnterprises = async () => {
    try {
      // 模拟企业数据
      const mockEnterprises = [
        { id: 1, name: '绿色农场' },
        { id: 2, name: '丰收农业合作社' },
        { id: 3, name: '优质蔬菜配送中心' }
      ];
      setEnterprises(mockEnterprises);
    } catch (error) {
      message.error('加载企业数据失败');
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    form.setFieldsValue({
      ...record,
      plantingDate: record.plantingDate ? new Date(record.plantingDate) : null,
      harvestDate: record.harvestDate ? new Date(record.harvestDate) : null,
      testDate: record.testDate ? new Date(record.testDate) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      setProducts(products.filter(product => product.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const enterprise = enterprises.find(e => e.id === values.enterpriseId);
      const productData = {
        ...values,
        enterpriseName: enterprise?.name,
        plantingDate: values.plantingDate?.format('YYYY-MM-DD'),
        harvestDate: values.harvestDate?.format('YYYY-MM-DD'),
        testDate: values.testDate?.format('YYYY-MM-DD'),
      };

      if (editingProduct) {
        // 更新产品
        const updatedProducts = products.map(product =>
          product.id === editingProduct.id ? { ...product, ...productData } : product
        );
        setProducts(updatedProducts);
        message.success('更新成功');
      } else {
        // 添加产品
        const newProduct = {
          id: Date.now(),
          ...productData,
          status: 'active',
          createdAt: new Date().toLocaleString(),
          qrcodeCount: 0
        };
        setProducts([...products, newProduct]);
        message.success('添加成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'vegetable': return 'green';
      case 'fruit': return 'orange';
      case 'grain': return 'blue';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'green' : 'red';
  };

  const columns = [
    {
      title: '产品图片',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
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
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '产品代码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '产品类别',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={getCategoryColor(category)}>
          {category === 'vegetable' ? '蔬菜' : category === 'fruit' ? '水果' : '粮食'}
        </Tag>
      ),
    },
    {
      title: '生产企业',
      dataIndex: 'enterpriseName',
      key: 'enterpriseName',
    },
    {
      title: '产地',
      dataIndex: 'origin',
      key: 'origin',
    },
    {
      title: '检测状态',
      dataIndex: 'isQualified',
      key: 'isQualified',
      render: (isQualified) => (
        <Tag color={isQualified ? 'green' : 'red'} icon={isQualified ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {isQualified ? '合格' : '不合格'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status === 'active' ? '活跃' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '二维码数量',
      dataIndex: 'qrcodeCount',
      key: 'qrcodeCount',
      width: 100,
      render: (count) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{count}</span>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
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
            title="确定要删除这个产品吗？"
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.code.toLowerCase().includes(searchText.toLowerCase()) ||
    product.enterpriseName.toLowerCase().includes(searchText.toLowerCase())
  );

  const stats = {
    total: products.length,
    vegetable: products.filter(p => p.category === 'vegetable').length,
    fruit: products.filter(p => p.category === 'fruit').length,
    grain: products.filter(p => p.category === 'grain').length,
    qualified: products.filter(p => p.isQualified).length,
    active: products.filter(p => p.status === 'active').length,
    totalQrcodes: products.reduce((sum, p) => sum + p.qrcodeCount, 0),
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>产品管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加产品
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="总产品数"
              value={stats.total}
              prefix={<AppleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="蔬菜类"
              value={stats.vegetable}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="水果类"
              value={stats.fruit}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="粮食类"
              value={stats.grain}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="检测合格"
              value={stats.qualified}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="总二维码数"
              value={stats.totalQrcodes}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和表格 */}
      <Card className="table-card">
        <div className="table-header">
          <Input
            placeholder="搜索产品名称、代码或企业"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredProducts}
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

      {/* 添加/编辑产品模态框 */}
      <Modal
        title={editingProduct ? '编辑产品' : '添加产品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="产品名称"
                rules={[
                  { required: true, message: '请输入产品名称' },
                  { min: 2, message: '产品名称至少2个字符' }
                ]}
              >
                <Input placeholder="请输入产品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="产品代码"
                rules={[
                  { required: true, message: '请输入产品代码' },
                  { pattern: /^[A-Z0-9]+$/, message: '产品代码只能包含大写字母和数字' }
                ]}
              >
                <Input placeholder="请输入产品代码" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="产品类别"
                rules={[{ required: true, message: '请选择产品类别' }]}
              >
                <Select placeholder="请选择产品类别">
                  <Option value="vegetable">蔬菜</Option>
                  <Option value="fruit">水果</Option>
                  <Option value="grain">粮食</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="enterpriseId"
                label="生产企业"
                rules={[{ required: true, message: '请选择生产企业' }]}
              >
                <Select placeholder="请选择生产企业">
                  {enterprises.map(enterprise => (
                    <Option key={enterprise.id} value={enterprise.id}>
                      {enterprise.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="origin"
                label="产地"
                rules={[
                  { required: true, message: '请输入产地' }
                ]}
              >
                <Input placeholder="请输入产地" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="imageUrl"
                label="产品图片URL"
              >
                <Input placeholder="请输入产品图片URL（可选）" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="plantingDate"
                label="种植日期"
              >
                <DatePicker style={{ width: '100%' }} placeholder="选择种植日期" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="harvestDate"
                label="采收日期"
              >
                <DatePicker style={{ width: '100%' }} placeholder="选择采收日期" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="testDate"
                label="检测日期"
              >
                <DatePicker style={{ width: '100%' }} placeholder="选择检测日期" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="testType"
                label="检测类型"
              >
                <Input placeholder="请输入检测类型（可选）" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isQualified"
                label="检测合格"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="产品描述"
          >
            <TextArea
              rows={4}
              placeholder="请输入产品描述（可选）"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingProduct ? '更新' : '添加'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products; 