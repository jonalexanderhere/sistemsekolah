import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client component client
export const createSupabaseClient = () => createClientComponentClient()

// Server component client
export const createSupabaseServerClient = () => createServerComponentClient({ cookies })

// Admin client with service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types
export interface User {
  id: string
  role: 'siswa' | 'guru' | 'admin'
  nama: string
  nisn?: string
  identitas?: string
  external_auth_id?: string
  created_at: string
  face_embedding?: number[]
}

export interface Face {
  id: string
  user_id: string
  embedding: number[]
  created_at: string
}

export interface Attendance {
  id: string
  user_id: string
  tanggal: string
  waktu_masuk?: string
  waktu_keluar?: string
  status: 'hadir' | 'terlambat' | 'tidak_hadir' | 'izin' | 'sakit' | 'alpha' | 'dispensasi'
  method?: 'face_recognition' | 'manual' | 'card' | 'qr_code' | 'fingerprint'
  confidence_score?: number
  notes?: string
  created_at: string
}

export interface Exam {
  id: string
  judul: string
  deskripsi?: string
  tanggal_mulai: string
  tanggal_selesai: string
  durasi_menit: number
  dibuat_oleh: string
  created_at: string
}

export interface Question {
  id: string
  exam_id: string
  pertanyaan: string
  pilihan_a: string
  pilihan_b: string
  pilihan_c: string
  pilihan_d: string
  jawaban_benar: 'a' | 'b' | 'c' | 'd'
  nomor_urut: number
}

export interface Answer {
  id: string
  exam_id: string
  question_id: string
  user_id: string
  jawaban: 'a' | 'b' | 'c' | 'd'
  created_at: string
}

export interface Pengumuman {
  id: string
  judul: string
  isi: string
  dibuat_oleh: string
  tanggal: string
  created_at: string
}

