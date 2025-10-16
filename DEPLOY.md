# 时光邮局部署指南

本文档提供了将时光邮局应用部署到不同环境的详细步骤。

## 准备工作

无论使用哪种部署方式，您都需要进行以下准备：

1. 修改 `.env` 文件，更新为您的真实邮箱信息
2. 如果使用QQ邮箱，您需要获取授权码：
   - 登录QQ邮箱网页版
   - 点击"设置" -> "账户" -> "POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
   - 开启"POP3/SMTP服务"
   - 按照提示获取授权码

## 方法一：在普通虚拟主机上部署

### 要求
- 支持Node.js运行环境
- 能够运行长时间进程

### 步骤
1. 上传所有文件到服务器
2. SSH连接到服务器
3. 进入项目目录：`cd path/to/future-letter`
4. 安装依赖：`npm install --production`
5. 安装PM2（进程管理器）：`npm install -g pm2`
6. 启动应用：`pm2 start server.js --name "time-capsule"`
7. 设置开机自启：
   ```
   pm2 startup
   pm2 save
   ```

## 方法二：在Render.com上部署（免费）

### 步骤
1. 注册并登录 [Render](https://render.com)
2. 创建新的Web Service
3. 连接您的GitHub仓库或直接上传代码
4. 配置部署设置：
   - 构建命令：`npm install`
   - 启动命令：`node server.js`
5. 在环境变量部分添加`.env`文件中的所有变量
6. 点击部署

## 方法三：在Railway上部署（有免费方案）

### 步骤
1. 访问 [Railway](https://railway.app) 并使用GitHub账号登录
2. 创建新项目并导入您的代码
3. 在"Variables"部分添加`.env`文件中的环境变量
4. Railway会自动识别Node.js应用并部署

## 方法四：使用Docker部署

如果您熟悉Docker，可以使用以下步骤：

1. 在项目根目录创建Dockerfile：
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

2. 构建Docker镜像：
```
docker build -t time-capsule .
```

3. 运行容器：
```
docker run -d -p 3000:3000 --name time-capsule-app \
  -e EMAIL_SERVICE=qq \
  -e EMAIL_USER=your-email@qq.com \
  -e EMAIL_PASS=your-auth-code \
  --restart always \
  time-capsule
```

## 注意事项

1. **服务持续运行**：为了确保在未来日期发送邮件，服务器必须一直保持运行状态。
2. **数据持久化**：应用使用`letters.json`文件存储邮件数据。如果使用容器或某些PaaS服务，需要注意配置持久化存储。
3. **安全性**：在生产环境中，建议启用HTTPS以保护用户数据。
4. **邮箱设置**：不同邮箱服务商有不同的SMTP配置和安全策略，请参考相应文档。
5. **监控**：定期检查应用状态，确保其正常运行。

## 常见问题

### 应用启动但无法发送邮件
- 检查邮箱配置是否正确
- 确认邮箱服务商是否允许SMTP访问
- 检查授权码是否有效

### 页面样式加载不正确
- 确保将所有静态资源（HTML、CSS、JS）正确上传
- 检查控制台是否有资源加载错误

### 服务器频繁重启
- 检查日志，排查可能的内存泄漏
- 增加服务器资源配额
- 使用PM2等工具管理进程 