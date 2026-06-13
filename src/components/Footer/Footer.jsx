import React from 'react';
import './Footer.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {
  return (
    <footer className="salemini-footer">
      <div className="footer-container">
        <div className="footer-main-grid">
          <div className="footer-col">
            <h4 className="footer-title">Về SaleMini !</h4>
            <ul className="footer-links">
              <li><a href="#">Giới thiệu SaleMini !</a></li>
              <li><a href="#">Central Retail Việt Nam</a></li>
              <li><a href="#">Tin tức mới nhất</a></li>
              <li><a href="#">Chương trình thành viên</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Hỗ trợ khách hàng</h4>
            <ul className="footer-links">
              <li><a href="#">Các câu hỏi thường gặp</a></li>
              <li><a href="#">Hướng dẫn đặt hàng</a></li>
              <li><a href="#">Chính sách đổi trả</a></li>
              <li><a href="#">Chính sách giao hàng</a></li>
              <li><a href="#">Chính sách khách hàng</a></li>
              <li><a href="#">Chính sách Bảo vệ dữ liệu</a></li>
              <li><a href="#">Gửi yêu cầu hỗ trợ</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Trung tâm hỗ trợ</h4>
            <p className="footer-text">Phòng chăm sóc khách hàng: <strong>1234 5678</strong> (08:00 - 21:00)</p>
            <p className="footer-text">Email hỗ trợ: <a href="mailto:http://salimini.com">http://salimini.com</a></p>
            <p className="footer-text">Tiếp nhận đánh giá, phản ánh, kiến nghị của Tổ chức </p>
            <p className="footer-text">Danh sách đánh giá, phản ánh, kiến nghị của Tổ chức </p>
            
            {/* NHÚNG GOOGLE MAP VÀO ĐÂY */}
            <div className="footer-google-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.26127110967!2d106.67912447590623!3d10.791295258913926!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528d488e07217%3A0x6339798443310034!2zMTYzIFBoYW4gxJDbmcgTMawdSwgUGjGsOG7nW5nIDIsIFBow7ogTmh14bqtbiwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1711234567890!5m2!1svi!2s"
                width="78%"
                height="200"
                style={{ border: 0, borderRadius: '6px', marginTop: '10px' }}
                allowFullScreen=""
                loading="lazy"
                title="SaleMini Office"
              ></iframe>
            </div>
          </div>
        </div>

        <hr className="footer-line" />

        <div className="footer-bottom-grid">
          <div className="company-info">
            <h3 className="company-name">CÔNG TY TNHH DỊCH VỤ EB</h3>
            <p>Địa chỉ: Số 163 Phan Đăng Lưu, Phường Cầu Kiệu, TP. Hồ Chí Minh, Việt Nam</p>
            <p>Tel: (84-08) 1234 5678 | Fax: (84-08) 1234 6789</p>
            <p>Mã số Doanh nghiệp: 1234567891, đăng ký thay đổi ngày 17 tháng 05 năm 2000</p>
          </div>

          <div className="social-app-container">
            <div className="social-wrapper">
              <span className="social-label">Kết nối với chúng tôi</span>
              <div className="social-icons">
                <a href="#" className="s-icon fb"><i className="fab fa-facebook"></i></a>
                <a href="#" className="s-icon tg"><i className="fab fa-telegram"></i></a>
                <a href="#" className="s-icon ig"><i className="fab fa-instagram"></i></a>
                <a href="#" className="s-icon tt"><i className="fab fa-tiktok"></i></a>
                <a href="#" className="s-icon yt"><i className="fab fa-youtube"></i></a>
              </div>
            </div>
            <p className="download-text">Tải ứng dụng trên điện thoại</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;