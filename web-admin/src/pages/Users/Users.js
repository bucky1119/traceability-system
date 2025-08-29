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
      // 模拟API调用
      const mockUsers = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          enterprise: '系统管理',
          createdAt: '2024-01-01 10:00:00',
          lastLogin: '2024-01-15 14:30:00'
        },
        {
          id: 2,
          username: 'producer1',
          email: 'producer1@example.com',
          role: 'producer',
          status: 'active',
          enterprise: '绿色农场',
          createdAt: '2024-01-05 09:15:00',
          lastLogin: '2024-01-15 12:20:00'
        },
        {
          id: 3,
          username: 'consumer1',
          email: 'consumer1@example.com',
          role: 'consumer',
          status: 'active',
          enterprise: null,
          createdAt: '2024-01-10 16:45:00',
          lastLogin: '2024-01-15 10:15:00'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      message.error('加载用户数据失败');
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
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {role === 'admin' ? '管理员' : role === 'producer' ? '生产者' : '消费者'}
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
      title: '所属企业',
      dataIndex: 'enterprise',
      key: 'enterprise',
      render: (enterprise) => enterprise || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
      render: (lastLogin) => lastLogin || '-',
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
            title="确定要删除这个用户吗？"
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

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    producer: users.filter(u => u.role === 'producer').length,
    consumer: users.filter(u => u.role === 'consumer').length,
    active: users.filter(u => u.status === 'active').length,
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>用户管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加用户
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="管理员"
              value={stats.admin}
              valueStyle={{ color: '#ff4d4f' }}
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
              title="消费者"
              value={stats.consumer}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="活跃用户"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和表格 */}
      <Card className="table-card">
        <div className="table-header">
          <Input
            placeholder="搜索用户名或邮箱"
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

      {/* 添加/编辑用户模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
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
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="admin">管理员</Option>
              <Option value="producer">生产者</Option>
              <Option value="consumer">消费者</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="enterprise"
            label="所属企业"
          >
            <Input placeholder="请输入所属企业（可选）" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? '更新' : '添加'}
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

export default Users; 