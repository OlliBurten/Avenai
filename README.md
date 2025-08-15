# 🚀 Avenai - AI-Powered Business Intelligence Platform

**Enterprise-grade AI platform for business intelligence, document analysis, and data-driven insights.**

![Avenai Platform](https://img.shields.io/badge/Avenai-AI%20Platform-blue?style=for-the-badge&logo=ai)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.116+-green?style=for-the-badge&logo=fastapi)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange?style=for-the-badge&logo=openai)

## ✨ Features

### 🤖 **AI-Powered Intelligence**
- **GPT-4 Integration** - Advanced AI chat with business context
- **Document Analysis** - AI-powered insights from PDFs, DOCs, and more
- **Smart Content Extraction** - Intelligent data processing
- **Business Insights** - Automated analysis and recommendations

### 📊 **Business Intelligence**
- **Analytics Dashboard** - Real-time business metrics
- **Data Visualization** - Beautiful charts and graphs
- **Performance Tracking** - KPI monitoring and trends
- **Custom Reports** - Tailored business insights

### 🏗️ **Enterprise Architecture**
- **FastAPI Backend** - High-performance Python API
- **Professional Frontend** - Beautiful, responsive UI
- **Scalable Design** - Ready for production deployment
- **Security Features** - Authentication and authorization

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- OpenAI API Key
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd avenai-production
   ```

2. **Set up the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   # Create .env file
   echo "OPENAI_API_KEY=your-api-key-here" > .env
   ```

4. **Start the backend**
   ```bash
   python main.py
   ```

5. **Open the frontend**
   ```bash
   # In a new terminal
   open frontend/index.html
   ```

## 🏗️ Architecture

### **Backend (`/backend`)**
- **`main.py`** - FastAPI application with all endpoints
- **`.env`** - Environment configuration
- **`requirements.txt`** - Python dependencies

### **Frontend (`/frontend`)**
- **`index.html`** - Professional web interface
- **Modern CSS** - Beautiful, responsive design
- **JavaScript** - Interactive functionality

### **Documentation (`/docs`)**
- **API Documentation** - Comprehensive endpoint guides
- **User Guides** - Platform usage instructions
- **Technical Specs** - Architecture and design details

## 🔌 API Endpoints

### **Core Features**
- `GET /health` - Health check and status
- `GET /` - Platform overview and features
- `POST /chat` - AI chat with GPT-4
- `GET /conversations` - Chat history management

### **Document Management**
- `POST /documents/upload` - File upload and analysis
- `GET /documents` - List and search documents
- `GET /documents/{id}` - Document details

### **Business Intelligence**
- `POST /analytics` - Generate business metrics
- `GET /analytics/visualization/{type}` - Data charts

### **AI Models**
- `POST /ai-models` - Create custom AI models
- `GET /ai-models` - List available models

## 🎨 Frontend Features

### **Professional Design**
- **Dark Theme** - Modern, professional appearance
- **Responsive Layout** - Works on all devices
- **Beautiful Typography** - Inter font family
- **Smooth Animations** - Professional user experience

### **Interactive Elements**
- **Real-time Chat** - Live AI conversations
- **Document Upload** - Drag & drop interface
- **Project Management** - Organized workspace
- **Advanced Formatting** - Rich message display

## 🔧 Configuration

### **Environment Variables**
```bash
OPENAI_API_KEY=your-openai-api-key
DEBUG_MODE=true
ENVIRONMENT=development
```

### **Backend Settings**
- **Port**: 8000 (configurable)
- **Host**: 0.0.0.0 (all interfaces)
- **CORS**: Enabled for development
- **Logging**: Comprehensive request logging

## 📈 Performance

### **Backend Performance**
- **FastAPI** - High-performance async framework
- **Uvicorn** - Lightning-fast ASGI server
- **Optimized** - Efficient data processing
- **Scalable** - Ready for production load

### **Frontend Performance**
- **Optimized CSS** - Minimal, efficient styling
- **Fast JavaScript** - Responsive interactions
- **Modern APIs** - Latest web standards
- **CDN Ready** - Optimized for deployment

## 🚀 Deployment

### **Development**
```bash
cd backend
python main.py
```

### **Production**
```bash
# Using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000

# Or with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### **Docker** (Coming Soon)
```bash
docker build -t avenai .
docker run -p 8000:8000 avenai
```

## 🤝 Contributing

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### **Code Standards**
- **Python**: PEP 8 compliance
- **JavaScript**: ES6+ standards
- **CSS**: BEM methodology
- **Documentation**: Clear and comprehensive

## 📚 Documentation

- **API Reference** - Complete endpoint documentation
- **User Guide** - Platform usage instructions
- **Developer Guide** - Technical implementation details
- **Architecture** - System design and components

## 🆘 Support

### **Getting Help**
- **Documentation** - Comprehensive guides
- **Issues** - GitHub issue tracker
- **Discussions** - Community support
- **Email** - Direct support contact

### **Common Issues**
- **API Key Setup** - OpenAI configuration
- **Backend Connection** - Server startup
- **Frontend Issues** - Browser compatibility
- **Performance** - Optimization tips

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** - GPT-4 AI capabilities
- **FastAPI** - High-performance backend framework
- **Community** - Contributors and supporters

---

**Built with ❤️ by the Avenai Team**

*Transforming business intelligence through AI innovation*
# Trigger Vercel deployment
