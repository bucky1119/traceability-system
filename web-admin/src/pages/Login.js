import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Spin, Tabs, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/slices/authSlice';
import { authAPI } from '../services/authAPI';
import './Login.css';

const { TabPane } = Tabs;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const onLoginFinish = async (values) => {
    setLoading(true);
    try {
      console.log('开始登录流程，输入值:', values);
      
      // 直接使用Redux的login action
      const result = await dispatch(login(values));
      
      if (login.fulfilled.match(result)) {
        console.log('登录成功，结果:', result.payload);
        message.success('登录成功！');
        
        // 延迟跳转，确保状态更新完成
        setTimeout(() => {
          console.log('准备跳转到仪表盘');
          navigate('/dashboard');
        }, 100);
      } else {
        console.log('登录失败:', result.error);
        message.error(result.error.message || '登录失败');
      }
      
    } catch (error) {
      console.error('登录错误:', error);
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const onRegisterFinish = async (values) => {
    setRegisterLoading(true);
    try {
      console.log('开始注册流程，输入值:', values);
      
      // 模拟注册成功，直接使用login action
      const mockCredentials = {
        username: values.username,
        password: values.password
      };
      
      const result = await dispatch(login(mockCredentials));
      
      if (login.fulfilled.match(result)) {
        console.log('注册成功，结果:', result.payload);
        message.success('注册成功！');
        
        // 延迟跳转，确保状态更新完成
        setTimeout(() => {
          console.log('准备跳转到仪表盘');
          navigate('/dashboard');
        }, 100);
      } else {
        console.log('注册失败:', result.error);
        message.error(result.error.message || '注册失败');
      }
      
    } catch (error) {
      console.error('注册错误:', error);
      message.error('注册失败，请重试');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'login') {
      loginForm.resetFields();
    } else {
      registerForm.resetFields();
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-content">
          <Card className="login-card">
            <div className="login-header">
              <h1>设施蔬菜溯源系统</h1>
              <p>欢迎使用溯源管理系统</p>
            </div>
            
            <Tabs 
              activeKey={activeTab} 
              onChange={handleTabChange}
              centered
              size="large"
            >
              <TabPane tab="登录" key="login">
                <Form
                  form={loginForm}
                  name="login"
                  onFinish={onLoginFinish}
                  autoComplete="off"
                  size="large"
                >
                  <Form.Item
                    name="username"
                    rules={[
                      { required: true, message: '请输入用户名!' },
                      { min: 3, message: '用户名至少3个字符!' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="用户名"
                      autoFocus
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: '请输入密码!' },
                      { min: 6, message: '密码至少6个字符!' }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="密码"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="login-button"
                      loading={loading}
                      block
                    >
                      {loading ? <Spin size="small" /> : '登录'}
                    </Button>
                  </Form.Item>
                </Form>

                <Divider>测试账号</Divider>
                <div className="test-accounts">
                  <p><strong>管理员账号：</strong>admin / admin123</p>
                  <p><strong>生产者账号：</strong>producer / producer123</p>
                  <p><strong>消费者账号：</strong>consumer / consumer123</p>
                </div>
              </TabPane>

              <TabPane tab="注册" key="register">
                <Form
                  form={registerForm}
                  name="register"
                  onFinish={onRegisterFinish}
                  autoComplete="off"
                  size="large"
                >
                  <Form.Item
                    name="username"
                    rules={[
                      { required: true, message: '请输入用户名!' },
                      { min: 3, message: '用户名至少3个字符!' },
                      { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线!' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="用户名"
                      autoFocus
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: '请输入邮箱!' },
                      { type: 'email', message: '请输入有效的邮箱地址!' }
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="邮箱"
                    />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: '请输入手机号!' },
                      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码!' }
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="手机号"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: '请输入密码!' },
                      { min: 6, message: '密码至少6个字符!' }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="密码"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: '请确认密码!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('两次输入的密码不一致!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="确认密码"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="login-button"
                      loading={registerLoading}
                      block
                    >
                      {registerLoading ? <Spin size="small" /> : '注册'}
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
            </Tabs>

            <div className="login-footer">
              <p>© 2025 设施蔬菜溯源系统. All rights reserved.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login; 