import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import './ProductList.css';
import { imageMap } from '../../utils/productImages';

const PRODUCTS_PER_PAGE = 8;
const jsonBase = import.meta.env.BASE_URL || '/';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // Thêm state tìm kiếm
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [cartUpdateTick, setCartUpdateTick] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    fetch(`${jsonBase}products.json`),
                    fetch(`${jsonBase}category.json`)
                ]);
                const data = await productsRes.json();
                setProducts(data.map(item => ({
                    ...item,
                    image: imageMap[item.imageKey] || item.image
                })));
                if (categoriesRes.ok) setCategories(await categoriesRes.json());
            } catch (err) { console.error(err); } 
            finally { setIsLoading(false); }
        };
        loadData();
    }, []);

    useEffect(() => {
        const handleRefresh = () => setCartUpdateTick(t => t + 1);
        window.addEventListener('cartUpdated', handleRefresh);
        return () => window.removeEventListener('cartUpdated', handleRefresh);
    }, []);

    const getFilteredAndSortedProducts = () => {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const favoriteIds = savedCart.filter(item => item.addedViaHeart).map(item => item.id);

        let result = products;

        if (selectedCategoryId !== null) {
            result = result.filter(p => p.categoryId === selectedCategoryId);
        }

        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(term));
        }

        return [...result].sort((a, b) => {
            const aIsFav = favoriteIds.includes(a.id) ? 1 : 0;
            const bIsFav = favoriteIds.includes(b.id) ? 1 : 0;
            return bIsFav - aIsFav; 
        });
    };

    const filteredProducts = getFilteredAndSortedProducts();
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
    const visibleProducts = filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

    if (isLoading) return <div>Đang tải...</div>;

    return (
        <div className="product-list-container">
            <div className="product-list-inner">
                <h2 className="section-title">SẢN PHẨM BÁN CHẠY</h2>
                
                <div className="category-menu-container">
                    <div className="category-menu">
                        <div className={`category-item ${selectedCategoryId === null ? 'active' : ''}`} onClick={() => {setSelectedCategoryId(null); setCurrentPage(1);}}>Tất cả</div>
                        {categories.map(cat => (
                            <div key={cat.id} className={`category-item ${selectedCategoryId === cat.id ? 'active' : ''}`} onClick={() => {setSelectedCategoryId(cat.id); setCurrentPage(1);}}>{cat.name}</div>
                        ))}
                    </div>
                </div>

                <div className="product-list-grid">
                    {visibleProducts.map(product => (
                        <ProductCard key={`${product.id}-${cartUpdateTick}`} product={product} />
                    ))}
                </div>

                {filteredProducts.length > PRODUCTS_PER_PAGE && (
                    <div className="product-list-pagination">
                        <button className="pagination-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage <= 1}>Trang trước</button>
                        <span className="pagination-info">Trang {currentPage} / {totalPages}</span>
                        <button className="pagination-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>Trang sau</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;