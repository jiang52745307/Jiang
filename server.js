const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// 尝试加载环境变量
try {
    require('dotenv').config();
} catch (e) {
    console.log('未找到dotenv模块，使用默认配置');
}

const app = express();
const PORT = process.env.PORT || 3000;
const CHECK_INTERVAL = process.env.CHECK_INTERVAL || 60000; // 默认1分钟

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));

// 存储信件的数据结构
const letters = [];

// 创建邮件发送器 - 针对QQ邮箱优化
const transporter = nodemailer.createTransport({
    // 专门为QQ邮箱设置
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || 'your-email@qq.com', // 替换为你的邮箱
        pass: process.env.EMAIL_PASS || 'your-email-password', // 替换为你的邮箱密码或授权码
    },
    // 调试模式，会显示详细的连接信息
    debug: true,
});

// 验证邮箱配置
transporter.verify(function (error, success) {
    if (error) {
        console.error('邮箱配置验证失败:', error);
        console.error('当前邮箱配置:', {
            service: process.env.EMAIL_SERVICE,
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS ? '已设置 (隐藏)' : '未设置'
        });
        fs.writeFileSync('mail-error.log', JSON.stringify(error, null, 2), 'utf8');
    } else {
        console.log('邮箱配置验证成功，服务器已就绪');
    }
});

// 路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API 接收信件
app.post('/api/send-letter', (req, res) => {
    const { email, futureDate, subject, message } = req.body;
    
    if (!email || !futureDate || !subject || !message) {
        return res.status(400).json({ success: false, message: '所有字段都是必填的' });
    }
    
    // 创建信件对象
    const letter = {
        id: Date.now().toString(),
        email,
        futureDate: new Date(futureDate),
        subject,
        message,
        sent: false
    };
    
    // 判断是否是立即发送（当前时间或过去时间）
    const now = new Date();
    const isSendNow = new Date(futureDate) <= now || new Date(futureDate).getTime() - now.getTime() < 60000; // 小于1分钟视为立即发送
    
    if (isSendNow) {
        // 立即发送邮件
        console.log('接收到立即发送请求:', { email, subject });
        
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@qq.com',
            to: email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #3f51b5;">时光邮局测试邮件</h2>
                    <p>您请求发送的测试邮件内容如下：</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <p style="color: #666;">发送时间: ${new Date().toLocaleString()}</p>
                    <p style="color: #666;">来自时光邮局</p>
                </div>
            `
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('测试邮件发送失败:', error);
                fs.writeFileSync('mail-error.log', JSON.stringify(error, null, 2), 'utf8');
                return res.status(500).json({ 
                    success: false, 
                    message: '邮件发送失败: ' + error.message 
                });
            } else {
                console.log('测试邮件已发送:', info.response);
                letter.sent = true; // 标记为已发送
                letters.push(letter); // 仍然保存记录
                saveLettersToFile();
                return res.json({ 
                    success: true, 
                    message: '测试邮件已成功发送到您的邮箱' 
                });
            }
        });
    } else {
        // 保存信件，等待未来发送
        letters.push(letter);
        saveLettersToFile();
        res.json({ success: true, message: '信件已成功保存，将在指定时间发送' });
    }
});

// 添加测试邮件功能
app.get('/test-mail', (req, res) => {
    // 显示当前的配置信息（注意隐藏完整授权码）
    const configInfo = {
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_SERVICE === 'qq' ? 'smtp.qq.com' : undefined,
        port: process.env.EMAIL_SERVICE === 'qq' ? 465 : undefined,
        secure: process.env.EMAIL_SERVICE === 'qq' ? true : undefined,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? '已设置 (隐藏)' : '未设置'
    };
    
    console.log('当前邮箱配置:', configInfo);
    
    // 获取查询参数中的邮箱
    const testEmail = req.query.email || process.env.EMAIL_USER;
    
    if (!testEmail) {
        return res.status(400).send('请提供目标邮箱地址');
    }
    
    // 创建测试邮件
    const testMail = {
        from: process.env.EMAIL_USER,
        to: testEmail,
        subject: '时光邮局测试邮件',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #3f51b5;">时光邮局测试邮件</h2>
                <p>这是一封测试邮件，如果您收到此邮件，说明邮箱配置正确。</p>
                <p>您的邮箱配置已可以正常使用。</p>
                <p style="color: #666;">测试时间: ${new Date().toLocaleString()}</p>
                <p style="color: #666;">来自时光邮局</p>
            </div>
        `
    };
    
    // 发送测试邮件
    transporter.sendMail(testMail, (error, info) => {
        if (error) {
            console.error('测试邮件发送失败:', error);
            // 记录详细错误到文件
            fs.writeFileSync('mail-error.log', JSON.stringify(error, null, 2), 'utf8');
            res.status(500).send(`
                <h2>邮件发送失败</h2>
                <p>错误信息: ${error.message}</p>
                <p>邮箱配置:</p>
                <pre>${JSON.stringify(configInfo, null, 2)}</pre>
                <p>请检查您的邮箱配置是否正确。</p>
                <p><a href="/">返回首页</a></p>
            `);
        } else {
            console.log('测试邮件已发送:', info.response);
            res.send(`
                <h2>测试邮件已成功发送！</h2>
                <p>请检查您的邮箱 ${testEmail}</p>
                <p>响应信息: ${info.response}</p>
                <p><a href="/">返回首页</a></p>
            `);
        }
    });
});

// 邮件状态查看页面
app.get('/mail-status', (req, res) => {
    const status = {
        totalLetters: letters.length,
        pendingLetters: letters.filter(l => !l.sent).length,
        sentLetters: letters.filter(l => l.sent).length,
        emailConfig: {
            service: process.env.EMAIL_SERVICE,
            host: process.env.EMAIL_SERVICE === 'qq' ? 'smtp.qq.com' : undefined,
            user: process.env.EMAIL_USER,
            hasPassword: !!process.env.EMAIL_PASS
        }
    };
    
    res.send(`
        <h1>邮件系统状态</h1>
        <pre>${JSON.stringify(status, null, 2)}</pre>
        <p><a href="/test-mail">发送测试邮件</a></p>
        <p><a href="/">返回首页</a></p>
    `);
});

// 检查并发送到期的信件
function checkAndSendLetters() {
    const now = new Date();
    
    letters.forEach(letter => {
        if (!letter.sent && new Date(letter.futureDate) <= now) {
            // 发送邮件
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@qq.com', // 替换为你的邮箱
                to: letter.email,
                subject: letter.subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                        <h2 style="color: #3f51b5;">来自过去的一封信</h2>
                        <p>这是你在 ${new Date(letter.futureDate).toLocaleDateString()} 之前写给自己的一封信：</p>
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            ${letter.message.replace(/\n/g, '<br>')}
                        </div>
                        <p style="color: #666;">来自时光邮局</p>
                    </div>
                `
            };
            
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('发送邮件失败:', error);
                    // 记录详细错误到文件
                    fs.writeFileSync('mail-error.log', JSON.stringify(error, null, 2), 'utf8');
                } else {
                    console.log('邮件已发送:', info.response);
                    letter.sent = true;
                    saveLettersToFile();
                }
            });
        }
    });
}

// 保存信件到文件
function saveLettersToFile() {
    fs.writeFileSync(
        path.join(__dirname, 'letters.json'),
        JSON.stringify(letters, null, 2),
        'utf8'
    );
}

// 从文件加载信件
function loadLettersFromFile() {
    try {
        if (fs.existsSync(path.join(__dirname, 'letters.json'))) {
            const data = fs.readFileSync(path.join(__dirname, 'letters.json'), 'utf8');
            const loadedLetters = JSON.parse(data);
            letters.push(...loadedLetters);
        }
    } catch (error) {
        console.error('加载信件失败:', error);
    }
}

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`测试邮件功能: http://localhost:${PORT}/test-mail`);
    console.log(`邮件状态页面: http://localhost:${PORT}/mail-status`);
    
    // 加载保存的信件
    loadLettersFromFile();
    
    // 定期检查是否有需要发送的信件
    setInterval(checkAndSendLetters, CHECK_INTERVAL);
});