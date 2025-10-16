# 时光邮局 - 邮箱配置指南

本文档详细介绍了如何为时光邮局应用配置邮箱，以确保邮件能够成功发送。

## QQ邮箱配置步骤

QQ邮箱是中国用户常用的邮箱服务，以下是详细配置步骤：

### 1. 开启SMTP服务

1. 登录您的QQ邮箱网页版 (https://mail.qq.com)
2. 点击上方的「设置」
3. 在左侧菜单中点击「账户」
4. 找到「POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务」部分
5. 开启「POP3/SMTP服务」选项

### 2. 获取授权码

1. 在启用POP3/SMTP服务后，会弹出获取授权码的提示
2. 根据提示完成验证（可能需要短信或QQ安全验证）
3. 记下生成的授权码（通常是16位字符）
4. **重要：这个授权码将用作您的EMAIL_PASS，而不是QQ密码**

### 3. 修改.env文件

将以下内容填入`.env`文件：

```
EMAIL_SERVICE=qq
EMAIL_USER=您的QQ邮箱地址@qq.com
EMAIL_PASS=您获取的授权码
```

例如：

```
EMAIL_SERVICE=qq
EMAIL_USER=12345678@qq.com
EMAIL_PASS=abcdefghijklmnop
```

## 测试邮箱配置

配置完成后，您可以通过以下方式测试邮箱：

1. 启动应用服务器
2. 访问 http://您的服务器地址:3000/test-mail
3. 如果配置正确，您将收到一封测试邮件

您也可以使用查询参数测试发送到特定邮箱：
http://您的服务器地址:3000/test-mail?email=目标邮箱地址

## 常见问题解决

### 1. 发送邮件失败 - 身份验证错误

**错误信息**：身份验证失败、授权失败等

**解决方案**：
- 确保使用的是授权码而不是QQ密码
- 确认授权码没有过期（授权码通常有有效期）
- 重新获取一个新的授权码

### 2. 发送邮件失败 - 连接超时

**错误信息**：连接超时、无法连接到SMTP服务器等

**解决方案**：
- 检查网络连接是否正常
- 确认服务器防火墙没有阻止SMTP端口（通常是587或465）
- 尝试在`server.js`中修改邮件配置，指定端口和安全选项：

```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true, // 使用SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
```

### 3. QQ邮箱授权码过期

授权码可能会定期过期，如果发现不能发送邮件，尝试重新获取授权码：

1. 登录QQ邮箱网页版
2. 依次点击：设置 -> 账户 -> POP3/SMTP服务
3. 点击"生成授权码"
4. 更新`.env`文件中的EMAIL_PASS值

## 其他邮箱服务配置

### Gmail

```
EMAIL_SERVICE=gmail
EMAIL_USER=您的Gmail地址@gmail.com
EMAIL_PASS=您的Gmail应用专用密码
```

**注意**：Gmail需要开启"安全性较低的应用访问权限"或使用"应用专用密码"。

### 163邮箱

```
EMAIL_SERVICE=163
EMAIL_USER=您的163邮箱地址@163.com
EMAIL_PASS=您的163邮箱授权码
```

### Outlook/Hotmail

```
EMAIL_SERVICE=outlook
EMAIL_USER=您的Outlook邮箱地址@outlook.com
EMAIL_PASS=您的Outlook密码
```

## 进阶配置

如果您需要更精细的控制，可以直接在`server.js`中修改邮件发送器配置：

```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com', // 邮箱服务器地址
    port: 465, // 端口号
    secure: true, // 是否使用SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
```

不同邮箱服务商的SMTP服务器地址：

- QQ邮箱: `smtp.qq.com`
- Gmail: `smtp.gmail.com`
- 163邮箱: `smtp.163.com`
- Outlook: `smtp.office365.com` 