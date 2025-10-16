// 创建一封测试信件的数据
const testLetterData = {
    email: '3244989574@qq.com', // 使用您的邮箱
    futureDate: new Date(Date.now() + 60000).toISOString(), // 1分钟后
    subject: '时光邮局API测试',
    message: '这是一封测试信件，通过API发送。发送时间: ' + new Date().toLocaleString()
};

console.log('准备发送测试信件...');
console.log(testLetterData);

// 发送到API
fetch('http://localhost:3000/api/send-letter', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testLetterData),
})
.then(response => response.json())
.then(data => {
    console.log('API响应:');
    console.log(data);
    if (data.success) {
        console.log('信件已成功保存，将在指定时间发送。');
    } else {
        console.error('信件发送失败:', data.message);
    }
})
.catch(error => {
    console.error('请求失败:', error);
}); 