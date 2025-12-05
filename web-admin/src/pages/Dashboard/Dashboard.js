import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Progress, Spin, message } from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  AppstoreOutlined,
  QrcodeOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import { statsAPI } from '../../services/api';
import { useSelector } from 'react-redux';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentScans, setRecentScans] = useState([]);
  const [scanTrend, setScanTrend] = useState([]);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log('Dashboard组件加载 - 用户信息:', user);
    console.log('Dashboard组件加载 - 认证状态:', isAuthenticated);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await statsAPI.getDashboardStats();
      setStats({
        totalUsers: data.totalProducers, // 以农户数量代替用户总数
        totalProducts: data.totalProducts,
        totalQrcodes: data.totalQrcodes,
        totalScans: data.totalScans,
        qualifiedProducts: data.qualifiedProducts,
        unqualifiedProducts: data.unqualifiedProducts,
      });
      // 暂无扫码趋势与最近扫描真实数据，使用空占位
      setRecentScans([]);
      setScanTrend([]);
    } catch (error) {
      message.error('加载仪表盘数据失败');
      console.error('Dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentScansColumns = [
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '二维码ID',
      dataIndex: 'qrcodeId',
      key: 'qrcodeId',
      width: 120,
    },
    {
      title: '扫描时间',
      dataIndex: 'scanTime',
      key: 'scanTime',
      width: 180,
    },
    {
      title: '扫描位置',
      dataIndex: 'location',
      key: 'location',
    },
  ];

  const scanTrendConfig = {
    data: scanTrend,
    xField: 'date',
    yField: 'scans',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  const productQualityData = [
    { type: '合格产品', value: stats.qualifiedProducts || 0 },
    { type: '不合格产品', value: stats.unqualifiedProducts || 0 },
  ];

  const qualityConfig = {
    data: productQualityData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    color: ['#52c41a', '#ff4d4f'],
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>系统仪表盘</h1>
        <p>欢迎使用设施蔬菜溯源管理系统</p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="农户总数"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="产品数量"
              value={stats.totalProducts}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="二维码数量"
              value={stats.totalQrcodes}
              prefix={<QrcodeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 扫描统计 */}
      <Row gutter={[16, 16]} className="scan-stats-row">
        <Col xs={24} lg={12}>
          <Card title="总扫描次数" className="scan-card">
            <Statistic
              value={stats.totalScans}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '32px' }}
            />
            <Progress
              percent={85}
              strokeColor="#1890ff"
              showInfo={false}
              style={{ marginTop: 16 }}
            />
            <p className="scan-trend">较昨日增长 12%</p>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="产品合格率" className="quality-card">
            <div className="quality-stats">
              <div className="quality-item">
                <CheckCircleOutlined className="qualified-icon" />
                <span>合格: {stats.qualifiedProducts}</span>
              </div>
              <div className="quality-item">
                <ExclamationCircleOutlined className="unqualified-icon" />
                <span>不合格: {stats.unqualifiedProducts}</span>
              </div>
            </div>
            <Progress
              percent={Math.round(((stats.qualifiedProducts || 0) / (stats.totalProducts || 1)) * 100)}
              strokeColor="#52c41a"
              format={percent => `${percent}%`}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} lg={16}>
          <Card title="扫描趋势" className="chart-card">
            <Line {...scanTrendConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="产品质量分布" className="chart-card">
            <Pie {...qualityConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* 最近扫描记录 */}
      <Row gutter={[16, 16]} className="recent-scans-row">
        <Col span={24}>
          <Card title="最近扫描记录" className="recent-scans-card">
            <Table
              columns={recentScansColumns}
              dataSource={recentScans}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 