"use client";

const footerLinks = {
  "Nền tảng": ["Tổng quan", "Tính năng", "Khóa học", "Cách hoạt động", "Giá cả", "Cập nhật"],
  "Công ty": ["Về chúng tôi", "Tuyển dụng", "Báo chí", "Tin tức", "Đối tác", "Liên hệ"],
  "Tài nguyên": ["Blog", "Bản tin", "Sự kiện", "Trung tâm trợ giúp", "Hướng dẫn", "Hỗ trợ"],
  "Dành cho": ["Học sinh", "Giáo viên", "Phụ huynh", "Trường học", "Tổ chức", "Quản trị viên"],
  "Mạng xã hội": ["Twitter", "LinkedIn", "Facebook", "YouTube", "Instagram", "GitHub"],
  "Pháp lý": ["Điều khoản", "Quyền riêng tư", "Cookies", "Giấy phép", "Cài đặt", "Liên hệ"],
};

export function Footer() {
  return (
    <footer className="bg-white flex flex-col gap-16 items-center pb-12 pt-16 px-0 relative w-full">
      {/* <div className="flex flex-col gap-8 items-start px-8 py-0 w-full max-w-[1280px]">
        <div className="flex gap-8 items-start relative w-full">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-[1_0_0] flex-col gap-4 items-start min-h-px min-w-px relative">
              <p className="font-semibold leading-5 text-[#717680] text-sm w-full">
                {category}
              </p>
              <div className="flex flex-col gap-3 items-start relative w-full">
                {links.map((link, index) => (
                  <button
                    key={index}
                    className="font-semibold leading-6 text-[#535862] text-base hover:text-[#181d27] transition-colors"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div> */}

      <div className="flex flex-col gap-8 items-start px-8 py-0 w-full max-w-[1280px]">
        <div className="bg-[#e9eaeb] h-px w-full" />
        <div className="flex items-center justify-between relative w-full">
          {/* Logo */}
          <div className="h-8 relative">
            <span className="text-xl font-semibold text-[#181d27]">Adaptive Learning</span>
          </div>
          <p className="font-normal leading-6 text-[#717680] text-base w-[293px]">
            © 2024 Nền tảng Học tập Thích ứng. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </footer>
  );
}

