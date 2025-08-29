import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  AppleOutlined,
  QrcodeOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import './Layout.css';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log('MainLayout组件加载 - 当前路径:', location.pathname);
    console.log('MainLayout组件加载 - 用户信息:', user);
  }, [location.pathname, user]);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/enterprises',
      icon: <ShopOutlined />,
      label: '企业管理',
    },
    {
      key: '/products',
      icon: <AppleOutlined />,
      label: '产品管理',
    },
    {
      key: '/admin/products',
      icon: <AppleOutlined />,
      label: '管理员产品管理',
    },
    {
      key: '/qrcodes',
      icon: <QrcodeOutlined />,
      label: '二维码管理',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">
          <h2>{collapsed ? '溯源' : '设施蔬菜溯源系统'}</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header className="header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="trigger"
          />
          <div className="header-right">
            <Space size="middle">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="notification-btn"
              />
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <Space className="user-info">
                  <Avatar icon={<UserOutlined />} />
                  <span className="username">{user?.username || '管理员'}</span>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content className="content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 