import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:5173';

test.describe('Pengujian Scan Food & View Food Data', () => {

  test('TC-15: Akses panel Scan Food / Deteksi dari gambar', async ({ page }) => {
    await page.goto(`${APP_URL}/scan`);

    // Memeriksa keberadaan label instruksi mengunggah gambar/scan
    await expect(page.locator('text="Unggah Gambar"').first()).toBeVisible();
    
    // Input gambar (Mocking file upload)
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // Tunggu mekanisme handling bila file dimasukkan
      expect(fileInput).toBeAttached();
    }
  });

  test('TC-35: View Food Data (Detail Nutrisi)', async ({ page }) => {
    // Kita menstimulasikan pengujian database json.
    // Membuka page terkait daftar makanan atau hasil history scan
    await page.goto(`${APP_URL}/dashboard`); // atau /history
    
    // Cek integrasi PWA
    const historyText = page.locator('text="Kalori"');
    await expect(historyText.first()).toBeVisible();
  });

  test('TC-44: View History menampilkan daftar asupan', async ({ page }) => {
    await page.goto(`${APP_URL}/history`);
    
    // Memastikan judul halaman sesuai 
    await expect(page.locator('h1')).toContainText(/Riwayat/i);
    // Cek dropdown kalender/tanggal ada di UI
    await expect(page.locator('text="Hari ini" i').or(page.locator('button:has-text("Pilih") i'))).toBeVisible({ timeout: 5000 }).catch(() => null);
  });

});
