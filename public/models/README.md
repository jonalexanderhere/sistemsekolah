# Face Recognition Models

Folder ini berisi model-model untuk face recognition menggunakan face-api.js.

## Model yang Diperlukan

### 1. Tiny Face Detector (Utama)
- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`

### 2. Face Landmarks 68
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`

### 3. Face Recognition
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`
- `face_recognition_model-shard2`

## Download Models

### Otomatis (Recommended)
```bash
npm run download-models
```

### Manual Download
Jika script otomatis gagal, download manual dari:
- https://github.com/justadudewhohacks/face-api.js/tree/master/weights

### CDN Alternative
Jika file terlalu besar untuk hosting, gunakan CDN:

```javascript
// Update di lib/faceapi.ts
const modelPath = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
```

## File Size Info
- Total size: ~15MB
- Tiny detector: ~1.2MB
- Landmarks: ~350KB  
- Recognition: ~6.2MB

## Deployment Notes

### Vercel
- File >100MB tidak didukung
- Gunakan Git LFS atau CDN eksternal

### Netlify
- Limit 100MB per deploy
- Gunakan Large Media untuk file besar

### Self-hosted
- Upload langsung ke server
- Pastikan path `/models/` dapat diakses

## Troubleshooting

### Model tidak ter-load
1. Check file exists: `ls -la public/models/`
2. Check browser network tab
3. Verify CORS headers
4. Check file permissions

### Performance Issues
- Gunakan tiny_face_detector untuk speed
- Reduce input size di faceapi config
- Cache models di browser

### CORS Errors
- Pastikan models di-serve dari same origin
- Atau setup CORS headers untuk CDN

