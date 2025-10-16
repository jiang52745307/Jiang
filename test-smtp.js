const nodemailer = require('nodemailer');
require('dotenv').config();

// 显示当前配置
console.log('当前邮箱配置:');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '已设置' : '未设置');

// 创建专门用于QQ邮箱的发送器
const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true // 启用调试输出
});

// 验证连接配置
transporter.verify(function(error, success) {
    if (error) {
        console.error('邮箱配置验证失败:');
        console.error(error);
        process.exit(1);
    } else {
        console.log('邮箱配置验证成功!');
        
        // 发送测试邮件
        const testMail = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // 发送给自己
            subject: '时光邮局SMTP测试',
            text: '这是一封测试邮件，如果收到此邮件说明SMTP配置正确。',
            html: '<p>这是一封测试邮件，如果收到此邮件说明SMTP配置正确。</p><p>测试时间: ' + new Date().toLocaleString() + '</p>'
        };
        
        console.log('正在发送测试邮件...');
        
        transporter.sendMail(testMail, (error, info) => {
            if (error) {
                console.error('测试邮件发送失败:');
                console.error(error);
                process.exit(1);
            } else {
                console.log('测试邮件已发送!');
                console.log(info);
                process.exit(0);
            }
        });
    }
}); 