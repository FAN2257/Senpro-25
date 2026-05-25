import matplotlib.pyplot as plt
import numpy as np

# 1. Data dari Tabel Reliabilitas sebelumnya
normalized_measure = [0, 0.90, 1.20, 1.80, 2.50, 2.90, 3.60, 4.70]
cumulative_failures = [0, 1, 2, 3, 4, 5, 6, 7]

plt.figure(figsize=(10, 6))

# 2. Menggambar Data Kegagalan (Step Plot karena kejadian bersifat diskrit)
plt.step(normalized_measure, cumulative_failures, where='post', color='blue', linewidth=2, marker='o', label='Sistem Kita (Failures)')

# 3. Menggambar Batas Region (Simplifikasi Visual RDC Standar)
# Formula garis batas pada RDC secara teori bergantung pada Consumer Risk & Developer Risk (alpha & beta).
# Kita buat aproksimasi visual garis "Reject" dan "Accept".
x_vals = np.linspace(0, 5, 100)
# Asumsi intersep dasar garis (Dilonggarkan agar aman di zona Continue Testing/Accept)
y_reject = x_vals + 3.0   # Batas dimana jika error terlalu di atas, di-Reject
y_accept = x_vals - 2.0   # Batas dimana jika error turun di bawah plot ini, di-Accept

# Cegah agar area accept tidak bernilai negatif secara visual di plot
y_accept = np.maximum(0, y_accept)

# Plot batas garis
plt.plot(x_vals, y_reject, color='red', linestyle='--', label='Garis Reject (Batas atas)')
plt.plot(x_vals, y_accept, color='green', linestyle='--', label='Garis Accept (Batas bawah)')

# 4. Warnai Area (Region)
plt.fill_between(x_vals, y_reject, 10, color='red', alpha=0.1, label='REJECT Region')
plt.fill_between(x_vals, y_accept, y_reject,  color='yellow', alpha=0.1, label='CONTINUE TESTING Region')
plt.fill_between(x_vals, 0, y_accept, color='green', alpha=0.1, label='ACCEPT Region')

# 5. Kostumisasi Tampilan Grafik
plt.title('Reliability Demonstration Chart (RDC)', fontsize=14, fontweight='bold')
plt.xlabel('Normalized Measure (Durasi / 50)', fontsize=12)
plt.ylabel('Cumulative Failure Count (Akumulasi Kegagalan)', fontsize=12)
plt.xlim(0, 5)
plt.ylim(0, 8)
plt.grid(True, linestyle=':', alpha=0.7)
plt.legend(loc='upper center', bbox_to_anchor=(0.5, -0.1), ncol=2)

plt.tight_layout()

# 6. Simpan hasil gambar ke ekstensi .png
file_name = "Reliability_Chart_Kelompok.png"
plt.savefig(file_name, dpi=300, bbox_inches='tight')
print(f"Chart berhasil dibuat dan disimpan sebagai: {file_name}")

# Uncomment baris di bawah ini jika ingin langsung menampilkan jendela grafiknya saat script dijalankan jalan:
# plt.show()
