document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const emailInput = document.getElementById('email');
    const futureDateInput = document.getElementById('future-date');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    const sendButton = document.getElementById('send-button');
    const letterForm = document.querySelector('.letter-form');
    const successMessage = document.getElementById('success-message');
    const writeAnotherButton = document.getElementById('write-another');
    const sendNowCheckbox = document.getElementById('send-now'); // 获取立即发送复选框

    // 设置最小日期为明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    futureDateInput.min = tomorrow.toISOString().split('T')[0];
    
    // 监听立即发送复选框变化
    sendNowCheckbox.addEventListener('change', function() {
        if (this.checked) {
            // 如果选中立即发送，禁用日期输入并添加特殊样式
            futureDateInput.disabled = true;
            sendButton.classList.add('send-now-active');
            sendButton.textContent = '立即发送测试邮件';
        } else {
            // 如果取消选中，恢复日期输入和按钮样式
            futureDateInput.disabled = false;
            sendButton.classList.remove('send-now-active');
            sendButton.textContent = '寄出信件';
        }
    });

    // 发送信件
    sendButton.addEventListener('click', function() {
        // 表单验证
        if (!validateForm()) {
            return;
        }

        // 获取表单数据
        const letterData = {
            email: emailInput.value,
            subject: subjectInput.value,
            message: messageInput.value
        };
        
        // 根据是否立即发送设置日期
        if (sendNowCheckbox.checked) {
            // 如果选中立即发送，使用当前时间
            letterData.futureDate = new Date().toISOString();
        } else {
            // 否则使用选择的未来日期
            letterData.futureDate = futureDateInput.value;
        }

        // 发送到服务器
        sendLetter(letterData);
    });

    // 再写一封按钮
    writeAnotherButton.addEventListener('click', function() {
        // 重置表单
        resetForm();
        
        // 切换视图
        successMessage.classList.add('hidden');
        letterForm.classList.remove('hidden');
    });

    // 表单验证函数
    function validateForm() {
        // 验证邮箱
        if (!emailInput.value || !isValidEmail(emailInput.value)) {
            alert('请输入有效的邮箱地址');
            emailInput.focus();
            return false;
        }

        // 验证日期 - 只有在非立即发送模式下才验证
        if (!sendNowCheckbox.checked && !futureDateInput.value) {
            alert('请选择未来的日期');
            futureDateInput.focus();
            return false;
        }

        // 验证主题
        if (!subjectInput.value) {
            alert('请输入信件主题');
            subjectInput.focus();
            return false;
        }

        // 验证内容
        if (!messageInput.value) {
            alert('请输入信件内容');
            messageInput.focus();
            return false;
        }

        return true;
    }

    // 邮箱验证函数
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 发送信件到服务器
    function sendLetter(data) {
        // 显示加载状态
        sendButton.disabled = true;
        sendButton.textContent = '发送中...';

        // 使用 fetch API 发送数据到服务器
        fetch('/api/send-letter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // 显示成功消息
                letterForm.classList.add('hidden');
                successMessage.classList.remove('hidden');
                
                // 根据发送模式更新成功消息
                const successTitle = successMessage.querySelector('h2');
                const successText = successMessage.querySelectorAll('p');
                
                if (sendNowCheckbox.checked) {
                    successTitle.textContent = '测试邮件已发送！';
                    successText[0].textContent = '您的测试邮件已成功发送到您的邮箱，请查收。';
                    successText[1].textContent = '如果几分钟内没有收到，请检查垃圾邮件文件夹。';
                } else {
                    successTitle.textContent = '信件已寄出！';
                    successText[0].textContent = '你的信件将在指定的日期发送到你的邮箱。';
                    successText[1].textContent = '感谢使用时光邮局，期待与未来的你相遇。';
                }
                
                // 重置表单
                resetForm();
            } else {
                // 显示错误消息
                alert('发送失败: ' + result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('发送失败，请稍后再试');
        })
        .finally(() => {
            // 恢复按钮状态
            sendButton.disabled = false;
            if (sendNowCheckbox.checked) {
                sendButton.textContent = '立即发送测试邮件';
            } else {
                sendButton.textContent = '寄出信件';
            }
        });
    }

    // 重置表单
    function resetForm() {
        emailInput.value = '';
        futureDateInput.value = '';
        subjectInput.value = '';
        messageInput.value = '';
        sendNowCheckbox.checked = false;
        futureDateInput.disabled = false;
        sendButton.classList.remove('send-now-active');
        sendButton.textContent = '寄出信件';
    }
}); 