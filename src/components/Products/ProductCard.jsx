import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);

    const [selectedSize, setSelectedSize] = useState(
        product.sizeS ? 'S' : product.sizeM ? 'M' : 'L'
    );

    useEffect(() => {
        const checkFav = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const favorited = cart.some(item =>
                String(item.id) === String(product.id) && item.addedViaHeart === true
            );
            setIsFavorite(favorited);
        };
        checkFav();
        window.addEventListener('cartUpdated', checkFav);
        return () => window.removeEventListener('cartUpdated', checkFav);
    }, [product.id]);

    const handleFavoriteClick = (e) => {
        e.stopPropagation();

        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const idx = cart.findIndex(item => String(item.id) === String(product.id));

        if (idx > -1) {
            const newStatus = !cart[idx].addedViaHeart;
            cart[idx].addedViaHeart = newStatus;
            cart[idx].isPreOrder = newStatus;
            cart[idx].selectedSize = selectedSize;
        } else {
            cart.push({
                ...product,
                selectedSize: selectedSize,
                currentPrice: product[`price${selectedSize}`] || product.currentPrice,
                originalPrice: product[`originalPrice${selectedSize}`] || product.originalPrice,
                quantity: 1,
                addedViaHeart: true,
                isPreOrder: true,
                deliveryDate: '',
                note: ''
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const goToDetail = () => {
        navigate(`/product/${product.id}`, { state: { product } });
    };

    const changeSize = (e, size) => {
        e.stopPropagation();
        setSelectedSize(size);
    };

    return (
        <div className="product-card">
            <div className="heart-icon-wrapper" onClick={handleFavoriteClick}>
                <Heart
                    size={24}
                    fill={isFavorite ? "#e62600" : "none"}
                    color={isFavorite ? "#e62600" : "#333"}
                />
            </div>

            <div className="product-image-container" onClick={goToDetail}>
                <img src={product.image} alt={product.name} className="product-image" />
            </div>

            <div className="product-info-box">
                <div className="product-name-label">{product.name}</div>
                <div className="product-sizes">
                    {product.sizeS && (
                        <span
                            className={`size-tag ${selectedSize === 'S' ? 'active' : ''}`}
                            onClick={(e) => changeSize(e, 'S')}
                        >
                            {product.sizeS}
                        </span>
                    )}
                    {product.sizeM && (
                        <span
                            className={`size-tag ${selectedSize === 'M' ? 'active' : ''}`}
                            onClick={(e) => changeSize(e, 'M')}
                        >
                            {product.sizeM}
                        </span>
                    )}
                    {product.sizeL && (
                        <span
                            className={`size-tag ${selectedSize === 'L' ? 'active' : ''}`}
                            onClick={(e) => changeSize(e, 'L')}
                        >
                            {product.sizeL}
                        </span>
                    )}
                </div>
            </div>

            <div className="product-price-box">
                <div className="price-stack">
                    <span className="current-price">
                        {product[`price${selectedSize}`] || product.currentPrice}
                    </span>
                    <span className="original-price">
                        {product[`originalPrice${selectedSize}`] || product.originalPrice}
                    </span>
                </div>
                <button className="cart-btn" onClick={goToDetail}>
                    <ShoppingCart size={22} />
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
