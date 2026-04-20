import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout() {
  return (
    <div className="admin-layout section">
      <div className="container admin-inner">
        <aside className="admin-sidebar card">
          <h2 className="admin-sidebar-title">Admin</h2>
          <nav className="admin-nav">
            <NavLink to="/admin" end>
              Dashboard
            </NavLink>
            <NavLink to="/admin/products">Products</NavLink>
            <NavLink to="/admin/categories">Categories</NavLink>
            <NavLink to="/admin/orders">Orders</NavLink>
            <NavLink to="/admin/users">Users</NavLink>
          </nav>
        </aside>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
