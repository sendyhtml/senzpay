let qrCode = null;
let currentQRData = null;

// init qris page
document.addEventListener('DOMContentLoaded', function() {
    const btnAjaib = document.getElementById('btnAjaib');
    const btnMutasi = document.getElementById('btnMutasi');
    const btnCair = document.getElementById('btnCair');
    const confirmBtn = document.getElementById('confirmPayment');
    
    if (btnAjaib) {
        btnAjaib.addEventListener('click', () => showQRModal('ajaib', 50000));
    }
    
    if (btnMutasi) {
        btnMutasi.addEventListener('click', () => showQRModal('mutasi', 50000));
    }
    
    if (btnCair) {
        btnCair.addEventListener('click', processCairkan);
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmPayment);
    }
});

// show qr modal
function showQRModal(type, amount) {
    const modal = document.getElementById('qrModal');
    const qrContainer = document.getElementById('qrcode');
    const amountEl = document.getElementById('qrAmount');
    
    // generate qr data
    const qrData = generateQRData(type, amount);
    currentQRData = { type, amount, data: qrData };
    
    // clear previous qr
    qrContainer.innerHTML = '';
    
    // create new qr
    new QRCode(qrContainer, {
        text: qrData,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    amountEl.textContent = `Rp ${formatRupiah(amount)}`;
    modal.classList.add('show');
}

// generate qr data (format QRIS standard)
function generateQRData(type, amount) {
    const merchantID = '123456789012345';
    const timestamp = Date.now();
    
    // QRIS format sederhana (untuk demo)
    if (type === 'ajaib') {
        return `QRIS:AJAIB:${merchantID}:${amount}:${timestamp}`;
    } else {
        return `QRIS:MUTASI:${merchantID}:${amount}:${timestamp}`;
    }
}

// close qr modal
function closeQRModal() {
    const modal = document.getElementById('qrModal');
    modal.classList.remove('show');
    currentQRData = null;
}

// confirm payment
function confirmPayment() {
    if (!currentQRData) return;
    
    closeQRModal();
    
    // proses berdasarkan tipe
    if (currentQRData.type === 'ajaib') {
        processAjaib(currentQRData.amount);
    } else {
        processMutasi(currentQRData.amount);
    }
}

// process qris ajaib
function processAjaib(amount) {
    const users = JSON.parse(localStorage.getItem('zenzpay_users')) || [];
    const currentUsername = localStorage.getItem('zenzpay_user');
    const userIndex = users.findIndex(u => u.username === currentUsername);
    
    if (userIndex === -1) return;
    
    users[userIndex].saldoQris += amount;
    users[userIndex].riwayat.push({
        id: Date.now(),
        deskripsi: 'QRIS ajaib - menunggu konfirmasi',
        nominal: amount,
        tipe: 'masuk',
        status: 'pending',
        tanggal: new Date().toISOString()
    });
    
    localStorage.setItem('zenzpay_users', JSON.stringify(users));
    
    // simulasikan konfirmasi setelah 5 detik
    setTimeout(() => {
        const updatedUsers = JSON.parse(localStorage.getItem('zenzpay_users')) || [];
        const idx = updatedUsers.findIndex(u => u.username === currentUsername);
        
        if (idx !== -1) {
            const riwayat = updatedUsers[idx].riwayat;
            const lastItem = riwayat[riwayat.length - 1];
            if (lastItem && lastItem.status === 'pending') {
                lastItem.status = 'success';
                lastItem.deskripsi = 'QRIS ajaib - berhasil';
                localStorage.setItem('zenzpay_users', JSON.stringify(updatedUsers));
                
                // reload data if on index
                if (window.location.pathname.includes('index')) {
                    location.reload();
                }
            }
        }
    }, 5000);
    
    alert(`QRIS ajaib: Rp ${formatRupiah(amount)}\nMenunggu konfirmasi admin`);
}

// process mutasi qris
function processMutasi(amount) {
    const users = JSON.parse(localStorage.getItem('zenzpay_users')) || [];
    const currentUsername = localStorage.getItem('zenzpay_user');
    const userIndex = users.findIndex(u => u.username === currentUsername);
    
    if (userIndex === -1) return;
    
    users[userIndex].saldoQris += amount;
    users[userIndex].riwayat.push({
        id: Date.now(),
        deskripsi: 'mutasi QRIS - otomatis',
        nominal: amount,
        tipe: 'masuk',
        tanggal: new Date().toISOString()
    });
    
    localStorage.setItem('zenzpay_users', JSON.stringify(users));
    
    // update current user
    const updatedUsers = JSON.parse(localStorage.getItem('zenzpay_users')) || [];
    currentUser = updatedUsers[userIndex];
    
    // update ui
    const qrisEl = document.getElementById('qrisValue');
    const qrisDetail = document.getElementById('qrisDetail');
    
    if (qrisEl) qrisEl.textContent = formatRupiah(currentUser.saldoQris);
    if (qrisDetail) qrisDetail.textContent = `Rp ${formatRupiah(currentUser.saldoQris)}`;
    
    alert(`mutasi berhasil: +Rp ${formatRupiah(amount)}`);
}

// process cairkan
function processCairkan() {
    if (!currentUser || currentUser.saldoQris < 10000) {
        alert('saldo QRIS minimal Rp 10.000 untuk pencairan');
        return;
    }
    
    const amount = currentUser.saldoQris;
    const users = JSON.parse(localStorage.getItem('zenzpay_users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    users[userIndex].saldoAkun += amount;
    users[userIndex].saldoQris = 0;
    users[userIndex].riwayat.push({
        id: Date.now(),
        deskripsi: 'pencairan saldo QRIS',
        nominal: amount,
        tipe: 'masuk',
        tanggal: new Date().toISOString()
    });
    
    localStorage.setItem('zenzpay_users', JSON.stringify(users));
    currentUser = users[userIndex];
    
    // update ui
    const qrisEl = document.getElementById('qrisValue');
    const qrisDetail = document.getElementById('qrisDetail');
    
    if (qrisEl) qrisEl.textContent = formatRupiah(0);
    if (qrisDetail) qrisDetail.textContent = 'Rp 0';
    
    alert(`saldo QRIS dicairkan: Rp ${formatRupiah(amount)}`);
}

// format rupiah (reuse from script.js)
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID').format(angka || 0);
}