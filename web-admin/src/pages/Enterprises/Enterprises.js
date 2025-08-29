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
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons';
import './Enterprises.css';

const { Option } = Select;
const { TextArea } = Input;

const Enterprises = () => {
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEnterprise, setEditingEnterprise] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadEnterprises();
  }, []);

  const loadEnterprises = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockEnterprises = [
        {
          id: 1,
          name: '绿色农场',
          code: 'GF001',
          type: 'producer',
          status: 'active',
          contactPerson: '张三',
          contactPhone: '13800138001',
          address: '北京市朝阳区绿色农业园区',
          description: '专业从事有机蔬菜种植的现代化农场',
          certification: '有机认证',
          createdAt: '2024-01-01 10:00:00',
          productCount: 15
        },
        {
          id: 2,
          name: '丰收农业合作社',
          code: 'FY002',
          type: 'producer',
          status: 'active',
          contactPerson: '李四',
          contactPhone: '13800138002',
          address: '上海市浦东新区农业示范区',
          description: '农民专业合作社，专注于绿色蔬菜生产',
          certification: '绿色食品认证',
          createdAt: '2024-01-05 09:15:00',
          productCount: 8
        },
        {
          id: 3,
          name: '优质蔬菜配送中心',
          code: 'PS003',
          type: 'distributor',
          status: 'active',
          contactPerson: '王五',
          contactPhone: '13800138003',
          address: '广州市天河区物流园区',
          description: '专业的蔬菜配送和销售企业',
          certification: 'ISO9001认证',
          createdAt: '2024-01-10 16:45:00',
          productCount: 25
        }
      ];
      setEnterprises(mockEnterprises);
    } catch (error) {
      message.error('加载企业数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingEnterprise(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingEnterprise(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      // 模拟API调用
      setEnterprises(enterprises.filter(enterprise => enterprise.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingEnterprise) {
        // 更新企业
        const updatedEnterprises = enterprises.map(enterprise =>
          enterprise.id === editingEnterprise.id ? { ...enterprise, ...values } : enterprise
        );
        setEnterprises(updatedEnterprises);
        message.success('更新成功');
      } else {
        // 添加企业
        const newEnterprise = {
          id: Date.now(),
          ...values,
          status: 'active',
          createdAt: new Date().toLocaleString(),
          productCount: 0
        };
        setEnterprises([...enterprises, newEnterprise]);
        message.success('添加成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'producer': return 'blue';
      case 'distributor': return 'green';
      case 'retailer': return 'orange';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'green' : 'red';
  };

  const columns = [
    {
      title: '企业名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '企业代码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '企业类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {type === 'producer' ? '生产者' : type === 'distributor' ? '经销商' : '零售商'}
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
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
    },
    {
      title: '产品数量',
      dataIndex: 'productCount',
      key: 'productCount',
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
            title="确定要删除这个企业吗？"
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

  const filteredEnterprises = enterprises.filter(enterprise =>
    enterprise.name.toLowerCase().includes(searchText.toLowerCase()) ||
    enterprise.code.toLowerCase().includes(searchText.toLowerCase()) ||
    enterprise.contactPerson.toLowerCase().includes(searchText.toLowerCase())
  );

  const stats = {
    total: enterprises.length,
    producer: enterprises.filter(e => e.type === 'producer').length,
    distributor: enterprises.filter(e => e.type === 'distributor').length,
    retailer: enterprises.filter(e => e.type === 'retailer').length,
    active: enterprises.filter(e => e.status === 'active').length,
    totalProducts: enterprises.reduce((sum, e) => sum + e.productCount, 0),
  };

  return (
    <div className="enterprises-page">
      <div className="page-header">
        <h1>企业管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加企业
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="总企业数"
              value={stats.total}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="生产者"
              value={stats.producer}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="经销商"
              value={stats.distributor}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="零售商"
              value={stats.retailer}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="活跃企业"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="总产品数"
              value={stats.totalProducts}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和表格 */}
      <Card className="table-card">
        <div className="table-header">
          <Input
            placeholder="搜索企业名称、代码或联系人"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredEnterprises}
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

      {/* 添加/编辑企业模态框 */}
      <Modal
        title={editingEnterprise ? '编辑企业' : '添加企业'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
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
                label="企业名称"
                rules={[
                  { required: true, message: '请输入企业名称' },
                  { min: 2, message: '企业名称至少2个字符' }
                ]}
              >
                <Input placeholder="请输入企业名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="企业代码"
                rules={[
                  { required: true, message: '请输入企业代码' },
                  { pattern: /^[A-Z0-9]+$/, message: '企业代码只能包含大写字母和数字' }
                ]}
              >
                <Input placeholder="请输入企业代码" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="企业类型"
                rules={[{ required: true, message: '请选择企业类型' }]}
              >
                <Select placeholder="请选择企业类型">
                  <Option value="producer">生产者</Option>
                  <Option value="distributor">经销商</Option>
                  <Option value="retailer">零售商</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="certification"
                label="认证情况"
              >
                <Input placeholder="请输入认证情况（可选）" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contactPerson"
                label="联系人"
                rules={[
                  { required: true, message: '请输入联系人' }
                ]}
              >
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactPhone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                ]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="企业地址"
            rules={[
              { required: true, message: '请输入企业地址' }
            ]}
          >
            <Input placeholder="请输入企业地址" />
          </Form.Item>

          <Form.Item
            name="description"
            label="企业描述"
          >
            <TextArea
              rows={4}
              placeholder="请输入企业描述（可选）"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingEnterprise ? '更新' : '添加'}
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

export default Enterprises; 