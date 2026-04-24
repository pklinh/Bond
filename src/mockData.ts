import { Enterprise, Bond, NewsItem, ExpiringBond } from './types';

export const mockEnterprises: Enterprise[] = [
  { id: '1', ticker: 'VHM', name: 'Vinhomes JSC', industry: 'Real Estate', bondCount: 42, issueValue: 152400, initialDebt: 18500, remainingDebt: 12180 },
  { id: '2', ticker: 'TCB', name: 'Techcombank', industry: 'Banking', bondCount: 28, issueValue: 85000, initialDebt: 8500, remainingDebt: 7900 },
  { id: '3', ticker: 'NVL', name: 'Novaland Group', industry: 'Real Estate', bondCount: 35, issueValue: 22150, initialDebt: 22150, remainingDebt: 20400 },
  { id: '4', ticker: 'MSN', name: 'Masan Group', industry: 'Securities', bondCount: 18, issueValue: 12000, initialDebt: 12000, remainingDebt: 9500 },
  { id: '5', ticker: 'VIC', name: 'Vingroup', industry: 'Real Estate', bondCount: 50, issueValue: 180000, initialDebt: 25000, remainingDebt: 18000 },
  { id: '6', ticker: 'BID', name: 'BIDV', industry: 'Banking', bondCount: 22, issueValue: 72000, initialDebt: 7200, remainingDebt: 6800 },
  { id: '7', ticker: 'SSI', name: 'SSI Securities', industry: 'Securities', bondCount: 12, issueValue: 15000, initialDebt: 1500, remainingDebt: 1200 },
  { id: '8', ticker: 'VND', name: 'VNDirect Securities', industry: 'Securities', bondCount: 10, issueValue: 12000, initialDebt: 1200, remainingDebt: 1000 },
  { id: '9', ticker: 'VCB', name: 'Vietcombank', industry: 'Banking', bondCount: 30, issueValue: 95000, initialDebt: 9500, remainingDebt: 8800 },
  { id: '10', ticker: 'CTG', name: 'Vietinbank', industry: 'Banking', bondCount: 25, issueValue: 80000, initialDebt: 8000, remainingDebt: 7500 },
];

export const mockBonds: Bond[] = [
  { id: 'b1', code: 'VHM121023', enterpriseId: '1', term: '3 years', interestRate: 9.5, listedVolume: 2000, issueValue: 2000, listedValue: 2000, issueDate: '2023-10-12', maturityDate: '2026-10-12', interestType: 'Fixed', status: 'Hiệu lực' },
  { id: 'b2', code: 'VHM122014', enterpriseId: '1', term: '5 years', interestRate: 10.2, listedVolume: 1500, issueValue: 1500, listedValue: 1500, issueDate: '2024-01-20', maturityDate: '2029-01-20', interestType: 'Floating', status: 'Hiệu lực' },
  { id: 'b3', code: 'VHMB2326001', enterpriseId: '1', term: '3 years', interestRate: 9.2, listedVolume: 3000, issueValue: 3000, listedValue: 3000, issueDate: '2023-06-15', maturityDate: '2026-06-15', interestType: 'Fixed', status: 'Hiệu lực' },
  { id: 'b5', code: 'VHM122015', enterpriseId: '1', term: '2 years', interestRate: 8.8, listedVolume: 1200, issueValue: 1200, listedValue: 1200, issueDate: '2024-03-10', maturityDate: '2026-03-10', interestType: 'Fixed', status: 'Hiệu lực' },
  { id: 'b6', code: 'VHM122016', enterpriseId: '1', term: '5 years', interestRate: 11.5, listedVolume: 2500, issueValue: 2500, listedValue: 2500, issueDate: '2023-11-05', maturityDate: '2028-11-05', interestType: 'Floating', status: 'Hiệu lực' },
  { id: 'b7', code: 'VHM122017', enterpriseId: '1', term: '7 years', interestRate: 12.0, listedVolume: 4000, issueValue: 4000, listedValue: 4000, issueDate: '2022-08-15', maturityDate: '2029-08-15', interestType: 'Fixed', status: 'Hiệu lực' },
  { id: 'b4', code: 'TCB2025', enterpriseId: '2', term: '2 years', interestRate: 8.5, listedVolume: 5000, issueValue: 5000, listedValue: 5000, issueDate: '2023-05-10', maturityDate: '2025-05-10', interestType: 'Fixed', status: 'Hiệu lực' },
];

export const mockNews: NewsItem[] = [
  { 
    id: 'n1', 
    image: 'https://picsum.photos/seed/bond1/1920/1080', 
    source: 'Thị trường', 
    title: 'Thị trường trái phiếu doanh nghiệp ghi nhận sự hồi phục mạnh mẽ trong quý 1/2024', 
    date: '2024-03-20T08:00:00Z',
    author: 'Fireant Research',
    url: '#',
    summary: 'Thị trường trái phiếu doanh nghiệp (TPDN) Việt Nam đang có những dấu hiệu hồi phục tích cực và mạnh mẽ...',
    content: `Thị trường trái phiếu doanh nghiệp (TPDN) Việt Nam đang có những dấu hiệu hồi phục tích cực và mạnh mẽ sau một giai đoạn dài đầy biến động và trầm lắng. Theo các báo cáo số liệu mới nhất từ Hiệp hội Thị trường Trái phiếu Việt Nam (VBMA) cũng như các tổ chức nghiên cứu kinh tế hàng đầu, tổng khối lượng phát hành TPDN trong quý 1/2024 đã ghi nhận mức tăng trưởng vượt bậc so với cùng kỳ năm ngoái. Đây được xem là một tín hiệu cực kỳ quan trọng, cho thấy niềm tin của các nhà đầu tư tổ chức và cá nhân đang dần quay trở lại với kênh huy động vốn dài hạn này.`
  },
  { 
    id: 'n2', 
    image: 'https://picsum.photos/seed/bond2/1920/1080', 
    source: 'Chính sách', 
    title: 'Nghị định 08/2023/NĐ-CP: Cú hích quan trọng cho thị trường trái phiếu', 
    date: '2024-03-20T06:00:00Z',
    author: 'Fireant Research',
    url: '#',
    summary: 'Việc ban hành Nghị định 08/2023/NĐ-CP được các chuyên gia và cộng đồng doanh nghiệp đánh giá là một bước đi mang tính chiến lược...',
    content: `Việc ban hành Nghị định 08/2023/NĐ-CP được các chuyên gia và cộng đồng doanh nghiệp đánh giá là một bước đi mang tính chiến lược, một "cú hích" cực kỳ quan trọng để tháo gỡ những bế tắc đang tồn tại trên thị trường trái phiếu doanh nghiệp tại Việt Nam.`
  },
  { 
    id: 'n3', 
    image: 'https://picsum.photos/seed/bond3/1920/1080', 
    source: 'Phân tích', 
    title: 'Lãi suất trái phiếu doanh nghiệp có xu hướng ổn định quanh mức 9-11%/năm', 
    date: '2024-03-20T04:00:00Z',
    author: 'Fireant Research',
    url: '#',
    summary: 'Phân tích sâu về dữ liệu giao dịch từ cả thị trường sơ cấp và thị trường thứ cấp cho thấy xu hướng ổn định của mặt bằng lãi suất...',
    content: `Phân tích sâu về dữ liệu giao dịch từ cả thị trường sơ cấp và thị trường thứ cấp trong thời gian gần đây cho thấy một xu hướng rõ nét là mặt bằng lãi suất trái phiếu doanh nghiệp (TPDN) tại Việt Nam đang đi vào một vùng ổn định mới.`
  }
];

export const mockExpiringBonds: ExpiringBond[] = [
  { id: 'e1', code: 'VIC12202', maturityDate: '2026-12-25', interestRate: 12.5, listedVolume: 2500 },
  { id: 'e2', code: 'MSN12101', maturityDate: '2026-01-10', interestRate: 11.8, listedVolume: 1200 },
  { id: 'e3', code: 'NVL2024', maturityDate: '2024-12-30', interestRate: 13.5, listedVolume: 3000 },
];
