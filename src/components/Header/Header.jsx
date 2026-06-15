import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Bell, MapPin, Phone } from "lucide-react";
import './Header.css';
import logoImg from "../../img/Logo.png";

import { imageMap } from '../../utils/productImages';
import { normalizeSearchText, rankProductsBySearch, } from '../../utils/productSearch';

const jsonBase = import.meta.env.BASE_URL || '/';

const Header = () => {
    const navigate = useNavigate();
    const [hoveredMenu, setHoveredMenu] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [language, setLanguage] = useState(() => localStorage.getItem('app_lang') || 'VN');

    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    const searchBoxRef = useRef(null);

    const translations = {
        VN: {
            hotline: "Hotline: 1234 5678",
            storeSystem: "Hệ thống cửa hàng",
            customerSupport: "Hỗ trợ khách hàng",
            orders: "Đơn hàng",
            login: "Đăng nhập",
            home: "TRANG CHỦ",
            products: "SẢN PHẨM",
            freshFood: "Thực phẩm tươi sống",
            frozenFood: "Thực phẩm đông lạnh",
            dryFood: "Thực phẩm khô",
            drinks: "Đồ uống",
            household: "Đồ dùng gia đình",
            beauty: "Mỹ phẩm & Chăm sóc cá nhân",
            cleaning: "Chất tẩy rửa & Vệ sinh nhà cửa",
            snacks: "Đồ ăn vặt & Ăn nhẹ",
            baby: "Đồ dùng cho Mẹ & Bé",
            stationery: "Văn phòng phẩm & Tiện ích",
            freshFoodNav: "THỰC PHẨM TƯƠI SỐNG",
            frozenFoodNav: "THỰC PHẨM ĐÔNG LẠNH",
            householdNav: "ĐỒ DÙNG GIA ĐÌNH",
            search: "Tìm kiếm...",
            langActive: "Ngôn ngữ: ",
            vietnamese: "Tiếng Việt",
            english: "Tiếng Anh",
            emptySearch: "Không tìm thấy sản phẩm tương tự. Nhấn Enter để tìm tiếp."
        },
        EN: {
            hotline: "Hotline: 1234 5678",
            storeSystem: "Store System",
            customerSupport: "Customer Support",
            orders: "Orders",
            login: "Login",
            home: "HOME",
            products: "PRODUCTS",
            freshFood: "Fresh Food",
            frozenFood: "Frozen Food",
            dryFood: "Dry Food",
            drinks: "Drinks",
            household: "Household Items",
            beauty: "Beauty & Personal Care",
            cleaning: "Cleaning & Home Care",
            snacks: "Snacks",
            baby: "Mother & Baby Care",
            stationery: "Stationery & Utilities",
            freshFoodNav: "FRESH FOOD",
            frozenFoodNav: "FROZEN FOOD",
            householdNav: "HOUSEHOLD",
            search: "Search...",
            langActive: "Language: ",
            vietnamese: "Vietnamese",
            english: "English",
            emptySearch: "No similar products found. Press Enter to search."
        }
    };

    const t = translations[language];

    const userLabel = currentUser ? (currentUser.fullname || currentUser.name || currentUser.username || 'Tài khoản') : '';

    const handleLogout = () => {
        setUserMenuOpen(false);
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        window.dispatchEvent(new Event('userUpdated'));
        navigate('/');
    };

    const normalizeText = (text) => {
        if (!text) return '';
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .trim();
    };

    const searchMatches = useMemo(() => {
        const queryClean = normalizeText(searchQuery);
        if (!queryClean) return [];

        return products
            .filter(p => {
                const nameClean = normalizeText(p.name);
                const descClean = p.description ? normalizeText(p.description) : '';
                return nameClean.includes(queryClean) || descClean.includes(queryClean);
            })
            .slice(0, 6);
    }, [products, searchQuery]);

    const updateCartCount = () => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const cart = JSON.parse(savedCart);
                const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
                setCartCount(totalItems);
            } catch (e) { setCartCount(0); }
        } else { setCartCount(0); }
    };

    const updateCurrentUser = () => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser));
            } catch (e) { setCurrentUser(null); }
        } else {
            setCurrentUser(null);
        }
    };

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('app_lang', lang);
        window.dispatchEvent(new Event('languageChange'));
    };

    useEffect(() => {
        updateCartCount();
        updateCurrentUser();

        window.addEventListener('cartUpdated', updateCartCount);
        window.addEventListener('userUpdated', updateCurrentUser);
        window.addEventListener('storage', () => {
            updateCartCount();
            updateCurrentUser();
        });

        return () => {
            window.removeEventListener('cartUpdated', updateCartCount);
            window.removeEventListener('userUpdated', updateCurrentUser);
            window.removeEventListener('storage', updateCurrentUser);
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const loadProducts = async () => {
            try {
                const res = await fetch(`${jsonBase}products.json`);
                if (!res.ok) return;
                const data = await res.json();
                if (cancelled) return;
                setProducts(data);
            } catch (err) {
                console.error('Lỗi tải danh sách sản phẩm:', err);
            }
        };
        loadProducts();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (searchFocused && searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
                setSearchFocused(false);
            }
            if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => { document.removeEventListener('mousedown', handleOutsideClick); };
    }, [searchFocused, userMenuOpen]);

    const goToProduct = (product) => {
        setSearchQuery('');
        setSearchFocused(false);
        navigate(`/product/${product.id}`, { state: { product } });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchFocused(false);
    };

    const renderPrice = (p) => {
        const targetPrice = p.price !== undefined ? p.price : p.currentPrice;
        if (targetPrice === undefined || targetPrice === null) return null;

        if (typeof targetPrice === 'string' && (targetPrice.includes('đ') || targetPrice.toLowerCase().includes('vnd'))) {
            return targetPrice;
        }

        const numericPrice = Number(targetPrice);
        if (isNaN(numericPrice)) return targetPrice;
        return `${numericPrice.toLocaleString('vi-VN')} đ`;
    };

    return (
        <header className="salemini-header">
            <div className="header-top">
                <div className="container flex-between">
                    <div className="top-left flex-align">
                        <span className="top-item"><Phone size={14} /> {t.hotline}</span>
                        <span className="top-item"><MapPin size={14} /> {t.storeSystem}</span>
                    </div>
                    <div className="top-right flex-align">
                        <span className="top-item">{t.customerSupport}</span>
                        <div className="language-selector top-item">
                            <span className="lang-active">{t.langActive}</span>
                            <span
                                className={`lang-option ${language === 'VN' ? 'active' : ''}`}
                                onClick={() => changeLanguage('VN')}
                                style={{ cursor: 'pointer' }}
                            >
                                {t.vietnamese}
                            </span>
                            <span className="lang-separator">|</span>
                            <span
                                className={`lang-option ${language === 'EN' ? 'active' : ''}`}
                                onClick={() => changeLanguage('EN')}
                                style={{ cursor: 'pointer' }}
                            >
                                {t.english}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="header-main">
                <div className="container flex-align">
                    <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        <img src={logoImg} alt="SaleMini Logo" />
                    </div>

                    <div className="search-bar" ref={searchBoxRef}>
                        <form className="search-wrapper" onSubmit={handleSearchSubmit}>
                            <Search className="search-icon" size={18} onClick={handleSearchSubmit} style={{ cursor: 'pointer' }} />
                            <input
                                type="search"
                                placeholder={t.search}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                autoComplete="off"
                            />
                        </form>

                        {searchFocused && searchQuery.trim().length > 0 && (
                            <ul className="header-search-dropdown">
                                {searchMatches.length === 0 ? (
                                    <li className="header-search-empty">
                                        {t.emptySearch}
                                    </li>
                                ) : (
                                    searchMatches.map((p) => (
                                        <li key={p.id} className="header-search-item">
                                            <button
                                                type="button"
                                                className="header-search-option"
                                                onPointerDown={() => goToProduct(p)}
                                            >
                                                <div className="header-search-thumb-wrap">
                                                    <img
                                                        src={imageMap[p.imageKey] || p.image || p.img || 'https://via.placeholder.com/50?text=No+Image'}
                                                        alt={p.name}
                                                        className="header-search-thumb"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                                                        }}
                                                    />
                                                </div>

                                                <div className="header-search-meta">
                                                    <span className="header-search-name">
                                                        {p.name}
                                                    </span>
                                                    {renderPrice(p) && (
                                                        <span className="header-search-price">
                                                            {renderPrice(p)}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}
                    </div>

                    <div className="user-actions flex-align">
                        <div className="auth-links flex-align">
                            <a href="#orders" onClick={(e) => { e.preventDefault(); navigate('/orders'); }}>{t.orders}</a>

                            {currentUser ? (
                                <div className="header-user-menu" ref={userMenuRef}>
                                    <button
                                        type="button"
                                        className={`login-link header-user-menu-trigger ${userMenuOpen ? 'is-active' : ''}`}
                                        aria-expanded={userMenuOpen}
                                        aria-haspopup="true"
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    >
                                        {userLabel}
                                        <i
                                            className={`fas fa-chevron-down header-user-menu-caret ${userMenuOpen ? 'is-open' : ''}`}
                                            aria-hidden="true"
                                        />
                                    </button>

                                    {userMenuOpen && (
                                        <div className="header-user-dropdown" role="menu">
                                            <button
                                                type="button"
                                                className="header-user-dropdown-item"
                                                role="menuitem"
                                                onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                                            >
                                                HỒ SƠ
                                            </button>

                                            {currentUser.role === 'staff' && (
                                                <button
                                                    type="button"
                                                    className="header-user-dropdown-item"
                                                    role="menuitem"
                                                    onClick={() => { setUserMenuOpen(false); navigate('/admin'); }}
                                                >
                                                    Quản trị
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className="header-user-dropdown-item header-user-dropdown-item--logout"
                                                role="menuitem"
                                                onClick={handleLogout}
                                            >
                                                Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="login-link"
                                    onClick={() => navigate('/login')}
                                >
                                    Đăng nhập
                                </button>
                            )}
                        </div>

                        <span className="divider">|</span>

                        <div className="action-icons flex-align">
                            <div className="icon-item">
                                <Bell size={24} />
                            </div>
                            <div className="icon-item cart-wrapper" onClick={() => navigate('/cart')} style={{ cursor: 'pointer' }}>
                                <ShoppingCart size={24} />
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <nav className="header-nav">
                <div className="container flex-align">
                    <ul className="nav-links">
                        <li><a href="/" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/'); }}>{t.home}</a></li>

                        <li
                            className="nav-item-dropdown"
                            onMouseEnter={() => setHoveredMenu(true)}
                            onMouseLeave={() => setHoveredMenu(false)}
                        >
                            <div className="category-wrapper" style={{ cursor: 'pointer' }}>
                                <span className="category-text">{t.products}</span>
                            </div>

                            {hoveredMenu && (
                                <div className="dropdown-menu">
                                    <a href="/fresh" className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/fresh'); }}>{t.freshFood}</a>
                                    <a href="/frozen" className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/frozen'); }}>{t.frozenFood}</a>
                                    <a href="/dry" className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/dry'); }}>{t.dryFood}</a>
                                    <a href="/drinks" className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/drinks'); }}>{t.drinks}</a>
                                    <a href="/household" className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/household'); }}>{t.household}</a>
                                    <a href="/beauty" className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/beauty'); }}>{t.beauty}</a>
                                    <a href="/cleaning" className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/cleaning'); }}>{t.cleaning}</a>
                                    <a href="/snacks" className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/snacks'); }}>{t.snacks}</a>
                                    <a href="/baby" className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/baby'); }}>{t.baby}</a>
                                    <a href="/stationery" className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/stationery'); }}>{t.stationery}</a>
                                </div>
                            )}
                        </li>

                        <li><a href="/fresh" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/fresh'); }}>{t.freshFoodNav}</a></li>
                        <li><a href="/frozen" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/frozen'); }}>{t.frozenFoodNav}</a></li>
                        <li><a href="/household" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/household'); }}>{t.householdNav}</a></li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;