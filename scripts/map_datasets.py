import json
import re

def clean_value(val_str):
    if val_str is None:
        return 0.0
    if isinstance(val_str, (int, float)):
        return float(val_str)
    
    val_str = str(val_str).replace(',', '')
    match = re.search(r'([\d.]+)', val_str)
    if match:
        return float(match.group(1))
    return 0.0

def load_data(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return [item for item in data if item is not None and "Nama" in item]

def main():
    names = [
        'Ayam Goreng', 'Bakso', 'Bubur Ayam', 'Cakwe', 'Dadar Gulung', 
        'Ikan Goreng', 'Klepon', 'Lontong Sayur', 'Martabak Manis', 'Mie Goreng', 
        'Nasi Padang', 'Rendang', 'Risol', 'Rujak', 'Rujak Buah', 'Sayur Asem', 
        'Soto Ayam', 'Nasi Goreng', 'Pecel Lele', 'Rawon', 'Sate'
    ]

    keywords_map = {
        'Bubur Ayam': ['bubur ayam'],
        'Cakwe': ['cakwe', 'cakue'],
        'Dadar Gulung': ['dadar gulung'],
        'Ikan Goreng': ['ikan', 'goreng'],
        'Klepon': ['klepon'],
        'Lontong Sayur': ['lontong', 'sayur'],
        'Martabak Manis': ['martabak manis', 'martabak terang bulan'],
        'Mie Goreng': ['mi goreng', 'mie goreng'],
        'Nasi Padang': ['nasi padang'],
        'Rendang': ['rendang'],
        'Risol': ['risol', 'kroket'], 
        'Rujak': ['rujak'],
        'Rujak Buah': ['rujak', 'buah'],
        'Sayur Asem': ['sayur asem', 'sayur asam'],
        'Soto Ayam': ['soto ayam'],
        'Nasi Goreng': ['nasi goreng'],
        'Pecel Lele': ['lele goreng', 'pecel lele'],
        'Rawon': ['rawon'],
        'Sate': ['sate'],
        'Ayam Goreng': ['ayam goreng'],
        'Bakso': ['bakso']
    }

    gizi_data = load_data('data/gizi.json')
    mapped_results = {}

    nutrients = [
        'Water', 'Energy', 'Protein', 'Fat', 'CHO', 'Fibre', 'ASH', 
        'Ca', 'P', 'Fe', 'Na', 'K', 'Cu', 'Zn', 'Vit. A', 'Carotenes', 
        'Re', 'Vit. B1', 'Vit. B2', 'Niacin', 'Vit. C'
    ]

    for cls in names:
        keywords = keywords_map.get(cls, [cls.lower()])
        matches = []
        for item in gizi_data:
            nama = item['Nama'].lower()
            
            match_found = False
            for kw in keywords:
                parts = kw.split(' ')
                if all(p in nama for p in parts):
                    match_found = True
                    break
            
            if match_found:
                matches.append(item)
        
        if not matches:
            first_word = cls.split(' ')[0].lower()
            for item in gizi_data:
                if first_word in item['Nama'].lower():
                    matches.append(item)
                    if len(matches) > 10:  # Limit fallback matches
                        break

        agg = { "nama_kelas": cls, "ukuran_porsi": "100 g", "Matched_Count": len(matches) }
        for nut in nutrients:
            agg[nut] = 0.0

        if matches:
            for m in matches:
                for nut in nutrients:
                    agg[nut] += clean_value(m.get(nut, "0"))
                
            for nut in nutrients:
                agg[nut] = round(agg[nut] / len(matches), 2)
            
            agg["Sample_Names"] = [m["Nama"] for m in matches[:3]]
        else:
            agg["Sample_Names"] = []

        mapped_results[cls] = agg

    # Fallback to general known values for classes that completely failed matching
    manual_fill = {
         # We will inject manual estimation if matched count is 0 or low quality
        "Klepon": {"Energy": 215.0, "Protein": 2.1, "Fat": 3.5, "CHO": 44.0, "Water": 48.0, "Ca": 15, "P": 40, "Fe": 1.0, "Na": 100},
        "Cakwe": {"Energy": 286.0, "Protein": 6.8, "Fat": 13.9, "CHO": 34.2, "Water": 40.0, "Ca": 20, "P": 50, "Fe": 1.5, "Na": 300},
        "Risol": {"Energy": 240.0, "Protein": 4.0, "Fat": 12.0, "CHO": 29.0, "Water": 50.0, "Ca": 25, "P": 60, "Fe": 1.2, "Na": 250},
        "Pecel Lele": {"Energy": 220.0, "Protein": 16.0, "Fat": 15.0, "CHO": 4.0, "Water": 60.0, "Ca": 150, "P": 200, "Fe": 2.0, "Na": 300}
    }

    for cls, manual_data in manual_fill.items():
        if mapped_results[cls]["Matched_Count"] == 0:
            for nut, val in manual_data.items():
                mapped_results[cls][nut] = val

    out_file = 'data/nutrition_mapping.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(mapped_results, f, indent=4)
        
    print(f"Final complete mapping format saved to {out_file}")

if __name__ == "__main__":
    main()