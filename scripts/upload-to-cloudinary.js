/**
 * scripts/upload-to-cloudinary.js
 * ─────────────────────────────────
 * One-shot script to upload all local Gallery and Team images to Cloudinary.
 * Run once with: node scripts/upload-to-cloudinary.js
 *
 * Reads credentials directly from .env (no dotenv needed — uses process.env overrides at top).
 */

import { v2 as cloudinary } from 'cloudinary'
import { existsSync, readdirSync } from 'fs'
import { join, extname } from 'path'

// ── Credentials (read from .env set by shell, or hardcoded for this one-time run) ──
const CLOUD_NAME   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const API_KEY      = process.env.CLOUDINARY_API_KEY
const API_SECRET   = process.env.CLOUDINARY_API_SECRET

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('❌  Missing Cloudinary credentials. Make sure your .env is set correctly.')
  process.exit(1)
}

cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET, secure: true })

// ── Upload queue: [localPath, cloudinaryPublicId] ──────────────────────────────────

const PUBLIC   = join(process.cwd(), 'public')
const GALLERY  = join(PUBLIC, 'gallery')

// Auto-detect all gallery images
function buildGalleryUploads() {
  if (!existsSync(GALLERY)) return []
  return readdirSync(GALLERY)
    .filter(f => ['.jpg','.jpeg','.png','.webp'].includes(extname(f).toLowerCase()))
    .map(f => {
      // Strip extension(s): "DSC00753.JPG.jpeg" → "DSC00753"
      const stem = f.replace(/(\.[^.]+)+$/, '')
      return [join(GALLERY, f), `roborashtra/gallery/${stem}`]
    })
}

// Team portraits (all local files under /public/team/)
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
      .filter(f => ['.jpg','.jpeg','.png','.webp'].includes(extname(f).toLowerCase()))
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

console.log(`\n🚀 Starting Cloudinary upload — ${uploads.length} images\n`)
console.log(`   Cloud: ${CLOUD_NAME}\n`)

// ── Sequential upload with progress ───────────────────────────────────────────────
let done = 0
let failed = 0

for (const [localPath, publicId] of uploads) {
  const label = publicId.replace('roborashtra/', '')
  process.stdout.write(`  [${done + 1}/${uploads.length}] ${label} … `)

  try {
    const result = await cloudinary.uploader.upload(localPath, {
      public_id: publicId,
      overwrite: false,        // Skip if already uploaded
      resource_type: 'image',
      transformation: [],      // Upload originals; transformations happen at delivery
    })
    console.log(`✓  (${Math.round(result.bytes / 1024)} KB → ${result.format.toUpperCase()})`)
    done++
  } catch (err) {
    // If overwrite=false and image already exists, Cloudinary returns a 400
    if (err?.http_code === 400 || err?.message?.includes('already exists')) {
      console.log(`⏭  (already uploaded, skipped)`)
      done++
    } else {
      console.log(`✗  FAILED: ${err?.message || err}`)
      failed++
    }
  }
}

console.log(`\n${'─'.repeat(55)}`)
console.log(`✅  Done: ${done} uploaded / skipped   ❌ Failed: ${failed}`)
console.log(`${'─'.repeat(55)}\n`)

if (failed > 0) {
  console.log('Re-run the script to retry failed uploads.\n')
  process.exit(1)
}
