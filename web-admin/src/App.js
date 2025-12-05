import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useSelector } from 'react-redux';
import MainLayout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import Enterprises from './pages/Enterprises/Enterprises';
import Products from './pages/Products/Products';
import AdminProductManagement from './pages/Products/AdminProductManagement';
import Qrcodes from './pages/Qrcodes/Qrcodes';
import Admins from './pages/Admins/Admins';
import './App.css';

function App() {
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  // 调试信息
  useEffect(() => {
    console.log('App组件 - 认证状态:', {
      isAuthenticated,
      user,
      token,
      localStorageToken: localStorage.getItem('token'),
      localStorageUser: localStorage.getItem('user')
    });
  }, [isAuthenticated, user, token]);

  // 受保护的路由组件
  const ProtectedRoute = ({ children }) => {
    console.log('ProtectedRoute - 检查认证状态:', isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Users />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enterprises"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Enterprises />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Products />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AdminProductManagement />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/qrcodes"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Qrcodes />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admins"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Admins />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App; 