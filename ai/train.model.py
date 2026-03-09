"""
SnapEats - Script Training Model Deteksi Makanan Indonesia
==========================================================
Author  : Mirsad Alganawi Azma (23/522716/TK/57737)
Role    : Software Engineer
Project : Praktikum Senior Project Genap 2025 - Kelompok King Em Yu
Model   : YOLOv8 (Object Detection) via Ultralytics

Dataset:
  - Gambar  : Roboflow Dataset (makanan lokal Indonesia)
  - Nutrisi : Panganku / Kemenkes RI
  - Format  : YOLOv8 (images + labels .txt)

Struktur folder dataset yang diharapkan:
  dataset/
    data.yaml
    train/
      images/   (*.jpg)
      labels/   (*.txt)
    val/
      images/   (*.jpg)
      labels/   (*.txt)
    test/
      images/   (*.jpg)
      labels/   (*.txt)
"""

import os
import yaml
import shutil
import argparse
import json
from pathlib import Path
from datetime import datetime

# ─── Coba import ultralytics, beri pesan jelas jika belum install ───────────
try:
    from ultralytics import YOLO
    ULTRALYTICS_AVAILABLE = True
except ImportError:
    ULTRALYTICS_AVAILABLE = False

# ─── Mapping label AI → data nutrisi (sumber: Panganku/Kemenkes RI) ─────────
# Format: { label_ai : { nama_makanan, kalori, protein, lemak, karbohidrat } }
# Semua nilai per 100 gram
FOOD_NUTRITION_DB = {
    "nasi_putih":       {"nama": "Nasi Putih",       "kalori": 135.0, "protein": 2.7,  "lemak": 0.3,  "karbo": 29.9},
    "nasi_goreng":      {"nama": "Nasi Goreng",       "kalori": 182.0, "protein": 4.3,  "lemak": 6.1,  "karbo": 27.6},
    "mie_goreng":       {"nama": "Mie Goreng",        "kalori": 210.0, "protein": 5.5,  "lemak": 8.0,  "karbo": 30.2},
    "ayam_goreng":      {"nama": "Ayam Goreng",       "kalori": 260.0, "protein": 27.3, "lemak": 15.8, "karbo": 5.1},
    "rendang":          {"nama": "Rendang",           "kalori": 193.0, "protein": 19.3, "lemak": 10.0, "karbo": 6.6},
    "soto_ayam":        {"nama": "Soto Ayam",         "kalori": 68.0,  "protein": 5.8,  "lemak": 3.1,  "karbo": 4.2},
    "gado_gado":        {"nama": "Gado-gado",         "kalori": 124.0, "protein": 4.9,  "lemak": 7.5,  "karbo": 10.4},
    "tempe_goreng":     {"nama": "Tempe Goreng",      "kalori": 220.0, "protein": 14.0, "lemak": 13.5, "karbo": 12.7},
    "tahu_goreng":      {"nama": "Tahu Goreng",       "kalori": 135.0, "protein": 9.8,  "lemak": 9.0,  "karbo": 3.0},
    "bakso":            {"nama": "Bakso",             "kalori": 163.0, "protein": 9.0,  "lemak": 9.5,  "karbo": 11.0},
    "sate_ayam":        {"nama": "Sate Ayam",         "kalori": 195.0, "protein": 18.5, "lemak": 9.0,  "karbo": 9.5},
    "pecel_lele":       {"nama": "Pecel Lele",        "kalori": 200.0, "protein": 19.0, "lemak": 10.5, "karbo": 8.0},
    "pempek":           {"nama": "Pempek",            "kalori": 170.0, "protein": 8.0,  "lemak": 3.5,  "karbo": 27.0},
    "martabak_manis":   {"nama": "Martabak Manis",    "kalori": 310.0, "protein": 7.0,  "lemak": 12.0, "karbo": 44.0},
    "pisang_goreng":    {"nama": "Pisang Goreng",     "kalori": 178.0, "protein": 1.5,  "lemak": 7.5,  "karbo": 27.5},
}


def generate_data_yaml(dataset_dir: str, output_path: str) -> str:
    """
    Membuat file data.yaml untuk YOLOv8 training.
    File ini berisi path dataset dan daftar nama kelas.
    """
    dataset_path = Path(dataset_dir).resolve()
    class_names = list(FOOD_NUTRITION_DB.keys())

    data_config = {
        "path": str(dataset_path),
        "train": "train/images",
        "val": "val/images",
        "test": "test/images",
        "nc": len(class_names),
        "names": class_names,
    }

    with open(output_path, "w") as f:
        yaml.dump(data_config, f, allow_unicode=True, default_flow_style=False)

    print(f"[INFO] data.yaml dibuat: {output_path}")
    print(f"[INFO] Jumlah kelas: {len(class_names)}")
    print(f"[INFO] Kelas: {class_names}")
    return output_path


def validate_dataset_structure(dataset_dir: str) -> bool:
    """
    Memvalidasi struktur folder dataset sesuai format YOLOv8.
    Cek keberadaan folder train, val, dan file data.yaml.
    """
    dataset_path = Path(dataset_dir)
    required_dirs = [
        dataset_path / "train" / "images",
        dataset_path / "train" / "labels",
        dataset_path / "val" / "images",
        dataset_path / "val" / "labels",
    ]

    print("[INFO] Memvalidasi struktur dataset...")
    all_ok = True
    for d in required_dirs:
        if d.exists():
            img_count = len(list(d.glob("*.jpg"))) + len(list(d.glob("*.png")))
            print(f"  [OK] {d} ({img_count} file)")
        else:
            print(f"  [MISSING] {d}")
            all_ok = False

    # Cek data.yaml
    yaml_path = dataset_path / "data.yaml"
    if yaml_path.exists():
        print(f"  [OK] {yaml_path}")
    else:
        print(f"  [MISSING] {yaml_path} - akan dibuat otomatis saat training")

    return all_ok


def train_yolov8(
    dataset_dir: str,
    model_size: str = "n",
    epochs: int = 50,
    imgsz: int = 640,
    batch: int = 16,
    project_name: str = "snapeats_runs",
    run_name: str = None,
):
    """
    Melatih model YOLOv8 untuk deteksi makanan Indonesia.

    Args:
        dataset_dir  : Path ke folder dataset (berisi data.yaml)
        model_size   : Ukuran model YOLOv8 ('n'=nano, 's'=small, 'm'=medium)
        epochs       : Jumlah epoch training
        imgsz        : Ukuran input gambar (pixel)
        batch        : Batch size
        project_name : Folder hasil training
        run_name     : Nama run (default: timestamp)
    """
    if not ULTRALYTICS_AVAILABLE:
        print("[ERROR] Ultralytics belum terinstall.")
        print("[INFO]  Jalankan: pip install ultralytics")
        return None

    if run_name is None:
        run_name = f"snapeats_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    # Generate atau cari data.yaml
    data_yaml_path = os.path.join(dataset_dir, "data.yaml")
    if not os.path.exists(data_yaml_path):
        print(f"[INFO] data.yaml tidak ditemukan, membuat otomatis...")
        generate_data_yaml(dataset_dir, data_yaml_path)

    # Pilih model pretrained
    model_map = {
        "n": "yolov8n.pt",   # Nano  — paling ringan, cocok untuk test awal
        "s": "yolov8s.pt",   # Small — keseimbangan kecepatan & akurasi
        "m": "yolov8m.pt",   # Medium — akurasi lebih baik, butuh GPU lebih kuat
    }
    pretrained_weights = model_map.get(model_size, "yolov8n.pt")

    print(f"\n{'='*60}")
    print(f"  SnapEats - YOLOv8 Food Detection Training")
    print(f"{'='*60}")
    print(f"  Model      : YOLOv8{model_size} ({pretrained_weights})")
    print(f"  Dataset    : {dataset_dir}")
    print(f"  Epochs     : {epochs}")
    print(f"  Image size : {imgsz}px")
    print(f"  Batch size : {batch}")
    print(f"  Run name   : {run_name}")
    print(f"{'='*60}\n")

    # Load model pretrained (transfer learning dari COCO)
    model = YOLO(pretrained_weights)

    # Mulai training
    results = model.train(
        data=data_yaml_path,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        name=run_name,
        project=project_name,
        # Augmentasi data untuk generalisasi lebih baik
        augment=True,
        degrees=10.0,       # Rotasi ±10°
        translate=0.1,      # Translasi ±10%
        scale=0.5,          # Skala 50%-150%
        fliplr=0.5,         # Flip horizontal 50%
        hsv_h=0.015,        # Variasi Hue
        hsv_s=0.7,          # Variasi Saturation
        hsv_v=0.4,          # Variasi Value/Brightness
        # Optimisasi
        optimizer="AdamW",
        lr0=0.001,          # Learning rate awal
        patience=15,        # Early stopping jika tidak improve 15 epoch
        # Logging
        verbose=True,
        save=True,
        save_period=10,     # Simpan checkpoint tiap 10 epoch
    )

    print(f"\n[INFO] Training selesai!")
    best_weights = Path(project_name) / run_name / "weights" / "best.pt"
    print(f"[INFO] Best model: {best_weights}")
    return results


def evaluate_model(weights_path: str, dataset_dir: str):
    """
    Evaluasi performa model pada test set.
    Menampilkan metrik: mAP50, mAP50-95, Precision, Recall.
    """
    if not ULTRALYTICS_AVAILABLE:
        print("[ERROR] Ultralytics belum terinstall.")
        return

    data_yaml_path = os.path.join(dataset_dir, "data.yaml")
    model = YOLO(weights_path)

    print(f"\n[INFO] Evaluasi model: {weights_path}")
    metrics = model.val(data=data_yaml_path, split="test")

    print(f"\n{'='*50}")
    print(f"  Hasil Evaluasi SnapEats Model")
    print(f"{'='*50}")
    print(f"  mAP@50       : {metrics.box.map50:.4f}")
    print(f"  mAP@50-95    : {metrics.box.map:.4f}")
    print(f"  Precision    : {metrics.box.mp:.4f}")
    print(f"  Recall       : {metrics.box.mr:.4f}")
    print(f"{'='*50}\n")

    # Simpan hasil evaluasi ke JSON
    eval_results = {
        "model": weights_path,
        "timestamp": datetime.now().isoformat(),
        "map50": float(metrics.box.map50),
        "map50_95": float(metrics.box.map),
        "precision": float(metrics.box.mp),
        "recall": float(metrics.box.mr),
    }
    with open("eval_results.json", "w") as f:
        json.dump(eval_results, f, indent=2)
    print(f"[INFO] Hasil evaluasi disimpan ke eval_results.json")
    return metrics


def predict_single_image(weights_path: str, image_path: str, conf_threshold: float = 0.5):
    """
    Uji inferensi model pada satu gambar makanan.
    Mengembalikan daftar deteksi beserta data nutrisi dari database.

    Args:
        weights_path   : Path ke file .pt model terlatih
        image_path     : Path ke gambar yang akan diprediksi
        conf_threshold : Threshold confidence (0.0 - 1.0)
    """
    if not ULTRALYTICS_AVAILABLE:
        print("[ERROR] Ultralytics belum terinstall.")
        return

    model = YOLO(weights_path)
    results = model.predict(image_path, conf=conf_threshold, verbose=False)

    class_names = list(FOOD_NUTRITION_DB.keys())
    detections = []

    for r in results:
        for box in r.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            if class_id < len(class_names):
                label = class_names[class_id]
                nutrition = FOOD_NUTRITION_DB.get(label, {})

                detection = {
                    "label": label,
                    "nama_makanan": nutrition.get("nama", label),
                    "confidence": round(confidence, 3),
                    "nutrisi_per_100g": {
                        "kalori":  nutrition.get("kalori", 0),
                        "protein": nutrition.get("protein", 0),
                        "lemak":   nutrition.get("lemak", 0),
                        "karbohidrat": nutrition.get("karbo", 0),
                    }
                }
                detections.append(detection)

    print(f"\n[RESULT] Deteksi pada {image_path}:")
    for det in detections:
        print(f"  Makanan    : {det['nama_makanan']} ({det['confidence']*100:.1f}%)")
        print(f"  Kalori     : {det['nutrisi_per_100g']['kalori']} kkal/100g")
        print(f"  Protein    : {det['nutrisi_per_100g']['protein']} g/100g")
        print(f"  Lemak      : {det['nutrisi_per_100g']['lemak']} g/100g")
        print(f"  Karbohidrat: {det['nutrisi_per_100g']['karbohidrat']} g/100g")
        print()

    return detections


def export_model(weights_path: str, export_format: str = "onnx"):
    """
    Export model ke format ONNX atau TorchScript untuk deployment di Azure.

    Args:
        weights_path  : Path ke best.pt
        export_format : 'onnx' untuk Azure deployment, 'torchscript' untuk mobile
    """
    if not ULTRALYTICS_AVAILABLE:
        print("[ERROR] Ultralytics belum terinstall.")
        return

    model = YOLO(weights_path)
    exported = model.export(format=export_format, optimize=True)
    print(f"[INFO] Model di-export ke: {exported}")
    return exported


# ─── CLI Interface ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="SnapEats - YOLOv8 Food Detection Training & Inference",
        formatter_class=argparse.RawTextHelpFormatter
    )
    subparsers = parser.add_subparsers(dest="command", help="Pilih command")

    # Command: train
    train_parser = subparsers.add_parser("train", help="Latih model YOLOv8")
    train_parser.add_argument("--dataset",  required=True,   help="Path folder dataset")
    train_parser.add_argument("--model",    default="n",     choices=["n","s","m"], help="Ukuran model: n/s/m")
    train_parser.add_argument("--epochs",   default=50,      type=int)
    train_parser.add_argument("--imgsz",    default=640,     type=int)
    train_parser.add_argument("--batch",    default=16,      type=int)

    # Command: eval
    eval_parser = subparsers.add_parser("eval", help="Evaluasi model pada test set")
    eval_parser.add_argument("--weights",  required=True, help="Path ke best.pt")
    eval_parser.add_argument("--dataset",  required=True, help="Path folder dataset")

    # Command: predict
    pred_parser = subparsers.add_parser("predict", help="Prediksi satu gambar")
    pred_parser.add_argument("--weights",  required=True, help="Path ke best.pt")
    pred_parser.add_argument("--image",    required=True, help="Path ke gambar")
    pred_parser.add_argument("--conf",     default=0.5,   type=float, help="Confidence threshold")

    # Command: export
    exp_parser = subparsers.add_parser("export", help="Export model ke ONNX")
    exp_parser.add_argument("--weights",  required=True, help="Path ke best.pt")
    exp_parser.add_argument("--format",   default="onnx", choices=["onnx","torchscript"])

    # Command: validate-dataset
    val_parser = subparsers.add_parser("validate-dataset", help="Cek struktur dataset")
    val_parser.add_argument("--dataset", required=True, help="Path folder dataset")

    # Command: generate-yaml
    yaml_parser = subparsers.add_parser("generate-yaml", help="Buat data.yaml")
    yaml_parser.add_argument("--dataset", required=True, help="Path folder dataset")

    args = parser.parse_args()

    if args.command == "train":
        train_yolov8(
            dataset_dir=args.dataset,
            model_size=args.model,
            epochs=args.epochs,
            imgsz=args.imgsz,
            batch=args.batch,
        )
    elif args.command == "eval":
        evaluate_model(args.weights, args.dataset)
    elif args.command == "predict":
        predict_single_image(args.weights, args.image, args.conf)
    elif args.command == "export":
        export_model(args.weights, args.format)
    elif args.command == "validate-dataset":
        validate_dataset_structure(args.dataset)
    elif args.command == "generate-yaml":
        output = os.path.join(args.dataset, "data.yaml")
        generate_data_yaml(args.dataset, output)
    else:
        print("SnapEats - YOLOv8 Food Detection Script")
        print("Kelompok King Em Yu | Mirsad Alganawi Azma")
        print()
        print("Contoh penggunaan:")
        print("  # Validasi dataset:")
        print("  python train_model.py validate-dataset --dataset ./dataset")
        print()
        print("  # Generate data.yaml:")
        print("  python train_model.py generate-yaml --dataset ./dataset")
        print()
        print("  # Training (model nano, 50 epoch):")
        print("  python train_model.py train --dataset ./dataset --model n --epochs 50")
        print()
        print("  # Evaluasi:")
        print("  python train_model.py eval --weights runs/best.pt --dataset ./dataset")
        print()
        print("  # Prediksi satu gambar:")
        print("  python train_model.py predict --weights runs/best.pt --image makanan.jpg")
        print()
        print("  # Export ke ONNX (untuk Azure deployment):")
        print("  python train_model.py export --weights runs/best.pt --format onnx")
        print()
        print("Instalasi dependencies:")
        print("  pip install ultralytics pyyaml")