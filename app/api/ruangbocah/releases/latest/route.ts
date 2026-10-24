import { NextResponse } from 'next/server'

import {
  RUANG_BOCAH_ANDROID_32_DOWNLOAD_URL,
  RUANG_BOCAH_ANDROID_32_SHA256,
  RUANG_BOCAH_ANDROID_DOWNLOAD_URL,
  RUANG_BOCAH_ANDROID_SHA256,
  RUANG_BOCAH_VERSION,
} from '@/lib/ruangbocah/downloads'

export async function GET() {
  return NextResponse.json(
    {
      version: RUANG_BOCAH_VERSION,
      android_arm64_url: RUANG_BOCAH_ANDROID_DOWNLOAD_URL,
      android_armv7_url: RUANG_BOCAH_ANDROID_32_DOWNLOAD_URL,
      android_arm64_sha256: RUANG_BOCAH_ANDROID_SHA256,
      android_armv7_sha256: RUANG_BOCAH_ANDROID_32_SHA256,
      release_notes:
        'CRUD lengkap untuk pertumbuhan, milestone, imunisasi, nutrisi, dan pola tidur, serta update langsung dari aplikasi.',
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    },
  )
}
