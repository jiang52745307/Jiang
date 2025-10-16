# 时光邮局 - 写给未来的信

这是一个简单的网站应用，允许用户写信给未来的自己。用户可以设定一个未来的日期，系统会在那一天将信件通过邮件发送给用户。

## 功能特点

- 简洁美观的用户界面
- 可以选择未来的任意日期
- 自动邮件发送系统
- 本地文件存储信件数据
- 响应式设计，适配各种设备

## 技术栈

- 前端：HTML, CSS, JavaScript (原生)
- 后端：Node.js, Express
- 邮件发送：Nodemailer
- 数据存储：本地文件系统 (JSON)

## 安装与运行

1. 克隆仓库
```
git clone https://github.com/yourusername/future-letter.git
cd future-letter
```

2. 安装依赖
```
npm install
```

3. 配置邮箱
在 `server.js` 文件中，找到以下代码并修改为你的邮箱信息：
```javascript
const transporter = nodemailer.createTransport({
    service: 'qq', // 可以替换为其他邮件服务
    auth: {
        user: 'your-email@qq.com', // 替换为你的邮箱
        pass: 'your-email-password' // 替换为你的邮箱密码或授权码
    }
});
```

4. 启动服务器
```
npm start
```

5. 访问网站
在浏览器中打开 `http://localhost:3000`

## 使用说明

1. 在首页填写你的邮箱地址
2. 选择你希望收到这封信的未来日期
3. 输入信件的主题
4. 写下你想对未来的自己说的话
5. 点击"寄出信件"按钮
6. 系统会在指定的日期将信件发送到你的邮箱

## 注意事项

- 服务器需要持续运行，才能在指定日期发送邮件
- 如果使用QQ邮箱，需要获取授权码而非直接使用密码
- 本应用仅用于学习和个人使用，请勿用于商业目的

## 许可证

MIT 