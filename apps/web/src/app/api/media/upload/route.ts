import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFingerprint } from '@/lib/fingerprint'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_BYTES || '52428800', 10) // 50MB
const MAX_MEDIA_PER_POST = parseInt(process.env.MAX_MEDIA_PER_POST || '5', 10)
const IMAGE_QUALITY = parseInt(process.env.IMAGE_QUALITY || '80', 10)
const IMAGE_MAX_WIDTH = parseInt(process.env.IMAGE_MAX_WIDTH || '1920', 10)
const IMAGE_MAX_HEIGHT = parseInt(process.env.IMAGE_MAX_HEIGHT || '1080', 10)
const VIDEO_BITRATE = process.env.VIDEO_BITRATE || '1000k'
const VIDEO_MAX_WIDTH = parseInt(process.env.VIDEO_MAX_WIDTH || '1280', 10)
const VIDEO_MAX_HEIGHT = parseInt(process.env.VIDEO_MAX_HEIGHT || '720', 10)

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']

// POST /api/media/upload - Upload and process media
export async function POST(request: NextRequest) {
  const fingerprint = await getFingerprint()

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
      { status: 400 }
    )
  }

  // Determine media type
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, MP4, WebM' },
      { status: 400 }
    )
  }

  const mediaType = isImage ? 'image' : 'video'
  const tempDir = '/tmp/icemap-uploads'
  const fileId = randomUUID()
  const inputExt = file.name.split('.').pop() || (isImage ? 'jpg' : 'mp4')
  const outputExt = isImage ? 'jpg' : 'mp4'
  const inputPath = join(tempDir, `${fileId}-input.${inputExt}`)
  const outputPath = join(tempDir, `${fileId}-output.${outputExt}`)

  try {
    // Ensure temp directory exists
    await mkdir(tempDir, { recursive: true })

    // Write uploaded file to temp
    const bytes = await file.arrayBuffer()
    await writeFile(inputPath, Buffer.from(bytes))

    // Process the file
    if (isImage) {
      await processImage(inputPath, outputPath)
    } else {
      await processVideo(inputPath, outputPath)
    }

    // Read processed file
    const { readFile } = await import('fs/promises')
    const processedData = await readFile(outputPath)

    // Upload to Supabase Storage
    const storagePath = `uploads/${fileId}.${outputExt}`
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(storagePath, processedData, {
        contentType: isImage ? 'image/jpeg' : 'video/mp4',
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Create media record (without post_id - will be linked when post is created)
    const { data: media, error: dbError } = await supabase
      .from('media')
      .insert({
        storage_path: storagePath,
        media_type: mediaType,
        original_filename: file.name,
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Error creating media record:', dbError)
      return NextResponse.json({ error: 'Failed to save media record' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(storagePath)

    return NextResponse.json(
      {
        id: media.id,
        url: urlData.publicUrl,
        media_type: mediaType,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing media:', error)
    return NextResponse.json({ error: 'Failed to process media' }, { status: 500 })
  } finally {
    // Clean up temp files
    try {
      await unlink(inputPath).catch(() => {})
      await unlink(outputPath).catch(() => {})
    } catch {
      // Ignore cleanup errors
    }
  }
}

async function processImage(inputPath: string, outputPath: string) {
  // Use ImageMagick to convert and resize
  const cmd = `convert "${inputPath}" -resize ${IMAGE_MAX_WIDTH}x${IMAGE_MAX_HEIGHT}\\> -quality ${IMAGE_QUALITY} -strip "${outputPath}"`
  await execAsync(cmd)
}

async function processVideo(inputPath: string, outputPath: string) {
  // Use FFmpeg to convert and resize
  const cmd = `ffmpeg -i "${inputPath}" -c:v libx264 -preset fast -crf 23 -b:v ${VIDEO_BITRATE} -vf "scale='min(${VIDEO_MAX_WIDTH},iw)':min'(${VIDEO_MAX_HEIGHT},ih)':force_original_aspect_ratio=decrease" -c:a aac -b:a 128k -movflags +faststart -y "${outputPath}"`
  await execAsync(cmd, { timeout: 300000 }) // 5 minute timeout for video processing
}
