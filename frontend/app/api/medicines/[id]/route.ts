import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || ''

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE || ''

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    )

    const { data, error } = await supabase
      .from('medicines')
      .select(`
        id,
        nama_obat,
        kategori,
        kandungan,
        kemasan,
        manfaat,
        dosis,
        efek_samping,
        deskripsi,
        harga,
        foto_url
      `)
      .eq('id', Number(params.id))
      .single()

    if (error) {
      console.error(error)

      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    let kategori_nama = '-'

    if (data?.kategori) {
      const { data: category } = await supabase
        .from('categories')
        .select('nama_kategori')
        .eq('id', data.kategori)
        .single()

      kategori_nama =
        category?.nama_kategori || '-'
    }

    return NextResponse.json({
      ...data,
      kategori_nama
    })

  } catch (err: any) {

    console.error(err)

    return NextResponse.json(
      {
        error: err.message || 'Server error'
      },
      {
        status: 500
      }
    )
  }
}