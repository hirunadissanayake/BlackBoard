import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './Shell.css';
import { Menu, X } from 'lucide-react';

const Shell = ({ children, title, action }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="shell">
            <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
                <Sidebar onClose={closeSidebar} />
                <button className="sidebar-close-btn" onClick={closeSidebar}>
                    <X size={24} />
                </button>
            </div>

            {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

            <main className="main-content">
                <header className="page-header">
                    <div className="header-left">
                        <button className="mobile-menu-btn" onClick={toggleSidebar}>
                            <Menu size={24} />
                        </button>
                        <h1 className="page-title">{title}</h1>
                    </div>
                    {action && <div className="page-action">{action}</div>}
                </header>
                <div className="content-area">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Shell;
