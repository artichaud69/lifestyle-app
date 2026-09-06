// Progress photos live in IndexedDB rather than localStorage's JSON blob —
// a few dozen photos would blow past localStorage's ~5-10MB quota fast, and
// IndexedDB stores binary Blobs natively with no base64 inflation. This file
// is browser-API-only (IndexedDB, Image, canvas), so unlike the pure lib/*
// modules it has no unit tests — same as storage.js's localStorage wrapper —
// and is verified in the browser instead.
const DB_NAME = 'gym-tracker-photos'
const DB_VERSION = 1
const STORE = 'photos'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function addPhoto(photo) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(photo)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Sorted oldest-to-newest to match the sortByDate convention used across
// the other progress trackers (bodyweight, measurements).
export async function listPhotos() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result.sort((a, b) => new Date(a.date) - new Date(b.date)))
    req.onerror = () => reject(req.error)
  })
}

export async function deletePhoto(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Downscales and re-encodes a picked/captured photo before it ever reaches
// IndexedDB — a phone camera photo can be several MB, and none of that
// extra resolution helps a small before/after comparison view.
export function compressImage(file, maxDim = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (blob) resolve(blob)
          else reject(new Error('Image compression failed'))
        },
        'image/jpeg',
        quality,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not load the selected image'))
    }
    img.src = url
  })
}
