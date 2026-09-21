/**
 * scripts/upload-to-cloudinary.mjs
 * ─────────────────────────────────
 * High-performance upload script with automatic on-the-fly image compression.
 * Compresses oversized raw images (e.g. 22MB camera RAW/JPEGs) to optimized web-ready 
 * assets (~400KB-800KB @ 2400px width) before sending to Cloudinary, ensuring fast, 
 * error-free uploads without hitting Cloudinary free-tier file size limits.
 *
 * Usage:
 *   node scripts/upload-to-cloudinary.mjs
 */

import { v2 as cloudinary } from 'cloudinary'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { join, extname } from 'path'
import sharp from 'sharp'

// ── Auto-load .env if not in process.env ─────────────────────────────────────
function loadEnv() {
  const envPath = join(process.cwd(), '.env')
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf8').split(/\r?\n/)
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}

loadEnv()

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('❌  Missing Cloudinary credentials. Ensure .env has NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
  process.exit(1)
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
})

// ── Upload queue: [localPath, cloudinaryPublicId] ───────────────────────────
const PUBLIC = join(process.cwd(), 'public')
const GALLERY = join(PUBLIC, 'gallery')

function buildGalleryUploads() {
  if (!existsSync(GALLERY)) return []
  return readdirSync(GALLERY)
    .filter(f => ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(f).toLowerCase()))
    .map(f => {
      // Strip all extensions: "DSC00753.JPG.jpeg" → "DSC00753"
      const stem = f.replace(/(\.[^.]+)+$/, '')
      return [join(GALLERY, f), `roborashtra/gallery/${stem}`]
    })
}

const TEAM = join(PUBLIC, 'team')

function buildTeamUploads() {
  if (!existsSync(TEAM)) return []
  const results = []
  const squads = readdirSync(TEAM, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  for (const squad of squads) {
    const squadDir = join(TEAM, squad)
    const files = readdirSync(squadDir)
      .filter(f => ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(f).toLowerCase()))
    for (const f of files) {
      const stem = f.replace(/(\.[^.]+)+$/, '')
      results.push([join(squadDir, f), `roborashtra/team/${squad}/${stem}`])
    }
  }
  return results
}

const uploads = [...buildGalleryUploads(), ...buildTeamUploads()]

if (uploads.length === 0) {
  console.log('⚠️  No local images found in /public/gallery or /public/team.')
  process.exit(0)
}

console.log(`\n🚀 Starting Compressed Cloudinary Upload — ${uploads.length} assets`)
console.log(`   Target Cloud: ${CLOUD_NAME}`)
console.log(`   Optimization: Resize max 2400px, 85% high-quality JPEG compression\n`)

// Upload a buffer via Cloudinary stream
function uploadBuffer(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    stream.end(buffer)
  })
}

let done = 0
let failed = 0

for (let i = 0; i < uploads.length; i++) {
  const [localPath, publicId] = uploads[i]
  const label = publicId.replace('roborashtra/', '')
  process.stdout.write(`  [${i + 1}/${uploads.length}] ${label} … `)

  try {
    // Compress and resize image in-memory using Sharp
    const compressedBuffer = await sharp(localPath)
      .rotate() // Auto-orient based on EXIF
      .resize({
        width: 2400,
        height: 2400,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        mozjpeg: true,
      })
      .toBuffer()

    const rawSizeMb = (readFileSync(localPath).length / (1024 * 1024)).toFixed(1)
    const compSizeKb = Math.round(compressedBuffer.length / 1024)

    const result = await uploadBuffer(compressedBuffer, publicId)
    console.log(`✓  (${rawSizeMb} MB → ${compSizeKb} KB compressed → Cloudinary: ${result.bytes ? Math.round(result.bytes / 1024) + ' KB' : 'OK'})`)
    done++
  } catch (err) {
    const errMsg = err?.message || JSON.stringify(err) || err
    console.log(`✗  FAILED: ${errMsg}`)
    failed++
  }
}

console.log(`\n${'─'.repeat(60)}`)
console.log(`✅ Upload complete: ${done} succeeded   ${failed > 0 ? `❌ ${failed} failed` : ''}`)
console.log(`${'─'.repeat(60)}\n`)

if (failed > 0) {
  process.exit(1)
}
