import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const inDir = path.join(process.cwd(), 'public', 'gallery')
const outDir = path.join(inDir, 'optimized')

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

const files = fs.readdirSync(inDir).filter((f) => f.endsWith('.JPG.jpeg') || f.endsWith('.jpg') || f.endsWith('.jpeg'))
console.log(`Found ${files.length} gallery images to optimize...`)

async function run() {
  let totalIn = 0
  let totalOut = 0

  for (const file of files) {
    const stem = file.replace(/(\.[^.]+)+$/, '')
    const inPath = path.join(inDir, file)
    const outPath = path.join(outDir, `${stem}.webp`)
    const inStat = fs.statSync(inPath)
    totalIn += inStat.size

    await sharp(inPath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(outPath)

    const outStat = fs.statSync(outPath)
    totalOut += outStat.size
    console.log(`  ${stem}: ${(inStat.size / 1024 / 1024).toFixed(1)}MB -> ${(outStat.size / 1024).toFixed(0)}KB`)
  }

  console.log(`Optimization complete! Total: ${(totalIn / 1024 / 1024).toFixed(1)}MB -> ${(totalOut / 1024 / 1024).toFixed(2)}MB`)
}

run().catch(console.error)
