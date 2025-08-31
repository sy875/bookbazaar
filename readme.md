# 📚 BookBazaar API

A modern, RESTful API for managing books and user authentication in an online book marketplace. Built with industry-standard technologies and best practices.

## Postman Collection
https://www.postman.com/lively-firefly-527899/workspace/bookbazar/request/22923065-9394c381-9305-47a9-bf2f-5cfb6fbe6333?action=share&source=copy-link&creator=22923065

## 🚀 Overview

BookBazaar provides a comprehensive backend solution for book marketplace applications, featuring secure user authentication, complete book management, and robust search capabilities. The API is fully documented with interactive Swagger documentation and thoroughly tested.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Documentation**: Swagger (OpenAPI 3.0)
- **Testing**: Jest
- **Validation**: Express Validator
- **Package Manager**: npm

## 📖 API Documentation

Access the interactive Swagger UI to explore all endpoints:

- **Development**: [http://localhost:3000/docs](http://localhost:3000/docs)

## 🏁 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bookbazaar.git
   cd bookbazaar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   
   Create a `.env` file based on the sample configuration:
   ```bash
   cp sample.env .env
   ```
   
   Then edit the `.env` file with your specific values:
   ```env
   PORT=3000
   BookBazaar_HOST_URL=http://localhost:3000
   # Add your specific environment variables:
   # DB_URL=your_database_connection_string
   # JWT_SECRET=your_jwt_secret_key
   # NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 🧪 Testing

Run the test suite using Jest:

```bash
npm run test
```

The project includes comprehensive unit and integration tests to ensure reliability and maintainability.

## 📚 API Endpoints

### 🔐 Authentication

| Method | Endpoint          | Description              | Auth Required |
|--------|-------------------|--------------------------|---------------|
| POST   | `/users/register` | Register a new user      | No            |
| POST   | `/users/login`    | Authenticate user        | No            |

### 📖 Book Management

| Method | Endpoint          | Description              | Auth Required |
|--------|-------------------|--------------------------|---------------|
| GET    | `/books`          | Retrieve all books       | No            |
| GET    | `/books/{bookId}` | Get book by ID           | No            |
| POST   | `/books/new-book` | Create a new book        | Yes           |
| PATCH  | `/books/{bookId}` | Update existing book     | Yes           |
| DELETE | `/books/{bookId}` | Delete a book            | Yes           |
| GET    | `/books/search`   | Search books by criteria | No            |

**Note**: `bookId` must be a valid MongoDB ObjectId format.

## 📁 Project Structure

```
bookbazaar/
├── src/
│   ├── controllers/     # Route handlers and business logic
│   ├── routes/          # API route definitions
│   ├── validators/      # Express Validator middleware
│   ├── models/          # Data models and schemas
│   ├── middleware/      # Custom middleware functions
│   └── app.ts          # Application entry point
├── tests/              # Test files and test utilities
├── swagger.yaml        # OpenAPI specification
├── sample.env         # Environment variables template
├── jest.config.js     # Jest configuration
├── package.json       # Project dependencies and scripts
└── README.md          # Project documentation
```

## 🌐 Deployment

The API supports flexible deployment configurations:

### Development Server
```yaml
servers:
  - url: http://localhost:{port}/api/v1
    variables:
      port:
        default: 3000
        description: Configurable local development port
```

### Production Server
```yaml
servers:
  - url: https://bookbazaar.vercel.app/api
    description: Production environment
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production-ready application
- `npm run start` - Start production server
- `npm run test` - Run test suite
- `npm run test:watch` - Run tests in watch mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [existing issues](https://github.com/sy875/bookbazaar/issues)
2. Create a new issue with detailed information
3. Use the Swagger documentation for API reference

## 📧 Contact

For additional support or inquiries, please contact the development team.

---

⭐ **Star this repository if you find it helpful!**
