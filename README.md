# Yêu cầu hệ thống

- Cần cài đặt NodeJS, Docker, (Table Plus để xem data trong CSDL)

# Hướng dẫn chạy
- Tạo file .env ở thư mục gốc  
  
DATABASE_URL="mysql://root:root_password_123@localhost:3306/todo_db"  
PORT=3000  
  
- Khởi tạo CSDL    
- Vào thư mục backend cài đặt các thư viện    
- Đồng bộ cấu trúc bảng bằng prisma, chạy backend    
- Vào thư mục frontend cài đặt các thư viện, chạy frontend  

```bash
docker-compose up -d



cd Backend
npm install
npx prisma migrate dev --name init
npx prisma generate
npm start

cd Frontend
npm install
npm start

```
