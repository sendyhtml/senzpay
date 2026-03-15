// data store
let currentUser = null;

// init
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadUserData();
    updateGreeting();
    
    // toggle saldo
    const toggleBtn = document.getElementById('toggleSaldo');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSaldo);
    }
    
    // filter riwayat
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterRiwayat(this.dataset.filter);
        });
    });
    
    // load available balance di withdraw
    const availableSpan = document.getElementById('availableBalance');
    if (availableSpan && currentUser) {
        availableSpan.textContent = formatRupiah(currentUser.saldoAkun);
    }
});

// auth check
function checkAuth() {
    const isLoggedIn = localStorage.getItem('zenzpay_auth');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (isLoggedIn !== 'true' && !currentPage.includes('login')) {
        window.location.href = 'login.html';
    }
    
    if (isLoggedIn === 'true') {
        loadCurrentUser();
    }
}

// load current user
function loadCurrentUser() {
    const users = JSON.parse(localStorage.getItem('zenzpay_users')) || [];
    const username = localStorage.getItem('zenzpay_user');
    currentUser = users.find(u => u.username === username);
    
    if (!currentUser && users.length > 0) {
        currentUser = users[0];
        localStorage.setItem('zenzpay_user', currentUser.username);
    }
}

// update greeting
function updateGreeting() {
    const greetingEl = document.getElementById('greetingTime');
    if (!greetingEl) return;
    
    const hour = new Date().getHours();
    let text = 'PAGI';
    if (hour >= 11 && hour < 15) text = 'SIANG';
    else if (hour >= 15 && hour < 18) text = 'SORE';
    else if (hour >= 18 || hour < 4) text = 'MALAM';
    
    greetingEl.textContent = text;
}

// load user data to UI
function loadUserData() {
    if (!currentUser) return;
    
    const nameEl = document.getElementById('userName');
    const akunEl = document.getElementById('akunValue');
    const qrisEl = document.getElementById('qrisValue');
    const profileEl = document.getElementById('profileName');
    const qrisDetail = document.getElementById('qrisDetail');
    
    if (nameEl) nameEl.textContent = currentUser.username;
    if (akunEl) akunEl.textContent = formatRupiah(currentUser.saldoAkun);
    if (qrisEl) qrisEl.textContent = formatRupiah(currentUser.saldoQris);
    if (profileEl) profileEl.textContent = currentUser.username;
    if (qrisDetail) qrisDetail.textContent = `Rp ${formatRupiah(currentUser.saldoQris)}`;
}

// format rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID').format(angka || 0);
}

// toggle saldo visibility
function toggleSaldo() {
    const hiddenElements = document.querySelectorAll('.value.hidden');
    const icon = document.querySelector('#toggleSaldo i');
    
    hiddenElements.forEach(el => {
        el.classList.toggle('hidden');
    });
    
    if (icon) {
        icon.className = hiddenElements[0]?.classList.contains('hidden') 
            ? 'fas fa-eye-slash' 
            : 'fas fa-eye';
    }
}

// handle login
function handleLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('isi semua field');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('zenzpay_users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        localStorage.setItem('zenzpay_auth', 'true');
        localStorage.setItem('zenzpay_user', username);
        window.location.href = 'index.html';
    } else {
        alert('username/password salah');
    }
}

// handle register
function handleRegister() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;
    
    if (!username || !password || !confirm) {
        alert('isi semua field');
        return;
    }
    
    if (password !== confirm) {
        alert('password tidak cocok');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('zenzpay_users')) || [];
    
    if (users.find(u => u.username === username)) {
        alert('username sudah digunakan');
        return;
    }
    
    const newUser = {
        username,
        password,
        saldoAkun: 250000,
        saldoQris: 100000,
        riwayat: [
            {
                id: Date.now(),
                deskripsi: 'saldo awal',
                nominal: 250000,
                tipe: 'masuk',
                tanggal: new Date().toISOString()
            }
        ]
    };
    
    users.push(newUser);
    localStorage.setItem('zenzpay_users', JSON.stringify(users));
    alert('registrasi berhasil');
    showLogin();
}

// show login form
function showLogin() {
    document.getElementById('registerForm')?.classList.remove('active');
    document.getElementById('loginForm')?.classList.add('active');
}

// show register form
function showRegister() {
    document.getElementById('loginForm')?.classList.remove('active');
    document.getElementById('registerForm')?.classList.add('active');
}

// update username
function updateUsername() {
    const newUsername = document.getElementById('newUsername').value;
    
    if (!newUsername) {
        alert('masukkan username baru');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('zenzpay_users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    if (users.find(u => u.username === newUsername)) {
        alert('username sudah digunakan');
        return;
    }
    
    users[userIndex].username = newUsername;
    localStorage.setItem('zenzpay_users', JSON.stringify(users));
    localStorage.setItem('zenzpay_user', newUsername);
    
    currentUser.username = newUsername;
    loadUserData();
    
    document.getElementById('newUsername').value = '';
    alert('username berhasil diubah');
}

// update password
function updatePassword() {
    const current = document.getElementById('currentPassword')?.value;
    const newPass = document.getElementById('newPassword')?.value;
    const confirm = document.getElementById('confirmPassword')?.value;
    
    if (!current || !newPass || !confirm) {
        alert('isi semua field');
        return;
    }
    
    if (current !== currentUser.password) {
        alert('password saat ini salah');
        return;
    }
    
    if (newPass !== confirm) {
        alert('password baru tidak cocok');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('zenzpay_users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    users[userIndex].password = newPass;
    localStorage.setItem('zenzpay_users', JSON.stringify(users));
    
    currentUser.password = newPass;
    
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    alert('password berhasil diubah');
}

// process withdraw
function processWithdraw() {
    const method = document.getElementById('withdrawMethod').value;
    const account = document.getElementById('accountNumber').value;
    const amount = parseInt(document.getElementById('withdrawAmount').value);
    
    if (!account || !amount) {
        alert('isi semua field');
        return;
    }
    
    if (amount < 50000) {
        alert('minimal withdraw Rp 50.000');
        return;
    }
    
    if (amount > currentUser.saldoAkun) {
        alert('saldo tidak mencukupi');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('zenzpay_users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    users[userIndex].saldoAkun -= amount;
    users[userIndex].riwayat.push({
        id: Date.now(),
        deskripsi: `withdraw ke ${method}`,
        nominal: amount,
        tipe: 'keluar',
        tanggal: new Date().toISOString()
    });
    
    localStorage.setItem('zenzpay_users', JSON.stringify(users));
    currentUser = users[userIndex];
    
    alert(`permintaan withdraw Rp ${formatRupiah(amount)} diproses`);
    window.location.href = 'index.html';
}

// load riwayat
function loadRiwayat() {
    const listEl = document.getElementById('riwayatList');
    if (!listEl || !currentUser) return;
    
    if (!currentUser.riwayat || currentUser.riwayat.length === 0) {
        listEl.innerHTML = '<div class="empty-state">belum ada riwayat</div>';
        return;
    }
    
    let html = '';
    currentUser.riwayat.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    currentUser.riwayat.forEach(item => {
        const tanggal = new Date(item.tanggal).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        html += `
            <div class="riwayat-item" data-tipe="${item.tipe}">
                <div class="riwayat-info">
                    <h4>${item.deskripsi}</h4>
                    <p>${tanggal}</p>
                </div>
                <div class="riwayat-nominal ${item.tipe}">
                    ${item.tipe === 'masuk' ? '+' : '-'} Rp ${formatRupiah(item.nominal)}
                </div>
            </div>
        `;
    });
    
    listEl.innerHTML = html;
}

// filter riwayat
function filterRiwayat(tipe) {
    const items = document.querySelectorAll('.riwayat-item');
    
    items.forEach(item => {
        if (tipe === 'all' || item.dataset.tipe === tipe) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// logout
function logout() {
    localStorage.removeItem('zenzpay_auth');
    localStorage.removeItem('zenzpay_user');
    window.location.href = 'login.html';
}