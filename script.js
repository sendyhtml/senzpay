// Cek status login
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (isLoggedIn !== 'true' && currentPage !== 'login.html' && currentPage !== '') {
        window.location.href = 'login.html';
    }
}

// Data user default
const defaultUser = {
    username: 'demo',
    password: 'demo123',
    saldoAkun: 250000,
    saldoQris: 100000,
    riwayat: [
        { deskripsi: 'Saldo QRIS Masuk', nominal: 50000, tipe: 'masuk', tanggal: new Date().toLocaleString() },
        { deskripsi: 'Penarikan Saldo', nominal: 25000, tipe: 'keluar', tanggal: new Date().toLocaleString() }
    ]
};

// Inisialisasi data jika belum ada
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([defaultUser]));
}

// Format waktu sapaan
function updateGreeting() {
    const greetingElement = document.getElementById('greetingTime');
    if (greetingElement) {
        const hour = new Date().getHours();
        let greeting = 'Pagi';
        if (hour >= 15) greeting = 'Sore';
        else if (hour >= 11) greeting = 'Siang';
        else if (hour >= 18) greeting = 'Malam';
        greetingElement.textContent = greeting;
    }
}

// Toggle saldo
let saldoVisible = true;
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    updateGreeting();
    loadUserData();
    loadRiwayat();
    
    const toggleBtn = document.getElementById('toggleSaldo');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const hiddenElements = document.querySelectorAll('.hidden-balance');
            saldoVisible = !saldoVisible;
            this.innerHTML = saldoVisible ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            hiddenElements.forEach(el => {
                el.style.filter = saldoVisible ? 'none' : 'blur(5px)';
            });
        });
    }
    
    // Event listener untuk QRIS buttons
    const btnQrisAjaib = document.getElementById('btnQrisAjaib');
    const btnMutasi = document.getElementById('btnMutasi');
    const btnCairkan = document.getElementById('btnCairkan');
    
    if (btnQrisAjaib) {
        btnQrisAjaib.addEventListener('click', function() {
            document.getElementById('confirmModal').classList.add('show');
        });
    }
    
    if (btnMutasi) {
        btnMutasi.addEventListener('click', function() {
            // Simulasi mutasi otomatis
            const amount = 50000;
            processMutasi(amount);
        });
    }
    
    if (btnCairkan) {
        btnCairkan.addEventListener('click', function() {
            processCairkan();
        });
    }
});

// Load data user
function loadUserData() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = users[0]; // Untuk demo, ambil user pertama
    
    const userNameElement = document.getElementById('userName');
    const saldoAkunElement = document.getElementById('saldoAkun');
    const saldoQrisElement = document.getElementById('saldoQris');
    const saldoQrisDetail = document.getElementById('saldoQrisDetail');
    const profileUsername = document.getElementById('profileUsername');
    
    if (userNameElement) userNameElement.textContent = currentUser.username;
    if (saldoAkunElement) saldoAkunElement.innerHTML = `Rp <span class="hidden-balance">${formatRupiah(currentUser.saldoAkun)}</span>`;
    if (saldoQrisElement) saldoQrisElement.innerHTML = `Rp <span class="hidden-balance">${formatRupiah(currentUser.saldoQris)}</span>`;
    if (saldoQrisDetail) saldoQrisDetail.textContent = `Rp ${formatRupiah(currentUser.saldoQris)}`;
    if (profileUsername) profileUsername.value = currentUser.username;
}

// Format rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID').format(angka);
}

// Handle Login
function handleLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', username);
        window.location.href = 'index.html';
    } else {
        alert('Username atau password salah!');
    }
}

// Handle Register
function handleRegister() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (!username || !password || !confirmPassword) {
        alert('Semua field harus diisi!');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Password tidak cocok!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.find(u => u.username === username)) {
        alert('Username sudah digunakan!');
        return;
    }
    
    const newUser = {
        username: username,
        password: password,
        saldoAkun: 0,
        saldoQris: 0,
        riwayat: []
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Pendaftaran berhasil! Silakan login.');
    showLogin();
}

// Toggle form login/register
function showRegister() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
}

function showLogin() {
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('confirmModal').classList.remove('show');
}

// Confirm transfer untuk QRIS AJAIB
function confirmTransfer() {
    const bukti = document.getElementById('buktiTransfer').files[0];
    if (!bukti) {
        alert('Harap upload bukti transfer!');
        return;
    }
    
    // Simulasi proses
    alert('Bukti transfer diterima, sedang diproses...');
    closeModal();
    
    // Update saldo setelah konfirmasi
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const currentUser = users[0];
        const amount = 50000;
        
        currentUser.saldoQris += amount;
        currentUser.riwayat.push({
            deskripsi: 'Saldo QRIS Masuk (QRIS AJAIB)',
            nominal: amount,
            tipe: 'masuk',
            tanggal: new Date().toLocaleString()
        });
        
        localStorage.setItem('users', JSON.stringify(users));
        loadUserData();
        alert('Saldo QRIS berhasil ditambahkan!');
    }, 2000);
}

// Proses mutasi QRIS (otomatis masuk)
function processMutasi(amount) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = users[0];
    
    currentUser.saldoQris += amount;
    currentUser.riwayat.push({
        deskripsi: 'Saldo QRIS Masuk (Mutasi)',
        nominal: amount,
        tipe: 'masuk',
        tanggal: new Date().toLocaleString()
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    loadUserData();
    alert(`Mutasi berhasil! Saldo QRIS bertambah Rp ${formatRupiah(amount)}`);
}

// Proses cairkan saldo QRIS ke akun
function processCairkan() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = users[0];
    
    if (currentUser.saldoQris <= 0) {
        alert('Saldo QRIS kosong!');
        return;
    }
    
    const amount = currentUser.saldoQris;
    currentUser.saldoAkun += amount;
    currentUser.saldoQris = 0;
    
    currentUser.riwayat.push({
        deskripsi: 'Pencairan Saldo QRIS',
        nominal: amount,
        tipe: 'masuk',
        tanggal: new Date().toLocaleString()
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    loadUserData();
    alert(`Saldo QRIS berhasil dicairkan ke akun sebesar Rp ${formatRupiah(amount)}`);
}

// Proses withdraw
function processWithdraw() {
    const method = document.getElementById('withdrawMethod').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const amount = parseInt(document.getElementById('withdrawAmount').value);
    
    if (!accountNumber || !amount) {
        alert('Semua field harus diisi!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = users[0];
    
    if (amount > currentUser.saldoAkun) {
        alert('Saldo tidak mencukupi!');
        return;
    }
    
    currentUser.saldoAkun -= amount;
    currentUser.riwayat.push({
        deskripsi: `Penarikan ke ${method}`,
        nominal: amount,
        tipe: 'keluar',
        tanggal: new Date().toLocaleString()
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    loadUserData();
    alert(`Permintaan penarikan Rp ${formatRupiah(amount)} sedang diproses`);
    window.location.href = 'index.html';
}

// Load riwayat
function loadRiwayat() {
    const riwayatList = document.getElementById('riwayatList');
    if (!riwayatList) return;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = users[0];
    
    if (currentUser.riwayat.length === 0) {
        riwayatList.innerHTML = '<p style="text-align: center; color: #999; padding: 50px;">Belum ada riwayat</p>';
        return;
    }
    
    let html = '';
    currentUser.riwayat.reverse().forEach(item => {
        html += `
            <div class="riwayat-item">
                <div class="info">
                    <h4>${item.deskripsi}</h4>
                    <p>${item.tanggal}</p>
                </div>
                <div class="amount ${item.tipe === 'keluar' ? 'negative' : ''}">
                    ${item.tipe === 'keluar' ? '-' : '+'} Rp ${formatRupiah(item.nominal)}
                </div>
            </div>
        `;
    });
    
    riwayatList.innerHTML = html;
}

// Update username
function updateUsername() {
    const newUsername = document.getElementById('profileUsername').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = users[0];
    
    if (newUsername && newUsername !== currentUser.username) {
        currentUser.username = newUsername;
        localStorage.setItem('users', JSON.stringify(users));
        alert('Username berhasil diubah!');
        loadUserData();
    }
}

// Update password
function updatePassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (!newPassword || !confirmPassword) {
        alert('Password harus diisi!');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Password tidak cocok!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = users[0];
    
    currentUser.password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Password berhasil diubah!');
    
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
}

// Logout
function logout() {
    localStorage.setItem('isLoggedIn', 'false');
    window.location.href = 'login.html';
}