import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminProduct from './AdminProduct';
import AdminCategory from './AdminCategory';
import AdminCustomer from './AdminCustomer';
import AdminEmployee from './AdminEmployee';
import AdminBill from './AdminBill';
import AdminInvoiceDetails from './AdminInvoiceDetails';
import './Admin.css';

const jsonBase = import.meta.env.BASE_URL || '/';

const SECTION_LABEL = {
  dashboard: 'Bảng Tổng Quan',
  products: 'Sản phẩm',
  category: 'Danh mục',
  customer: 'Khách hàng',
  employee: 'Nhân viên',
  bill: 'Hóa đơn',
  invoiceDetails: 'Chi tiết hóa đơn',
};

function fmtNumber(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function fmtCurrency(n) {
  return `${fmtNumber(Number(n) || 0)} đ`;
}

const BILL_STATUS_MAP = {
  delivered: { label: 'Đã giao hàng', cls: 'done' },
  shipping: { label: 'Vận chuyển', cls: 'shipping' },
  pending: { label: 'Chưa giải quyết', cls: 'pending' },
  processing: { label: 'Xử lý', cls: 'processing' },
};

function billStatusFromJson(statusRaw) {
  const key = String(statusRaw || '')
    .trim()
    .toLowerCase();
  if (BILL_STATUS_MAP[key]) return { key, ...BILL_STATUS_MAP[key] };
  return {
    key: 'unknown',
    label: key ? String(statusRaw).trim() : 'Chưa xác định',
    cls: 'unknown',
  };
}

const Admin = () => {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [adminSection, setAdminSection] = useState('dashboard');

  const userMenuRef = useRef(null);
  const revenue = bills.reduce((sum, bill) => sum + Number(bill.total || 0), 0);
  const avgBill = bills.length ? revenue / bills.length : 0;

  useEffect(() => {
    const raw = localStorage.getItem('currentUser');
    if (!raw) {
      navigate('/login');
      return;
    }
    try {
      const u = JSON.parse(raw);
      if (u.role !== 'staff') {
        navigate('/');
        return;
      }
      setAllowed(true);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!allowed) return;

    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const [pRes, cRes, bRes, cuRes, eRes, iRes] = await Promise.all([
          fetch(`${jsonBase}products.json`),
          fetch(`${jsonBase}category.json`),
          fetch(`${jsonBase}bill.json`),
          fetch(`${jsonBase}customer.json`),
          fetch(`${jsonBase}employee.json`),
          fetch(`${jsonBase}invoicedetails.json`),
        ]);
        if (!pRes.ok) throw new Error('Không tải được products.json');
        const pdata = await pRes.json();
        setProducts(Array.isArray(pdata) ? pdata : []);

        if (cRes.ok) {
          const cdata = await cRes.json();
          setCategories(Array.isArray(cdata) ? cdata : []);
        }
        if (bRes.ok) {
          const bdata = await bRes.json();
          setBills(Array.isArray(bdata) ? bdata : []);
        }
        if (cuRes.ok) {
          const cudata = await cuRes.json();
          setCustomers(Array.isArray(cudata) ? cudata : []);
        }
        if (eRes.ok) {
          const edata = await eRes.json();
          setEmployees(Array.isArray(edata) ? edata : []);
        }
        if (iRes.ok) {
          const idata = await iRes.json();
          setInvoiceDetails(Array.isArray(idata) ? idata : []);
        }
      } catch (e) {
        setLoadError(e.message || 'Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [allowed]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, [userMenuOpen]);

  const staffInitials = useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return 'AD';
      const u = JSON.parse(raw);
      const name = String(u.user || u.name || 'Staff').trim();
      const parts = name.split(/\s+/).filter(Boolean);
      if (!parts.length) return 'AD';
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } catch {
      return 'AD';
    }
  }, []);

  const staffDisplayName = useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return 'Administrator';
      const u = JSON.parse(raw);
      return String(u.user || u.name || 'Staff').trim() || 'Administrator';
    } catch {
      return 'Administrator';
    }
  }, []);

  const stats = useMemo(() => {
    return {
      newOrders: 125,
      newComments: 240,
      newCustomers: 1250,
    };
  }, []);

  const goHome = () => navigate('/');
  const logout = () => {
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('userUpdated'));
    navigate('/login');
    setLogoutModalOpen(false);
  };

  const closeMobileNav = () => setMobileSidebarOpen(false);

  const billTableRows = useMemo(() => {
    return bills.slice(0, 5).map(bill => {
      const customer = customers.find(c => String(c.id) === String(bill.customer_id)) || { name: 'Khách vãng lai' };

      const firstDetail = invoiceDetails.find(d => String(d.bill_id) === String(bill.id));
      const product = products.find(p => String(p.id) === String(firstDetail?.product_id));

      return {
        id: bill.id,
        billCode: bill.id,
        customerName: customer.name,
        itemName: product ? product.name : 'Sản phẩm khác',
        status: billStatusFromJson(bill.status)
      };
    });
  }, [bills, customers, invoiceDetails, products]);

  const dailyRevenue = useMemo(() => {
    if (!bills || !Array.isArray(bills)) return [];

    const grouped = bills.reduce((acc, bill) => {
      const date = bill.date;
      acc[date] = (acc[date] || 0) + Number(bill.total);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-15);
  }, [bills]);

  if (!allowed) {
    return <div className="ruang-boot" aria-hidden />;
  }

  return (
    <div className="ruang-layout">
      <div
        className={`ruang-overlay${mobileSidebarOpen ? ' is-visible' : ''}`}
        onClick={closeMobileNav}
        aria-hidden={!mobileSidebarOpen}
      />

      <aside className={`ruang-sidebar${mobileSidebarOpen ? ' is-open' : ''}`} style={{ marginTop: '70px' }}>
        <div className="ruang-sidebar__brand">
          <span className="ruang-sidebar__brand-icon">
            <i className="fa-solid fa-circle-user" aria-hidden />
          </span>
          <div>
            <div>SaleMini</div>
          </div>
        </div>

        <div className="ruang-sidebar__brand_1">
          <ul className="ruang-sidebar__nav">
            <li>
              <button
                type="button"
                className={`ruang-sidebar__link${adminSection === 'dashboard' ? ' is-active' : ''}`}
                onClick={() => {
                  setAdminSection('dashboard');
                  closeMobileNav();
                }}
              >
                <i className="fa-solid fa-house" aria-hidden />
                Trang chủ (admin)
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`ruang-sidebar__link${adminSection === 'products' ? ' is-active' : ''}`}
                onClick={() => {
                  setAdminSection('products');
                  closeMobileNav();
                }}
              >
                <i className="fa-solid fa-box" aria-hidden />
                Sản phẩm
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`ruang-sidebar__link${adminSection === 'category' ? ' is-active' : ''}`}
                onClick={() => {
                  setAdminSection('category');
                  closeMobileNav();
                }}
              >
                <i className="fa-solid fa-tags" aria-hidden />
                Danh mục
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`ruang-sidebar__link${adminSection === 'customer' ? ' is-active' : ''}`}
                onClick={() => {
                  setAdminSection('customer');
                  closeMobileNav();
                }}
              >
                <i className="fa-solid fa-users" aria-hidden />
                Khách hàng
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`ruang-sidebar__link${adminSection === 'employee' ? ' is-active' : ''}`}
                onClick={() => {
                  setAdminSection('employee');
                  closeMobileNav();
                }}
              >
                <i className="fa-solid fa-user-tie" aria-hidden />
                Nhân viên
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`ruang-sidebar__link${adminSection === 'bill' ? ' is-active' : ''}`}
                onClick={() => {
                  setAdminSection('bill');
                  closeMobileNav();
                }}
              >
                <i className="fa-solid fa-file-invoice" aria-hidden />
                Hóa đơn
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`ruang-sidebar__link${adminSection === 'invoiceDetails' ? ' is-active' : ''}`}
                onClick={() => {
                  setAdminSection('invoiceDetails');
                  closeMobileNav();
                }}
              >
                <i className="fa-solid fa-receipt" aria-hidden />
                Chi tiết hóa đơn
              </button>
            </li>
          </ul>
        </div>
        <div className="ruang-sidebar__version">Version 1.1.0</div>
      </aside>

      <div className="ruang-main">
        <header className="ruang-header">
          <button
            type="button"
            className="ruang-header__toggle"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <i className="fa-solid fa-bars" />
          </button>

          <div className="ruang-header__right">
            <button
              type="button"
              className="ruang-header__home-btn"
              onClick={goHome}
              title="Về trang chủ bán hàng"
            >
              <i className="fa-solid fa-house" />
            </button>

            <div className="ruang-user-menu" ref={userMenuRef}>
              <button
                type="button"
                className="ruang-user-menu__trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="ruang-user-menu__avatar">{staffInitials}</div>
                <span className="ruang-user-menu__name">{staffDisplayName}</span>
                <i className="fa-solid fa-angle-down ruang-user-menu__caret" />
              </button>

              {userMenuOpen && (
                <div className="ruang-user-menu__dropdown">
                  <div className="ruang-user-menu__header">
                    <p className="ruang-user-menu__dropdown-name">{staffDisplayName}</p>
                    <p className="ruang-user-menu__dropdown-role">Nhân viên quản trị</p>
                  </div>
                  <hr className="ruang-user-menu__divider" />
                  <button
                    type="button"
                    className="ruang-user-menu__item ruang-user-menu__item--logout"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setLogoutModalOpen(true);
                    }}
                  >
                    <i className="fa-solid fa-right-from-bracket" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="ruang-content" >
          <div className="ruang-content__head">
            <h1 className="ruang-content__title">{SECTION_LABEL[adminSection]}</h1>
          </div>

          {loading ? (
            <div className="ruang-loading-box">
              <div className="ruang-spinner" />
              <p>Đang tải dữ liệu, vui lòng đợi...</p>
            </div>
          ) : loadError ? (
            <div className="ruang-error-box">
              <i className="fa-solid fa-triangle-exclamation ruang-error-box__icon" />
              <div className="ruang-error-box__body">
                <h4 className="ruang-error-box__title">Lỗi tải dữ liệu</h4>
                <p className="ruang-error-box__msg">{loadError}</p>
                <button
                  type="button"
                  className="ruang-btn ruang-btn--primary ruang-btn--sm"
                  onClick={() => window.location.reload()}
                >
                  Tải lại trang
                </button>
              </div>
            </div>
          ) : (
            <div className="ruang-section-body">
              {adminSection === 'dashboard' && (
                <div className="ruang-dashboard">
                  <div className="ruang-cards-grid"
                    onClick={() => setAdminSection('bill')}
                    role="button"
                    tabIndex="0"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="ruang-stat-card">
                      <div className="ruang-stat-card__body">
                        <div className="ruang-stat-card__icon-box">
                          <i className="fa-solid fa-calendar-days" />
                        </div>
                        <div className="ruang-stat-card__info">
                          <div className="ruang-stat-card__label">Tổng doanh thu</div>
                          <div className="ruang-stat-card__value">{fmtCurrency(revenue)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="ruang-stat-card">
                      <div className="ruang-stat-card__body"
                        onClick={() => setAdminSection('bill')}
                        role="button"
                        tabIndex="0"
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="ruang-stat-card__icon-box">
                          <i className="fa-solid fa-list" />
                        </div>
                        <div className="ruang-stat-card__info">
                          <div className="ruang-stat-card__label">Số lượng đơn hàng</div>
                          <div className="ruang-stat-card__value">{fmtNumber(bills.length)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="ruang-stat-card"
                      onClick={() => setAdminSection('products')}
                      role="button"
                      tabIndex="0"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="ruang-stat-card__body">
                        <div className="ruang-stat-card__icon-box">
                          <i className="fa-solid fa-box" />
                        </div>
                        <div className="ruang-stat-card__info">
                          <div className="ruang-stat-card__label">Sản phẩm đã bán</div>
                          <div className="ruang-stat-card__value">
                            {fmtNumber(invoiceDetails.reduce((sum, item) => sum + Number(item.quantity || 0), 0))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ruang-dashboard__charts">
                    <div className="ruang-chart-card" style={{ gridColumn: '1 / -1' }}>
                      <div className="ruang-chart-card__header">
                        <h6 className="ruang-chart-card__title">Doanh thu theo ngày</h6>
                      </div>
                      <div className="ruang-chart-card__body">
                        <svg viewBox="0 0 1000 300" style={{ width: '100%', height: '300px' }}>
                          <line x1="50" y1="10" x2="50" y2="260" stroke="#333" strokeWidth="2" />
                          <line x1="50" y1="260" x2="950" y2="260" stroke="#333" strokeWidth="2" />

                          {dailyRevenue.map(([date, total], index) => {
                            const maxHeight = 240;
                            const barHeight = Math.min(total / 10000, maxHeight);
                            const gap = 57;
                            const xPos = 80 + (index * gap);

                            return (
                              <rect
                                key={date}
                                x={xPos}
                                y={259 - barHeight}
                                width={50}
                                height={barHeight}
                                fill={index % 2 === 0 ? "#cccccc" : "#999999"}
                                style={{ cursor: 'pointer', transition: 'fill 0.1s ease-in-out' }}
                                onMouseOver={(e) => e.target.style.fill = '#4b4141'}
                                onMouseOut={(e) => e.target.style.fill = index % 2 === 0 ? "#cccccc" : "#999999"}
                              >
                                <title>Ngày: {date} | Tổng doanh thu: {fmtCurrency(total)}</title>
                              </rect>
                            );
                          })}
                        </svg>
                      </div>
                    </div>

                  </div>
                  <div className="admin-dashboard-row">
                    <div className="ruang-chart-card"
                      onClick={() => setAdminSection('products')}
                      role="button"
                      tabIndex="0"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="ruang-chart-card__header">
                        <h6 className="ruang-chart-card__title">Top 5 sản phẩm bán chạy</h6>
                      </div>
                      <div className="ruang-chart-card__body">
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {products.slice(0, 5).map((p, idx) => (
                            <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                              <span style={{ fontSize: '13.5px' }}>{idx + 1}. {p.name}</span>
                              <span style={{ fontWeight: 'bold', fontSize: '13.5px' }}>{p.sold || 0} bán</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="ruang-table-card"
                      onClick={() => setAdminSection('bill')}
                      role="button"
                      tabIndex="0"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="ruang-table-card__header">
                        <h6 className="ruang-table-card__title">Hóa đơn gần đây</h6>
                      </div>
                      <div className="ruang-table-card__body">
                        <div className="ruang-table-responsive">
                          <table className="ruang-table">
                            <thead>
                              <tr>
                                <th>Mã HĐ</th>
                                <th>Khách hàng</th>
                                <th>Sản phẩm đầu</th>
                                <th>Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody>
                              {billTableRows.map((row) => (
                                <tr key={row.id}>
                                  <td><strong>#{row.billCode}</strong></td>
                                  <td>{row.customerName}</td>
                                  <td>{row.itemName}</td>
                                  <td>
                                    <span className={`ruang-badge ruang-badge--${row.status.cls}`}>
                                      {row.status.label}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="ruang-chart-card"
                      onClick={() => setAdminSection('customer')}
                      role="button"
                      tabIndex="0"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="ruang-chart-card__header">
                        <h6 className="ruang-chart-card__title">Top 3 Khách hàng thân thiết</h6>
                      </div>
                      <div className="ruang-chart-card__body">
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1px' }}>
                          {customers.slice(0, 3).map((customer, idx) => (
                            <li key={customer.id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {customer.name.charAt(0)}
                              </div>
                              <div style={{ marginLeft: '13px', fontSize: '15px' }}>
                                {customer.name}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

              )}

              {adminSection === 'products' && (
                <AdminProduct products={products} setProducts={setProducts} categories={categories} />
              )}
              {adminSection === 'category' && (
                <AdminCategory categories={categories} setCategories={setCategories} products={products} />
              )}
              {adminSection === 'customer' && (
                <AdminCustomer customers={customers} setCustomers={setCustomers} bills={bills} />
              )}
              {adminSection === 'employee' && (
                <AdminEmployee employees={employees} setEmployees={setEmployees} />
              )}
              {adminSection === 'bill' && (
                <AdminBill
                  bills={bills}
                  setBills={setBills}
                  customers={customers}
                  invoiceDetails={invoiceDetails}
                  billStatusFromJson={billStatusFromJson}
                  BILL_STATUS_MAP={BILL_STATUS_MAP}
                />
              )}
              {adminSection === 'invoiceDetails' && (
                <AdminInvoiceDetails
                  invoiceDetails={invoiceDetails}
                  setInvoiceDetails={setInvoiceDetails}
                  bills={bills}
                  products={products}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {logoutModalOpen && (
        <div className="ruang-modal-backdrop">
          <div className="ruang-modal">
            <div className="ruang-modal__header">
              <h5 className="ruang-modal__title">Xác nhận đăng xuất</h5>
              <button
                type="button"
                className="ruang-modal__close"
                onClick={() => setLogoutModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="ruang-modal__body">
              <p>Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị không?</p>
            </div>
            <div className="ruang-modal__footer">
              <button
                type="button"
                className="ruang-btn ruang-btn--secondary"
                onClick={() => setLogoutModalOpen(false)}
              >
                Hủy bỏ
              </button>
              <button type="button" className="ruang-btn ruang-btn--danger" onClick={logout}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;