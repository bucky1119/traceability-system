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
  UserOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons';
import './Users.css';
import { producerAPI } from '../../services/api';

const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await producerAPI.getProducers();
      // 统一字段映射到表格使用
      const mapped = (list || []).map(p => ({
        id: p.id,
        account: p.account,
        name: p.name,
        phone: p.phone,
        createdAt: p.created_at,
      }));
      setUsers(mapped);
    } catch (error) {
      message.error('加载农户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      // 模拟API调用
      setUsers(users.filter(user => user.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        // 更新用户
        const updatedUsers = users.map(user =>
          user.id === editingUser.id ? { ...user, ...values } : user
        );
        setUsers(updatedUsers);
        message.success('更新成功');
      } else {
        // 添加用户
        const newUser = {
          id: Date.now(),
          ...values,
          status: 'active',
          createdAt: new Date().toLocaleString(),
          lastLogin: null
        };
        setUsers([...users, newUser]);
        message.success('添加成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'producer': return 'blue';
      case 'consumer': return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'green' : 'red';
  };

  const columns = [
    { title: '账号', dataIndex: 'account', key: 'account', render: (t) => <strong>{t}</strong> },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '联系方式', dataIndex: 'phone', key: 'phone' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  ];

  const filteredUsers = users.filter(u =>
    (u.account || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (u.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (u.phone || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const stats = { total: users.length };

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>农户管理</h1>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="农户总数"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和表格 */}
      <Card className="table-card">
        <div className="table-header">
          <Input
            placeholder="搜索账号/姓名/联系方式"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredUsers}
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

      {/* 本页暂不提供新增/编辑；仅展示列表 */}
    </div>
  );
};

export default Users; 