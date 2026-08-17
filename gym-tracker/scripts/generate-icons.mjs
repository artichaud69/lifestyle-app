// Renders the PWA icons as flat PNGs with zero image-library dependencies:
// a supersampled rounded-rect/circle rasterizer feeding a hand-built PNG
// encoder (zlib is the only thing borrowed from Node).
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '../public/icons')

const BG = [0x12, 0x13, 0x17, 255]
const ACCENT = [0xc6, 0xff, 0x3d, 255]

function roundedRectSDF(px, py, cx, cy, w, h, radius) {
  const qx = Math.abs(px - cx) - (w / 2 - radius)
  const qy = Math.abs(py - cy) - (h / 2 - radius)
  const outsideX = Math.max(qx, 0)
  const outsideY = Math.max(qy, 0)
  return Math.min(Math.max(qx, qy), 0) + Math.sqrt(outsideX * outsideX + outsideY * outsideY) - radius
}

// Dumbbell: a bar with a rounded plate at each end, drawn as an SDF union so
// the 4x supersample pass below can antialias the whole silhouette at once.
function dumbbellSDF(px, py, size, safeRatio) {
  const s = size * safeRatio
  const cx = size / 2
  const cy = size / 2
  const barW = s * 0.92
  const barH = s * 0.16
  const plateW = s * 0.22
  const plateH = s * 0.62
  const plateOffset = barW / 2 - plateW / 2

  const bar = roundedRectSDF(px, py, cx, cy, barW, barH, barH / 2)
  const plateL = roundedRectSDF(px, py, cx - plateOffset, cy, plateW, plateH, plateW * 0.35)
  const plateR = roundedRectSDF(px, py, cx + plateOffset, cy, plateW, plateH, plateW * 0.35)
  return Math.min(bar, plateL, plateR)
}

function render(size, { safeRatio }) {
  const SS = 4 // supersample factor for antialiasing
  const big = size * SS
  const pixels = new Uint8ClampedArray(size * size * 4)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let coverage = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = (x + (sx + 0.5) / SS)
          const py = (y + (sy + 0.5) / SS)
          const d = dumbbellSDF(px, py, size, safeRatio)
          if (d <= 0) coverage++
        }
      }
      const t = coverage / (SS * SS)
      const idx = (y * size + x) * 4
      for (let c = 0; c < 4; c++) {
        pixels[idx + c] = BG[c] * (1 - t) + ACCENT[c] * t
      }
    }
  }
  void big
  return pixels
}

function crc32(buf) {
  let c
  const table = crc32.table ?? (crc32.table = (() => {
    const t = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      t[n] = c
    }
    return t
  })())
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePNG(size, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1)
    raw[rowStart] = 0 // no filter
    for (let x = 0; x < size * 4; x++) {
      raw[rowStart + 1 + x] = rgba[y * size * 4 + x]
    }
  }
  const idatData = deflateSync(raw, { level: 9 })

  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idatData), chunk('IEND', Buffer.alloc(0))])
}

function writeIcon(name, size, options) {
  const pixels = render(size, options)
  const png = encodePNG(size, pixels)
  writeFileSync(path.join(OUT_DIR, name), png)
  console.log(`wrote ${name} (${size}x${size})`)
}

writeIcon('icon-192.png', 192, { safeRatio: 0.72 })
writeIcon('icon-512.png', 512, { safeRatio: 0.72 })
// Maskable icons get cropped to a shape by the OS, so the artwork has to
// live inside the inner ~80% "safe zone" or corners/edges get clipped off.
writeIcon('icon-maskable-512.png', 512, { safeRatio: 0.52 })
