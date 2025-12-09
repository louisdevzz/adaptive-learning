// Top 20 trường trung học phổ thông tại Thành phố Hồ Chí Minh
// Nguồn: https://vi.wikipedia.org/wiki/Danh_s%C3%A1ch_tr%C6%B0%E1%BB%9Dng_trung_h%E1%BB%8Dc_ph%E1%BB%95_th%C3%B4ng_t%E1%BA%A1i_Th%C3%A0nh_ph%E1%BB%91_H%E1%BB%93_Ch%C3%AD_Minh
export const SCHOOLS = [
  "Trường THPT Chuyên Lê Hồng Phong",
  "Trường THPT Chuyên Trần Đại Nghĩa",
  "Trường THPT Nguyễn Thị Minh Khai",
  "Trường THPT Lê Quý Đôn",
  "Trường THPT Nguyễn Du",
  "Trường THPT Gia Định",
  "Trường THPT Mạc Đĩnh Chi",
  "Trường THPT Nguyễn Thị Diệu",
  "Trường THPT Trưng Vương",
  "Trường THPT Marie Curie",
  "Trường THPT Bùi Thị Xuân",
  "Trường THPT Võ Thị Sáu",
  "Trường THPT Nguyễn Khuyến",
  "Trường THPT Nguyễn Hữu Huân",
  "Trường THPT Lê Hồng Phong",
  "Trường THPT Phan Đăng Lưu",
  "Trường THPT Nguyễn Thượng Hiền",
  "Trường THPT Nguyễn Công Trứ",
  "Trường THPT Nguyễn An Ninh",
  "Trường THPT Nguyễn Thị Minh Khai (Quận 3)",
] as const;

// Helper function to get school options for dropdown
export const getSchoolOptions = () => {
  return SCHOOLS.map((school) => ({
    label: school,
    value: school,
  }));
};

