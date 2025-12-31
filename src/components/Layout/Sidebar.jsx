// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PATHS from '../../constants/path';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  HomeOutlined,
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  PlusOutlined,
  BankOutlined,
  TeamOutlined,
  SettingOutlined, // Added SettingOutlined
  LogoutOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, Avatar, Typography, ConfigProvider } from 'antd';

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const getSelectedKey = () => {
    const pathMap = {
      [PATHS.TENANT_DASHBOARD]: 'tenant-dashboard',
      [PATHS.TENANT_PROPERTIES]: 'tenant-properties',
      [PATHS.TENANT_BOOKINGS]: 'tenant-bookings',
      [PATHS.TENANT_PROFILE]: 'tenant-profile',
      [PATHS.TENANT_CHANGE_PASSWORD]: 'tenant-change-password', // Added

      [PATHS.OWNER_DASHBOARD]: 'owner-dashboard',
      [PATHS.OWNER_PROPERTIES]: 'owner-properties',
      [PATHS.OWNER_ADD_PROPERTY]: 'owner-add-property',
      [PATHS.OWNER_BOOKINGS]: 'owner-bookings',
      [PATHS.OWNER_PROFILE]: 'owner-profile',

      [PATHS.ADMIN_DASHBOARD]: 'admin-dashboard',
      [PATHS.ADMIN_USERS]: 'admin-users',
      [PATHS.ADMIN_PROPERTIES]: 'admin-properties',
      [PATHS.ADMIN_ADD_PROPERTY]: 'admin-add-property',
      [PATHS.ADMIN_SETTINGS]: 'admin-settings',
      [PATHS.ADMIN_PAYMENT_STATUS]: 'payment-status',
    };
    return pathMap[location.pathname] || '';
  };

  const tenantItems = [
    { key: 'tenant-dashboard', icon: <DashboardOutlined />, label: 'Dashboard', onClick: () => navigate(PATHS.TENANT_DASHBOARD) },
    { key: 'tenant-properties', icon: <SearchOutlined />, label: 'Find Properties', onClick: () => navigate(PATHS.TENANT_PROPERTIES) },
    { key: 'tenant-bookings', icon: <CalendarOutlined />, label: 'My Bookings', onClick: () => navigate(PATHS.TENANT_BOOKINGS) },
    { key: 'tenant-profile', icon: <UserOutlined />, label: 'Profile', onClick: () => navigate(PATHS.TENANT_PROFILE) },
    { key: 'tenant-change-password', icon: <SettingOutlined />, label: 'Change Password', onClick: () => navigate(PATHS.TENANT_CHANGE_PASSWORD) }, // Added
  ];

  const ownerItems = [
    { key: 'owner-dashboard', icon: <DashboardOutlined />, label: 'Dashboard', onClick: () => navigate(PATHS.OWNER_DASHBOARD) },
    { key: 'owner-properties', icon: <BankOutlined />, label: 'My Properties', onClick: () => navigate(PATHS.OWNER_PROPERTIES) },
    { key: 'owner-add-property', icon: <PlusOutlined />, label: 'Add Property', onClick: () => navigate(PATHS.OWNER_ADD_PROPERTY) },
    { key: 'owner-bookings', icon: <CalendarOutlined />, label: 'Bookings', onClick: () => navigate(PATHS.OWNER_BOOKINGS) },
    { key: 'owner-profile', icon: <UserOutlined />, label: 'Profile', onClick: () => navigate(PATHS.OWNER_PROFILE) },
  ];

  const adminItems = [
    { key: 'admin-dashboard', icon: <DashboardOutlined />, label: 'Dashboard', onClick: () => navigate(PATHS.ADMIN_DASHBOARD) },
    { key: 'admin-users', icon: <TeamOutlined />, label: 'Users', onClick: () => navigate(PATHS.ADMIN_USERS) },
    { key: 'admin-properties', icon: <BankOutlined />, label: 'Properties', onClick: () => navigate(PATHS.ADMIN_PROPERTIES) },
    { key: 'admin-add-property', icon: <PlusOutlined />, label: 'Advertisement', onClick: () => navigate(PATHS.ADMIN_ADD_PROPERTY) },
    { key: 'admin-settings', icon: <SettingOutlined />, label: 'Settings', onClick: () => navigate(PATHS.ADMIN_SETTINGS) },
    { key: 'payment-status', icon: <WalletOutlined />, label: 'Payment Status', onClick: () => navigate(PATHS.ADMIN_PAYMENT_STATUS) },

  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'tenant': return tenantItems;
      case 'owner': return ownerItems;
      case 'admin': return adminItems;
      default: return [];
    }
  };

  const handleLogout = () => {
    logout();
    navigate(PATHS.LOGIN);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00BFA5',
          colorBgContainer: '#1A2B3C',
          colorText: '#ffffff',
        },
      }}
    >
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          backgroundColor: '#1A2B3C',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '35px',
                height: '35px',
                borderRadius: '10px',
                backgroundColor: '#00BFA5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 191, 165, 0.3)'
              }}>
                <HomeOutlined style={{ color: 'white', fontSize: '18px' }} />
              </div>
              <div>
                <h2 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                  RentPortal
                </h2>
                <div className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-[#00BFA5] inline-block uppercase tracking-wider">
                  {user?.role}
                </div>
              </div>
            </div>
          )}
          
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: 'white', fontSize: '18px' }}
          />
        </div>

        {/* User Info */}
        {!collapsed && (
          <div style={{ padding: '20px 16px', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar 
                size={40} 
                style={{ backgroundColor: '#00BFA5', border: '2px solid rgba(255,255,255,0.1)' }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text strong style={{ color: 'white', display: 'block' }}>{user?.name}</Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '11px' }}>{user?.email}</Text>
              </div>
            </div>
          </div>
        )}

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={getMenuItems()}
          style={{
            marginTop: '16px',
            backgroundColor: 'transparent',
            border: 'none',
          }}
          className="custom-sidebar-menu"
        />

        {/* Footer - Logout */}
        <div style={{
          padding: '16px',
          position: 'absolute',
          bottom: 0,
          width: '100%',
        }}>
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="hover:bg-red-500/10"
            style={{
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              width: '100%',
              borderRadius: '12px',
              color: '#ff4d4f',
              fontWeight: '600'
            }}
          >
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </Sider>
    </ConfigProvider>
  );
};

export default Sidebar;
