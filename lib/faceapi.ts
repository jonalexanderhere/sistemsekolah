import * as faceapi from 'face-api.js';

// Configuration for fast face detection
export const FACE_API_CONFIG = {
  // Use tiny face detector for speed
  detectionOptions: new faceapi.TinyFaceDetectorOptions({
    inputSize: 416, // Smaller input size for speed
    scoreThreshold: 0.5 // Lower threshold for better detection
  }),
  
  // Face matching threshold
  faceMatchThreshold: 0.6,
  
  // Maximum faces to process
  maxFaces: 1
};

let isModelsLoaded = false;

/**
 * Load face-api.js models
 */
export async function loadFaceApiModels(): Promise<boolean> {
  if (isModelsLoaded) {
    return true;
  }

  try {
    console.log('🤖 Loading face-api.js models...');
    
    const modelPath = '/models';
    
    // Load models in parallel for speed
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
      faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
      faceapi.nets.faceRecognitionNet.loadFromUri(modelPath)
    ]);
    
    isModelsLoaded = true;
    console.log('✅ Face-api.js models loaded successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error loading face-api.js models:', error);
    return false;
  }
}

/**
 * Detect faces in an image/video element
 */
export async function detectFaces(
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>[]> {
  if (!isModelsLoaded) {
    throw new Error('Face-api.js models not loaded');
  }

  try {
    const detections = await faceapi
      .detectAllFaces(input, FACE_API_CONFIG.detectionOptions)
      .withFaceLandmarks();
    
    return detections;
  } catch (error) {
    console.error('Error detecting faces:', error);
    return [];
  }
}

/**
 * Get face descriptor (embedding) from detected face
 */
export async function getFaceDescriptor(
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  detection?: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>
): Promise<Float32Array | null> {
  if (!isModelsLoaded) {
    throw new Error('Face-api.js models not loaded');
  }

  try {
    let faceDescriptor;
    
    if (detection) {
      // Use existing detection
      faceDescriptor = await faceapi.computeFaceDescriptor(input, detection);
    } else {
      // Detect and compute descriptor
      const result = await faceapi
        .detectSingleFace(input, FACE_API_CONFIG.detectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      faceDescriptor = result?.descriptor;
    }
    
    return faceDescriptor || null;
  } catch (error) {
    console.error('Error getting face descriptor:', error);
    return null;
  }
}

/**
 * Compare two face descriptors
 */
export function compareFaces(
  descriptor1: Float32Array | number[],
  descriptor2: Float32Array | number[]
): number {
  try {
    const desc1 = Array.isArray(descriptor1) ? new Float32Array(descriptor1) : descriptor1;
    const desc2 = Array.isArray(descriptor2) ? new Float32Array(descriptor2) : descriptor2;
    
    return faceapi.euclideanDistance(desc1, desc2);
  } catch (error) {
    console.error('Error comparing faces:', error);
    return 1; // Return max distance on error
  }
}

/**
 * Check if two faces match
 */
export function isFaceMatch(
  descriptor1: Float32Array | number[],
  descriptor2: Float32Array | number[],
  threshold: number = FACE_API_CONFIG.faceMatchThreshold
): boolean {
  const distance = compareFaces(descriptor1, descriptor2);
  return distance < threshold;
}

/**
 * Find best matching face from a list of known faces
 */
export function findBestFaceMatch(
  inputDescriptor: Float32Array | number[],
  knownFaces: Array<{ id: string; descriptor: Float32Array | number[]; label?: string }>,
  threshold: number = FACE_API_CONFIG.faceMatchThreshold
): { id: string; label?: string; distance: number } | null {
  let bestMatch = null;
  let bestDistance = threshold;

  for (const knownFace of knownFaces) {
    const distance = compareFaces(inputDescriptor, knownFace.descriptor);
    
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = {
        id: knownFace.id,
        label: knownFace.label,
        distance
      };
    }
  }

  return bestMatch;
}

/**
 * Draw face detection boxes on canvas
 */
export function drawFaceDetections(
  canvas: HTMLCanvasElement,
  detections: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>[],
  options: {
    drawBox?: boolean;
    drawLandmarks?: boolean;
    label?: string;
    color?: string;
  } = {}
): void {
  const {
    drawBox = true,
    drawLandmarks = false,
    label,
    color = '#00ff00'
  } = options;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear previous drawings
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  detections.forEach((detection) => {
    if (drawBox) {
      const box = detection.detection.box;
      
      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      
      // Draw label if provided
      if (label) {
        ctx.fillStyle = color;
        ctx.font = '16px Arial';
        ctx.fillText(label, box.x, box.y - 5);
      }
    }

    if (drawLandmarks) {
      // Draw face landmarks
      const landmarks = detection.landmarks;
      ctx.fillStyle = color;
      
      landmarks.positions.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  });
}

/**
 * Resize canvas to match video/image dimensions
 */
export function resizeCanvasToMatch(
  canvas: HTMLCanvasElement,
  source: HTMLVideoElement | HTMLImageElement
): void {
  const { videoWidth, videoHeight, width, height } = source as any;
  
  canvas.width = videoWidth || width || source.clientWidth;
  canvas.height = videoHeight || height || source.clientHeight;
  
  // Apply CSS dimensions to maintain aspect ratio
  canvas.style.width = source.clientWidth + 'px';
  canvas.style.height = source.clientHeight + 'px';
}

/**
 * Capture frame from video element
 */
export function captureVideoFrame(
  video: HTMLVideoElement,
  canvas?: HTMLCanvasElement
): HTMLCanvasElement {
  const captureCanvas = canvas || document.createElement('canvas');
  const ctx = captureCanvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  captureCanvas.width = video.videoWidth;
  captureCanvas.height = video.videoHeight;
  
  ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
  
  return captureCanvas;
}

/**
 * Convert canvas to blob for upload
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string = 'image/jpeg',
  quality: number = 0.8
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

/**
 * Validate face quality for registration
 */
export function validateFaceQuality(
  detection: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>
): { isValid: boolean; message: string } {
  const { detection: faceDetection } = detection;
  
  // Check face size (should be reasonable size)
  const faceArea = faceDetection.box.width * faceDetection.box.height;
  const minFaceArea = 50 * 50; // Minimum 50x50 pixels
  
  if (faceArea < minFaceArea) {
    return {
      isValid: false,
      message: 'Wajah terlalu kecil. Dekatkan wajah ke kamera.'
    };
  }
  
  // Check detection confidence
  if (faceDetection.score < 0.7) {
    return {
      isValid: false,
      message: 'Deteksi wajah kurang jelas. Pastikan pencahayaan cukup.'
    };
  }
  
  return {
    isValid: true,
    message: 'Kualitas wajah baik'
  };
}

