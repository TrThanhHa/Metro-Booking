function updateAuthUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('user_name');
    const userGreeting = document.getElementById('user-greeting');
    const authButtons = document.getElementById('auth-buttons');
    
    if (userGreeting && authButtons) {
        if (isLoggedIn && userName) {
            userGreeting.textContent = `ようこそ、${userName}様！`; 
            userGreeting.style.display = 'inline';
            authButtons.style.display = 'none';

        } else {
            userGreeting.style.display = 'none';
            authButtons.style.display = 'inline';
        }
    }
}

function updateDateTime() {
    const now = new Date();
    const dateElement = document.getElementById('current-date-time');

    if (!dateElement) return;

    const options = {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
    };
    
    const formattedDate = now.toLocaleDateString('ja-JP', options);
    const formattedTime = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    dateElement.innerHTML = `${formattedDate}<br>${formattedTime}`;
}

function setupPasswordToggle() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        const inputId = btn.getAttribute('data-target');
        const input = document.getElementById(inputId);
        
        if (input) {
            btn.addEventListener('click', function() {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                btn.textContent = (type === 'text' ? '🔒' : '👁️');
            });
        }
    });
}

const bookingForm = document.getElementById('booking-form');
const ticketTypeSelect = document.getElementById('ticket-type');
const passengerTypeSelect = document.getElementById('passenger-type');
const conditionalFields = document.getElementById('conditional-fields');
const totalPriceElement = document.getElementById('total-price');

if (bookingForm) { 
    function createStationFields() {
        return `
            <div class="form-group" id="station-fields">
                <label for="start-station">乗車駅 (Ga đi)</label>
                <select id="start-station" required>
                    <option value="" disabled selected>出発駅を選択</option>
                    <option value="Ben Thanh">Ben Thanh</option>
                    <option value="Opera House">Opera House</option>
                    <option value="Ba Son">Ba Son</option>
                    <option value="Van Thanh">Van Thanh</option>
                </select>
                <label for="end-station" style="margin-top: 15px;">降車駅 (Ga đến)</label>
                <select id="end-station" required>
                    <option value="" disabled selected>到着駅を選択</option>
                    <option value="Ben Thanh">Ben Thanh</option>
                    <option value="Opera House">Opera House</option>
                    <option value="Ba Son">Ba Son</option>
                    <option value="Van Thanh">Van Thanh</option>
                </select>
            </div>
        `;
    }

    function createDateField() {
        return `
            <div class="form-group" id="date-field">
                <label for="travel-date">乗車日 (Travel Date)</label>
                <input type="date" id="travel-date" required>
            </div>
        `;
    }
    function generateSeat() {
        const randomNum = Math.floor(Math.random() * 99) + 1;
        return `S${randomNum.toString().padStart(2, '0')}`;
    }
    function updateTotalPrice() {
        const ticketType = ticketTypeSelect.value;
        const passengerType = passengerTypeSelect.value;
        let price = 0;
        if (!ticketType || !passengerType) {
            totalPriceElement.textContent = '--';
            return;
        }
        if (ticketType === 'single-trip' || ticketType === 'daily-pass') {
            if (passengerType === 'senior') {
                price = 0;            
            } else if (passengerType === 'student') {
                if (ticketType === 'single-trip') {
                    price = 5000; 
                } else if (ticketType === 'daily-pass') {
                    price = 8000;
                }
            } else if (passengerType === 'adult') {
                if (ticketType === 'single-trip') {
                    price = 15000;
                } else if (ticketType === 'daily-pass') {
                    price = 25000;
                }
            } else if (passengerType === 'child') {
                price = 0;
            }
        } else if (ticketType === 'monthly-pass') {            
            if (passengerType === 'senior') {
                price = 0;
            } else if (passengerType === 'student') {
                price = 150000;
            } else if (passengerType === 'adult') {
                price = 300000;
            } else if (passengerType === 'child') {
                price = 0;
            }
        }
        if (price === 0) {
            totalPriceElement.textContent = '無料 (FREE)';
            totalPriceElement.style.color = '#28a745'; 
        } else {
            totalPriceElement.textContent = price.toLocaleString('en-US') + ' VND';
            totalPriceElement.style.color = '#e60000'; 
        }
    }
    ticketTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        conditionalFields.innerHTML = '';
        if (selectedType === 'monthly-pass') {
            conditionalFields.innerHTML = createStationFields();
        } else if (selectedType === 'daily-pass') {
            conditionalFields.innerHTML = createDateField();
        }
        updateTotalPrice();
    });
    passengerTypeSelect.addEventListener('change', updateTotalPrice);

    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            alert('ログインしてから予約・購入を完了してください。');
            return;
        }

        const buyerName = document.getElementById('buyer-name').value;
        const ticketType = ticketTypeSelect.value;
        const line = document.getElementById('metro-line').value;
        const passengerType = passengerTypeSelect.value;
        const finalPrice = totalPriceElement.textContent;

        let confirmationMessage = 
            `【予約内容確認】\n` +
            `氏名: ${buyerName}\n` +
            `路線: ${line}\n` +
            `チケット種類: ${ticketType}\n` +
            `対象: ${passengerType}\n` +
            `料金: ${finalPrice}\n`; 
        
        let ticketDetails = {
            name: buyerName,
            line: line,
            type: ticketType,
            passenger: passengerType,
            price: finalPrice,
            purchaseTime: new Date().toLocaleString('ja-JP'),
            departureTime: '該当なし',
            startStation: '該当なし', 
            endStation: '該当なし',   
            seat: '該当なし'
        };

        const now = new Date();
        
        if (ticketType === 'monthly-pass') {
            const startStation = document.getElementById('start-station').value;
            const endStation = document.getElementById('end-station').value;
            
            confirmationMessage += `乗車駅: ${startStation}\n降車駅: ${endStation}\n`;
            
            ticketDetails.startStation = startStation;
            ticketDetails.endStation = endStation;

        } else if (ticketType === 'daily-pass') {
            const travelDate = document.getElementById('travel-date').value;
            confirmationMessage += `乗車日: ${travelDate}\n`;

        } else if (ticketType === 'single-trip') {
            
            const departureTime = new Date(now.getTime() + 15 * 60000);
            const seatNumber = generateSeat();

            confirmationMessage += 
                `出発予定時刻: ${departureTime.toLocaleString('ja-JP')}\n` +
                `座席番号: ${seatNumber}\n`;

            ticketDetails.departureTime = departureTime.toLocaleString('ja-JP');
            ticketDetails.seat = seatNumber;
        }
        
        confirmationMessage += `購入日時: ${ticketDetails.purchaseTime}\n`;
      
        if (confirm(confirmationMessage + `\n上記内容で購入を確定しますか？`)) {
            
            localStorage.setItem('lastTicketDetails', JSON.stringify(ticketDetails));

            alert('購入が完了しました！チケット詳細ページへ移動します。');
            
            bookingForm.reset();
            conditionalFields.innerHTML = '';
            totalPriceElement.textContent = '--';
            
            window.location.href = 'ticket-info.html'; 
        }
    });
}

function displayTicketInfo() {
    const displayArea = document.getElementById('ticket-display-area');
    const ticketData = localStorage.getItem('lastTicketDetails');

    if (!displayArea) return;

    if (ticketData) {
        const details = JSON.parse(ticketData);
        let htmlContent = `
            <div class="ticket-card">
                <h3>ご購入ありがとうございます！</h3>
                <table>
                    <tr><th>氏名 (Name)</th><td>${details.name}</td></tr>
                    <tr><th>路線 (Metro Line)</th><td>${details.line}</td></tr>
                    <tr><th>チケット種類 (Ticket Type)</th><td>${details.type}</td></tr>
                    <tr><th>対象 (Passenger Type)</th><td>${details.passenger}</td></tr>
                    <tr><th>料金 (Price)</th><td><span class="price-detail">${details.price}</span></td></tr>
                    <tr><th>購入日時 (Purchase Time)</th><td>${details.purchaseTime}</td></tr>
        `;

        if (details.type === 'single-trip') {
            htmlContent += `
                    <tr><th>出発予定 (Departure Time)</th><td>${details.departureTime}</td></tr>
                    <tr><th>座席番号 (Seat)</th><td><span class="seat-detail">${details.seat}</span></td></tr>
            `;
        } else if (details.type === 'monthly-pass') {
            htmlContent += `
                    <tr><th>乗車区間 (Start Station)</th><td>${details.startStation}</td></tr>
                    <tr><th>降車区間 (End Station)</th><td>${details.endStation}</td></tr>
            `;
        }
        
        htmlContent += `</table></div>`;
        displayArea.innerHTML = htmlContent;
        
    } else {
        displayArea.innerHTML = '<p class="error-message">購入情報が見つかりません。ホームページに戻って再度お試しください。</p>';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI(); 
    updateDateTime();
    setInterval(updateDateTime, 1000); 
    setupPasswordToggle();
    if (document.querySelector('.ticket-info-section')) {
        displayTicketInfo();
    }

    const allMenuItems = document.querySelectorAll('.menu-item');

    allMenuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && window.location.pathname.endsWith(href)) {
             allMenuItems.forEach(mi => mi.classList.remove('active'));
             item.classList.add('active');
        } else if (href === '#') {
             item.addEventListener('click', function(e) {
                 e.preventDefault();
                 const menuText = item.textContent.trim().split(' ')[0];
                 alert(`「${menuText}」ページに移動します。`);
             });
        }
    });

    const userGreeting = document.getElementById('user-greeting');
    if (userGreeting) {
        userGreeting.addEventListener('click', function() {
            if (confirm('ログアウトしますか？')) {
                localStorage.setItem('isLoggedIn', 'false');
                localStorage.removeItem('user_name');
                updateAuthUI(); 
                window.location.href = 'homepage.html'; 
            }
        });
    }

    const bookingItem = document.querySelector('a[href="booking.html"]');
    if(bookingItem) {
        bookingItem.addEventListener('click', function(e) {
            if(localStorage.getItem('isLoggedIn') !== 'true') {
                e.preventDefault();
                alert('チケットを購入するにはログインが必要です。');
                window.location.href = 'login.html';
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function handleRegistration(e) {
            e.preventDefault(); 
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value; // Dùng email thực tế
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;

            if (password !== confirmPassword) {
                alert('パスワードと確認用パスワードが一致しません。'); 
                return;
            }
            
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(password)) {
                alert('パスワードは8文字以上で、大文字、小文字、数字をそれぞれ1文字以上含む必要があります。'); 
                return;
            }

            localStorage.setItem('user_name', name);
            localStorage.setItem('user_email', email); // Lưu email thực tế
            localStorage.setItem('user_password', password); 
            localStorage.setItem('isLoggedIn', 'false');

            alert('登録が完了しました！次はログインしてください。'); 
            window.location.href = 'login.html'; 
        });
    }
  
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function handleLogin(e) {
            e.preventDefault(); 
            const inputEmail = document.getElementById('log-email').value;
            const inputPassword = document.getElementById('log-password').value;
            
            const registeredEmail = localStorage.getItem('user_email');
            const registeredPassword = localStorage.getItem('user_password');

            if (registeredEmail && inputEmail === registeredEmail && inputPassword === registeredPassword) {
                localStorage.setItem('isLoggedIn', 'true');
                
                alert(`ログイン成功。ようこそ、${localStorage.getItem('user_name') || 'お客様'}様！`); 
                
                updateAuthUI();
                window.location.href = 'homepage.html'; 

            } else {
                alert('メールアドレスまたはパスワードが間違っています。'); 
            }
        });
    }

});

function setupFaqToggle() {
    const toggleBtn = document.getElementById('toggle-faq-btn');
    const moreContent = document.getElementById('faq-more-content');

    if (toggleBtn && moreContent) {
        toggleBtn.addEventListener('click', function() {
            const isHidden = moreContent.style.display === 'none' || moreContent.style.display === '';
            if (isHidden) {
                moreContent.style.display = 'block';
                toggleBtn.textContent = '折りたたむ (Thu gọn)'; // Đổi chữ nút
            } else {
                moreContent.style.display = 'none';
                toggleBtn.textContent = 'もっと見る'; 
            }
        });
        moreContent.style.display = 'none'; 
    }
}

function setupStarRating() {
    const stars = document.querySelectorAll('.rating-section .star');
    const submitBtn = document.querySelector('.rating-section .submit-review-btn');
    const reviewInput = document.querySelector('.rating-section input[type="text"]');
    let selectedRating = 0; 
  
    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const value = parseInt(this.getAttribute('data-value'));
            highlightStars(value, stars);
        });
        star.addEventListener('mouseout', function() {
            highlightStars(selectedRating, stars); 
        });
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-value'));
            highlightStars(selectedRating, stars);
            console.log(`Đã chọn ${selectedRating} sao`);
        });
    });

    function highlightStars(count, allStars) {
        allStars.forEach((star, index) => {
            if (index < count) {
                star.textContent = '★'; 
            } else {
                star.textContent = '☆'; 
            }
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            const reviewText = reviewInput.value.trim();
            
            if (selectedRating === 0) {
                alert('評価（星の数）を選択してください。'); 
                return;
            }

            if (reviewText.length > 100) {
                 alert('ご意見は100文字以内でお願いします。');
                 return;
            }
            
            console.log(`Gửi đánh giá: ${selectedRating} sao, Nội dung: "${reviewText}"`);
            alert(`ご評価ありがとうございます！(${selectedRating}つ星を送信しました)`);

            selectedRating = 0;
            reviewInput.value = '';
            highlightStars(0, stars);
        });
    }
}

