import React from 'react';
import { Users, MapPin, Award, Zap, Gift, Trophy } from 'lucide-react';
import './HomePromotion.css';

function HomePromotion() {
    const navItems = [
        { id: 1, label: 'Nhãn hàng', icon: Users },
        { id: 2, label: 'Cửa hàng', icon: MapPin },
        { id: 3, label: 'Thẻ VIP', icon: Award },
        { id: 4, label: 'Flash Sale', icon: Zap },
        { id: 5, label: 'Mã giảm giá', icon: Gift },
        { id: 6, label: 'Thưởng lớn', icon: Trophy },
    ];

    return (
        <div className="home-promotion">
            <div className="promotion-nav">
                {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <div key={item.id} className="nav-item">
                            <div className="nav-icon"><IconComponent size={28} /></div>
                            <span>{item.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default HomePromotion;