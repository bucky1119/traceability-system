import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { adminAPI } from '../../services/api';
import './Admins.css';

const { Option } = Select;

const Admins = () => {
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const list = await adminAPI.getAdmins();
      setAdmins(list);
    } catch (e) {
      message.error('加载管理员列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreate = async (values) => {
    try {
      await adminAPI.createAdmin(values);
      message.success('创建成功');
      setOpen(false);
      form.resetFields();
      loadAdmins();
    } catch (e) {
      message.error(e?.response?.data?.message || '创建失败');
    }
  };

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '角色', dataIndex: 'role', key: 'role', render: (r) => (r === 'admin' ? '超级管理员' : r || '-') },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
  ];

  return (
    <div className="admins-page">
      <div className="page-header">
        <h1>管理员管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>新增管理员</Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={admins}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="新增管理员"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleCreate}>
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}> 
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '至少6位' }]}> 
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item label="角色" name="role" initialValue="inspector">
            <Select>
              <Option value="admin">超级管理员</Option>
              <Option value="inspector">稽核员</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">提交</Button>
              <Button onClick={() => setOpen(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admins;
