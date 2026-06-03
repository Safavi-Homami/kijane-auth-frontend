// src/layouts/AdminLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  UserCog,
  Bell,
  KeyRound,
  Settings
} from "lucide-react";
import "./AdminLayout.css";

import { BookOpenCheck } from "lucide-react";


const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        
        <div className="sidebar-section">
          <div className="section-title">
              <UserCog className="sidebar-icon" /> 
            Admin
          </div>
          <nav>
            <NavLink to="/admin" end className="sidebar-link">
              <LayoutDashboard className="icon" />
              Dashboard
            </NavLink>
            <NavLink to="/admin/users" className="sidebar-link">
              <Users className="icon" />
              Benutzer
            </NavLink>
            <NavLink to="/admin/course-access" className="sidebar-link">
              <ShieldCheck className="icon" />
              Kursfreigaben
            </NavLink>
            <NavLink to="/admin/groups" className="sidebar-link">
              <Users className="icon" />
              Gruppen
            </NavLink>

          </nav>
        </div>

        
       </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
