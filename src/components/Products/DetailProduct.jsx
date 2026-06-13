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

    // Khởi tạo các state gốc của bạn
    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState('S');
    const [displayPrice, setDisplayPrice] = useState('');
    const [displayOriginalPrice, setDisplayOriginalPrice] = useState(''); // Giá gốc theo size
    const [isFavorite, setIsFavorite] = useState(false);

    // Lắng nghe sự thay đổi của ID để cập nhật mượt mà không cần F5
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

    // 1. Logic đồng bộ trái tim - Chỉ đọc từ giỏ hàng hoặc danh sách yêu thích để hiển thị màu
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

    // 2. Logic thay đổi giá và giá giảm theo size khi bấm chọn tag size
    useEffect(() => {
        if (product) {
            setDisplayPrice(product[`price${selectedSize}`] || product.price || product.currentPrice);
            setDisplayOriginalPrice(product[`originalPrice${selectedSize}`] || product.originalPrice);
        }
    }, [product, selectedSize]);

    // Hàm định dạng hiển thị giá tiền
    const formatPrice = (priceVal) => {
        if (priceVal === undefined || priceVal === null) return '';
        if (typeof priceVal === 'string' && (priceVal.includes('đ') || priceVal.toLowerCase().includes('vnd'))) {
            return priceVal;
        }
        const numericPrice = Number(priceVal);
        return isNaN(numericPrice) ? priceVal : `${numericPrice.toLocaleString('vi-VN')} đ`;
    };

    // CHỈNH SỬA: Ấn trái tim chỉ lật trạng thái màu sắc trên giao diện, TUYỆT ĐỐI không đẩy vào giỏ hàng
    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        if (!product) return;
        
        // Chỉ thay đổi trạng thái tim hiển thị trực quan
        setIsFavorite(!isFavorite);
    };

    // CHỈNH SỬA: Khi ấn nút "Mua ngay" thì mới gom sản phẩm + đúng size được chọn đẩy vào giỏ hàng
    const handleBuyNow = () => {
        if (!product) return;
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Biến trạng thái pre-order đi kèm nếu bạn bật tim hoặc theo logic gốc của bạn
        const isPreOrderType = isFavorite; 
        
        // Kiểm tra xem sản phẩm với đúng Size này đã nằm trong giỏ hàng chưa
        const existingIdx = cart.findIndex(item => 
            String(item.id) === String(product.id) && 
            item.selectedSize === selectedSize &&
            item.isPreOrder === isPreOrderType
        );

        if (existingIdx > -1) {
            // Có rồi thì tăng số lượng lên 1
            cart[existingIdx].quantity += 1;
        } else {
            // Chưa có thì thêm mới vào giỏ hàng kèm theo giá của size đang hiển thị lúc đó
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
        
        // Lưu vào localStorage và bắn event đồng bộ số lượng cho Header ngay lập tức
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Chuyển hướng mượt mà sang trang giỏ hàng
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
                    {/* Nút trái tim chỉ thay đổi màu sắc tại chỗ */}
                    <div className="heart-icon-wrapper" onClick={handleFavoriteClick}>
                        <Heart size={24} fill={isFavorite ? "#e62600" : "none"} color={isFavorite ? "#e62600" : "#333"} />
                    </div>
                </div>

                <div className="detail-info-wrapper">
                    <h1 className="detail-product-title">{product.name}</h1>
                    <div className="detail-sizes-box">
                        <span className="size-label">Kích thước:</span>
                        <div className="size-tags-wrapper">
                            {/* Bấm đổi size chỉ thay đổi state active và hiển thị lại giá bán */}
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
                        {/* Nút quyết định duy nhất để nhảy vào giỏ hàng */}
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