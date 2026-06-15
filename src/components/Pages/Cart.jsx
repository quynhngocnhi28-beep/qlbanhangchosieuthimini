import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Calendar, FileText, User } from 'lucide-react';
import { imageMap } from '../../utils/productImages';
import './Cart.css';

import visaImg from '../../img/visa-logo.png';
import paypalImg from '../../img/paypal-logo.png';
import momoImg from '../../img/momo-logo.png';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const [recipientName, setRecipientName] = useState('');

    const sortCartItems = (items) => {
        return [...items].sort((a, b) => {
            if (a.isPreOrder === b.isPreOrder) return 0;
            return a.isPreOrder ? -1 : 1;
        });
    };

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCartItems(sortCartItems(JSON.parse(savedCart)));
        }
    }, []);

    const updateCart = (newCart) => {
        const sortedCart = sortCartItems(newCart);
        setCartItems(sortedCart);
        localStorage.setItem('cart', JSON.stringify(sortedCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const isSameProduct = (item, id, size, isPreOrder) =>
        item.id === id && item.selectedSize === size && item.isPreOrder === isPreOrder;

    const updateDeliveryDate = (id, size, isPreOrder, date) => {
        const updatedCart = cartItems.map(item =>
            isSameProduct(item, id, size, isPreOrder) ? { ...item, deliveryDate: date } : item
        );
        updateCart(updatedCart);
    };

    const updateNote = (id, size, isPreOrder, note) => {
        const updatedCart = cartItems.map(item =>
            isSameProduct(item, id, size, isPreOrder) ? { ...item, note: note } : item
        );
        updateCart(updatedCart);
    };

    const increaseQuantity = (id, size, isPreOrder) => {
        const updatedCart = cartItems.map(item =>
            isSameProduct(item, id, size, isPreOrder) ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
        updateCart(updatedCart);
    };

    const decreaseQuantity = (id, size, isPreOrder) => {
        const updatedCart = cartItems.map(item => {
            if (isSameProduct(item, id, size, isPreOrder)) {
                const newQty = (item.quantity || 1) - 1;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean);
        updateCart(updatedCart);
    };

    const removeItem = (id, size, isPreOrder) => {
        const updatedCart = cartItems.filter(item => !isSameProduct(item, id, size, isPreOrder));
        updateCart(updatedCart);
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const priceStr = String(item.currentPrice || "0");
            const price = parseFloat(priceStr.replace(/[^\d]/g, '')) || 0;
            return total + (price * (item.quantity || 1));
        }, 0);
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

    const handleCheckout = () => {
        const isNameMissing = !recipientName.trim();
        const isDateMissing = cartItems.some(item => item.isPreOrder && !item.deliveryDate);

        if (isNameMissing && isDateMissing) {
            alert("Vui lòng nhập đầy đủ ngày giao hàng và tên người nhận cho sản phẩm đặt trước!");
        } else if (isNameMissing) {
            alert("Vui lòng nhập tên người nhận cho sản phẩm đặt trước!");
        } else if (isDateMissing) {
            alert("Vui lòng chọn ngày giao hàng cho sản phẩm đặt trước!");
        } else {
            console.log("Đặt hàng thành công!");
            alert("Đặt hàng thành công!");
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-page-wrapper">
                <div className="cart-empty" style={{ textAlign: 'center', width: '100%', padding: '50px' }}>
                    <h2>Giỏ hàng của bạn đang trống</h2>
                    <button className="btn-apply" onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page-wrapper">
            <div className="cart-main-container">
                <div className="cart-header-actions" style={{ marginBottom: '15px' }}>
                    <button className="btn-apply" onClick={() => navigate('/')}>← Tiếp tục mua hàng</button>
                </div>

                <h2 className="cart-page-title">Giỏ hàng</h2>

                <div className="cart-items-box">
                    {cartItems.map((item, index) => {
                        const priceStr = String(item.currentPrice || "0");
                        const price = parseFloat(priceStr.replace(/[^\d]/g, '')) || 0;
                        const uniqueKey = `${item.id}-${item.selectedSize}-${item.isPreOrder}-${index}`;
                        const isDateMissing = item.isPreOrder && !item.deliveryDate;

                        return (
                            <div key={uniqueKey} className="cart-item-group" style={{ marginBottom: '20px' }}>
                                <div className="cart-item-row">
                                    <div className="item-thumbnail">
                                        <img src={item.image || imageMap[item.imageKey]} alt={item.name} />
                                    </div>
                                    <div className="item-title-field">
                                        <div>
                                            <strong>{item.name}</strong>
                                            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                                                Size: {item.selectedSize} |
                                                <span style={{ color: item.isPreOrder ? '#e62600' : '#2e7d32', fontWeight: 'bold' }}>
                                                    {item.isPreOrder ? " Hàng đặt trước" : " Hàng thường"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item-qty-field">
                                        <span className="qty-num">{item.quantity || 1}</span>
                                        <div className="qty-btns">
                                            <button onClick={() => increaseQuantity(item.id, item.selectedSize, item.isPreOrder)}>▲</button>
                                            <button onClick={() => decreaseQuantity(item.id, item.selectedSize, item.isPreOrder)}>▼</button>
                                        </div>
                                    </div>
                                    <div className="item-total-field">{formatPrice(price * (item.quantity || 1))}</div>
                                    <button className="btn-delete-item" onClick={() => removeItem(item.id, item.selectedSize, item.isPreOrder)}>
                                        <Trash2 size={25} color="#a00000" />
                                    </button>
                                </div>

                                {item.isPreOrder && (
                                    <div className="preorder-date-row">
                                        <div className="date-picker-box">
                                            <Calendar size={16} />
                                            <label>Ngày giao hàng:</label>
                                            <input
                                                type="date"
                                                className={`date-input-field ${item.isPreOrder && !item.deliveryDate ? 'input-error' : ''}`}
                                                style={{ border: isDateMissing ? '1px solid red' : '1px solid #ccc' }}
                                                value={item.deliveryDate || ''}
                                                onChange={(e) => updateDeliveryDate(item.id, item.selectedSize, item.isPreOrder, e.target.value)}
                                            />
                                        </div>
                                        <div className="recipient-picker-box">
                                            <User size={16} />
                                            <label>Tên người nhận:</label>
                                            <input
                                                type="text"
                                                className={`recipient-input-field ${!recipientName.trim() ? 'input-error' : ''}`}
                                                placeholder="Nhập tên người nhận..."
                                                value={recipientName}
                                                onChange={(e) => setRecipientName(e.target.value)}
                                            />
                                        </div>
                                        <div className="note-picker-box">
                                            <FileText size={16} />
                                            <label>Ghi chú:</label>
                                            <input
                                                type="text"
                                                className="note-input-field"
                                                style={{ border: '1px solid #ccc' }}
                                                placeholder="Nhập ghi chú..."
                                                value={item.note || ''}
                                                onChange={(e) => updateNote(item.id, item.selectedSize, item.isPreOrder, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="cart-sidebar">
                <div className="coupon-box">
                    <div className="coupon-label">Mã giảm giá</div>
                    <div className="coupon-input-row">
                        <input type="text" className="coupon-input-field" placeholder="Nhập mã..." value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                        <button className="btn-apply">áp dụng</button>
                    </div>
                </div>

                <div className="total-summary-box">
                    <div className="summary-item">
                        <span>Tổng giá:</span>
                        <span>{formatPrice(calculateTotal())}</span>
                    </div>
                    <div className="summary-item discount-row">
                        <span>Giá giảm:</span>
                        <span>-{formatPrice(discount)}</span>
                    </div>
                    <div className="summary-item final-total">
                        <span>Tổng cộng:</span>
                        <span>{formatPrice(calculateTotal() - discount)}</span>
                    </div>
                    <div className="payment-brands">
                        <div className="brand-img-box"><img src={visaImg} alt="Visa" /></div>
                        <div className="brand-img-box"><img src={paypalImg} alt="Paypal" /></div>
                        <div className="brand-img-box"><img src={momoImg} alt="Momo" /></div>
                    </div>
                    <button className="btn-submit-order" onClick={handleCheckout}>Đặt hàng</button>
                </div>
            </div>
        </div>
    );
};

export default Cart;