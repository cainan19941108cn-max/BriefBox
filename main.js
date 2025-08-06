// 日历相关变量
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// 示例事件数据
const events = {
    '2024-02-15': ['春节活动公告', '电商行业趋势分析'],
    '2024-02-14': ['算法更新', '直播带货最新趋势']
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    renderCalendar(currentYear, currentMonth);
    initializeFeedback();
});

// 渲染日历
function renderCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = firstDay.getDay();
    const prevLastDay = new Date(year, month, 0).getDate();
    
    document.getElementById('currentMonth').textContent = 
        `${year}年${month + 1}月`;
    
    const calendarGrid = document.querySelector('.calendar-grid');
    calendarGrid.innerHTML = '';
    
    // 创建日历网格
    const totalDays = 42; // 6行 x 7列
    const daysArray = [];
    
    // 上个月的日期
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const day = prevLastDay - i;
        daysArray.push({
            date: day,
            isCurrentMonth: false,
            isToday: false,
            hasEvent: false
        });
    }
    
    // 当前月的日期
    for (let i = 1; i <= lastDay; i++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const isToday = year === currentDate.getFullYear() && 
                       month === currentDate.getMonth() && 
                       i === currentDate.getDate();
        
        daysArray.push({
            date: i,
            isCurrentMonth: true,
            isToday: isToday,
            hasEvent: events[dateString] ? true : false
        });
    }
    
    // 下个月的日期
    const remainingDays = totalDays - daysArray.length;
    for (let i = 1; i <= remainingDays; i++) {
        daysArray.push({
            date: i,
            isCurrentMonth: false,
            isToday: false,
            hasEvent: false
        });
    }
    
    // 渲染日历
    daysArray.forEach(dayInfo => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        
        if (!dayInfo.isCurrentMonth) {
            dayElement.classList.add('other-month');
        }
        if (dayInfo.isToday) {
            dayElement.classList.add('today');
        }
        if (dayInfo.hasEvent) {
            dayElement.classList.add('has-event');
        }
        
        dayElement.textContent = dayInfo.date;
        
        if (dayInfo.isCurrentMonth) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayInfo.date).padStart(2, '0')}`;
            dayElement.addEventListener('click', () => showEventsModal(dateString));
        }
        
        calendarGrid.appendChild(dayElement);
    });
}

// 显示事件模态框
function showEventsModal(dateString) {
    const modal = document.getElementById('eventsModal');
    const modalContent = document.querySelector('.modal-content');
    const dayEvents = events[dateString] || [];
    
    modalContent.innerHTML = `
        <span class="close" onclick="closeEventsModal()">&times;</span>
        <h2>${dateString} 事件</h2>
        ${dayEvents.length ? `
            <ul>
                ${dayEvents.map(event => `<li>${event}</li>`).join('')}
            </ul>
        ` : '<p>该日期没有事件</p>'}
    `;
    
    modal.style.display = 'block';
}

// 关闭事件模态框
function closeEventsModal() {
    document.getElementById('eventsModal').style.display = 'none';
}

// 更新月份
function updateMonth(increment) {
    currentMonth += increment;
    
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    
    renderCalendar(currentYear, currentMonth);
}

// 初始化反馈功能
function initializeFeedback() {
    // 从localStorage加载数据
    const feedbackData = JSON.parse(localStorage.getItem('feedbackData')) || {};

    // 为所有点赞按钮添加事件监听器
    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', function() {
            const container = this.closest('[data-id]');
            const id = container.getAttribute('data-id');
            handleFeedback(id, 'like');
        });
    });

    // 为所有点踩按钮添加事件监听器
    document.querySelectorAll('.dislike-btn').forEach(button => {
        button.addEventListener('click', function() {
            const container = this.closest('[data-id]');
            const id = container.getAttribute('data-id');
            handleFeedback(id, 'dislike');
        });
    });

    // 初始化所有反馈状态
    document.querySelectorAll('[data-id]').forEach(container => {
        const id = container.getAttribute('data-id');
        const data = feedbackData[id] || { likes: 0, dislikes: 0, userAction: null };
        updateFeedbackUI(container, data);
    });
}

// 处理反馈
function handleFeedback(id, action) {
    // 从localStorage获取数据
    const feedbackData = JSON.parse(localStorage.getItem('feedbackData')) || {};
    const data = feedbackData[id] || { likes: 0, dislikes: 0, userAction: null };
    
    // 如果用户点击了之前已经点击过的按钮，取消该操作
    if (data.userAction === action) {
        if (action === 'like') {
            data.likes = Math.max(0, data.likes - 1);
        } else {
            data.dislikes = Math.max(0, data.dislikes - 1);
        }
        data.userAction = null;
    }
    // 如果用户点击了不同的按钮
    else {
        // 如果之前有其他操作，先取消之前的操作
        if (data.userAction) {
            if (data.userAction === 'like') {
                data.likes = Math.max(0, data.likes - 1);
            } else {
                data.dislikes = Math.max(0, data.dislikes - 1);
            }
        }
        // 执行新的操作
        if (action === 'like') {
            data.likes++;
        } else {
            data.dislikes++;
        }
        data.userAction = action;
    }

    // 保存数据
    feedbackData[id] = data;
    localStorage.setItem('feedbackData', JSON.stringify(feedbackData));

    // 更新UI
    const container = document.querySelector(`[data-id="${id}"]`);
    if (container) {
        updateFeedbackUI(container, data);
    }
}

// 更新反馈UI
function updateFeedbackUI(container, data) {
    const likeBtn = container.querySelector('.like-btn');
    const dislikeBtn = container.querySelector('.dislike-btn');
    const likeCount = container.querySelector('.like-count');
    const dislikeCount = container.querySelector('.dislike-count');

    // 更新按钮状态
    likeBtn.classList.toggle('active', data.userAction === 'like');
    dislikeBtn.classList.toggle('active', data.userAction === 'dislike');

    // 更新计数
    likeCount.textContent = data.likes;
    dislikeCount.textContent = data.dislikes;
}