import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import './DetailProduct.css';
import { imageMap } from '../../utils/productImages';

const jsonBase = import.meta.env.BASE_URL || '/';

const DetailProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState('S');
    const [displayPrice, setDisplayPrice] = useState('');
    const [displayOriginalPrice, setDisplayOriginalPrice] = useState(''); // Giá gốc theo size
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadProductData = async () => {
            if (location.state?.product && String(location.state.product.id) === String(id)) {
                setProduct(location.state.product);
                const availableSize = ['S', 'M', 'L'].find(size => location.state.product[`size${size}`]);
                if (availableSize) setSelectedSize(availableSize);
            } else {
                try {
                    const res = await fetch(`${jsonBase}products.json`);
                    if (!res.ok) return;
                    const data = await res.json();
                    if (cancelled) return;

                    const found = data.find(p => String(p.id) === String(id));
                    if (found) {
                        setProduct(found);
                        const availableSize = ['S', 'M', 'L'].find(size => found[`size${size}`]);
                        if (availableSize) setSelectedSize(availableSize);
                    }
                } catch (err) {
                    console.error('Lỗi lấy chi tiết sản phẩm:', err);
                }
            }
        };

        loadProductData();
        return () => { cancelled = true; };
    }, [id, location.state]);

    useEffect(() => {
        const checkFav = () => {
            if (!product) return;
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const favorited = cart.some(item => 
                String(item.id) === String(product.id) && item.addedViaHeart === true
            );
            setIsFavorite(favorited);
        };
        checkFav();
        window.addEventListener('cartUpdated', checkFav);
        return () => window.removeEventListener('cartUpdated', checkFav);
    }, [product]);

    useEffect(() => {
        if (product) {
            setDisplayPrice(product[`price${selectedSize}`] || product.price || product.currentPrice);
            setDisplayOriginalPrice(product[`originalPrice${selectedSize}`] || product.originalPrice);
        }
    }, [product, selectedSize]);

    const formatPrice = (priceVal) => {
        if (priceVal === undefined || priceVal === null) return '';
        if (typeof priceVal === 'string' && (priceVal.includes('đ') || priceVal.toLowerCase().includes('vnd'))) {
            return priceVal;
        }
        const numericPrice = Number(priceVal);
        return isNaN(numericPrice) ? priceVal : `${numericPrice.toLocaleString('vi-VN')} đ`;
    };

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        if (!product) return;
        
        setIsFavorite(!isFavorite);
    };

    const handleBuyNow = () => {
        if (!product) return;
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        const isPreOrderType = isFavorite; 
        
        const existingIdx = cart.findIndex(item => 
            String(item.id) === String(product.id) && 
            item.selectedSize === selectedSize &&
            item.isPreOrder === isPreOrderType
        );

        if (existingIdx > -1) {
            cart[existingIdx].quantity += 1;
        } else {
            cart.push({
                ...product,
                currentPrice: displayPrice,
                originalPrice: displayOriginalPrice,
                selectedSize: selectedSize,
                quantity: 1,
                isPreOrder: isPreOrderType,
                addedViaHeart: isPreOrderType,
                deliveryDate: '',
                note: ''
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        
        navigate('/cart');
    };

    if (!product) return <div className="detail-container">Đang tải sản phẩm...</div>;

    return (
        <div className="detail-container">
            <button className="back-button" onClick={() => navigate(-1)}>&larr; Quay lại</button>
            <div className="detail-card">
                <div className="detail-image-wrapper">
                    <img 
                        src={imageMap[product.imageKey] || product.image || product.img} 
                        alt={product.name} 
                        className="detail-main-image"
                    />
                    <div className="heart-icon-wrapper" onClick={handleFavoriteClick}>
                        <Heart size={24} fill={isFavorite ? "#e62600" : "none"} color={isFavorite ? "#e62600" : "#333"} />
                    </div>
                </div>

                <div className="detail-info-wrapper">
                    <h1 className="detail-product-title">{product.name}</h1>
                    <div className="detail-sizes-box">
                        <span className="size-label">Kích thước:</span>
                        <div className="size-tags-wrapper">
                            {['S', 'M', 'L'].map(size => product[`size${size}`] && (
                                <button 
                                    key={size}
                                    className={`size-tag ${selectedSize === size ? 'active' : ''}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {product[`size${size}`]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="detail-price-wrapper">
                        <span className="detail-current-price">{formatPrice(displayPrice)}</span>
                        {displayOriginalPrice && <span className="detail-original-price">{formatPrice(displayOriginalPrice)}</span>}
                        {product.discount && <span className="detail-discount-badge">{product.discount}</span>}
                    </div>

                    <div className="detail-rating-wrapper">
                        {product.rating && <span className="rating-badge"><Star size={16} fill="#ff9900" color="#ff9900" />{product.rating}</span>}
                        {product.sold && <span className="sold-text">Đã bán {product.sold}</span>}
                    </div>

                    <div className="detail-actions">
                        <button className="add-to-cart-action-btn" onClick={handleBuyNow}>
                            <ShoppingCart size={20} /> Mua ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailProduct;