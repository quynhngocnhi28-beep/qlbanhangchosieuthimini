import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Banner.css';

import banner1 from '../../img/banner_1.png';
import banner2 from '../../img/banner_2.png';
import banner3 from '../../img/banner_3.png';
import banner4 from '../../img/banner_4.png';
import banner5 from '../../img/banner_5.png';
import banner6 from '../../img/banner_6.png';
import banner7 from '../../img/banner_7.png';
import banner8 from '../../img/banner_8.png';
import banner9 from '../../img/banner_9.png';
import banner10 from '../../img/banner_10.png';

const Banner = () => {
    const banners = [
        { id: 1, image: banner1 },
        { id: 2, image: banner2 },
        { id: 3, image: banner3 },
        { id: 4, image: banner4 },
        { id: 5, image: banner5 },
        { id: 6, image: banner6 },
        { id: 7, image: banner7 },
        { id: 8, image: banner8 },
        { id: 9, image: banner9 },
        { id: 10, image: banner10 }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 4000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === banners.length - 1 ? 0 : prevIndex + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1));
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    return (
        <div className="banner-carousel-container">
            <div className="banner-carousel-wrapper">
                <button className="carousel-btn prev-btn" onClick={prevSlide} aria-label="Previous slide">
                    <ChevronLeft size={24} className="btn-icon" />
                </button>

                <div className="banner-slides">
                    {banners.map((banner, index) => (
                        <div
                            key={banner.id}
                            className={`banner-slide-item ${index === currentIndex ? 'active' : ''}`}
                        >
                            <img src={banner.image} alt={`Banner ${banner.id}`} className="banner-img-element" />
                        </div>
                    ))}
                </div>

                <button className="carousel-btn next-btn" onClick={nextSlide} aria-label="Next slide">
                    <ChevronRight size={24} className="btn-icon" />
                </button>

                <div className="banner-dots">
                    {banners.map((_, index) => (
                        <span
                            key={index}
                            className={`dot-item ${index === currentIndex ? 'dot-active' : ''}`}
                            onClick={() => goToSlide(index)}
                        ></span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Banner;