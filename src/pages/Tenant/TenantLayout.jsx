import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import '../../index.css';

const { Content } = Layout;

const TenantLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <Layout>
        <Content style={{ padding: 24 }}>
          <div className="max-w-7xl mx-auto">
            {children ? children : <Outlet />}
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default TenantLayout;
