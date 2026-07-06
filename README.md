# Yêu cầu hệ thống

- Cần cài đặt NodeJS, Docker, (Table Plus để xem data trong CSDL)

# Hướng dẫn chạy

B1: khởi tạo CSDL  
B2: đồng bộ cấu trúc bảng bằng prisma  
B3: vào thư mục backend cài đặt các thư viện, chạy backend  
B4: vào thư mục frontend cài đặt các thư viện, chạy frontend  

```bash
docker-compose up -d

npx prisma migrate dev --name init
npx prisma generate

cd Backend
npm install
npm start

cd Frontend
npm install
npm start

```
