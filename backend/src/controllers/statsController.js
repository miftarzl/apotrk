const supabase = require('../config/supabase')

async function stats(req, res) {
  try {
    // ============================================================
    // MASTER DATA STATS
    // ============================================================
    const medsRes = await supabase.from('medicines').select('*', { head: true, count: 'exact' })
    const catsRes = await supabase.from('categories').select('*', { head: true, count: 'exact' })
    const usersRes = await supabase.from('users').select('*', { head: true, count: 'exact' })
    const adminsRes = await supabase.from('profiles').select('*', { head: true, count: 'exact' }).eq('role', 'admin')

    // Total stock aggregation
    let totalStock = 0
    try {
      const totalStockRes = await supabase.from('medicines').select('sum(stock)')
      if (totalStockRes && Array.isArray(totalStockRes.data) && totalStockRes.data[0]) {
        totalStock = Number(totalStockRes.data[0].sum || 0)
      } else {
        const { data: medsList, error: medsListErr } = await supabase.from('medicines').select('stock')
        if (!medsListErr && Array.isArray(medsList)) {
          totalStock = (medsList || []).reduce((acc, item) => acc + Number(item.stock || 0), 0)
        }
      }
    } catch (err) {
      console.error('totalStock aggregation failed, falling back', err)
      try {
        const { data: medsList, error: medsListErr } = await supabase.from('medicines').select('stock')
        if (!medsListErr && Array.isArray(medsList)) {
          totalStock = (medsList || []).reduce((acc, item) => acc + Number(item.stock || 0), 0)
        }
      } catch (e) {
        console.error('fallback fetch stocks failed', e)
        totalStock = 0
      }
    }

    // ============================================================
    // STOCK MANAGEMENT STATS
    // ============================================================
    const availableRes = await supabase.from('medicines').select('*', { head: true, count: 'exact' }).gt('stock', 10)
    const lowRes = await supabase.from('medicines').select('*', { head: true, count: 'exact' }).gte('stock', 1).lte('stock', 10)
    const outRes = await supabase.from('medicines').select('*', { head: true, count: 'exact' }).eq('stock', 0)

    // ============================================================
    // ORDER STATS (Ringkasan Penjualan & Status Pesanan)
    // ============================================================
    // Total revenue (paid orders only)
    const revenueRes = await supabase
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'paid')

    let totalRevenue = 0
    if (revenueRes.data && Array.isArray(revenueRes.data)) {
      totalRevenue = revenueRes.data.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
    }

    // Total orders count
    const totalOrdersRes = await supabase.from('orders').select('*', { head: true, count: 'exact' })

    // Orders by status
    const orderStatusRes = await supabase.from('orders').select('order_status')
    const orderStatusCounts = {
      'Menunggu Pembayaran': 0,
      'Lunas': 0,
      'Diproses': 0,
      'Dikirim': 0,
      'Selesai': 0,
      'Dibatalkan': 0
    }
    if (orderStatusRes.data && Array.isArray(orderStatusRes.data)) {
      orderStatusRes.data.forEach(order => {
        const status = order.order_status || 'Unknown'
        if (orderStatusCounts[status] !== undefined) {
          orderStatusCounts[status]++
        }
      })
    }

    // ============================================================
    // PRESCRIPTION STATS (Resep Dokter)
    // ============================================================
    const prescriptionsRes = await supabase.from('prescriptions').select('status')
    const prescriptionStatusCounts = {
      'Menunggu Verifikasi': 0,
      'Diproses': 0,
      'Siap Dibeli': 0,
      'Ditolak': 0
    }
    if (prescriptionsRes.data && Array.isArray(prescriptionsRes.data)) {
      prescriptionsRes.data.forEach(presc => {
        const status = presc.status || 'Unknown'
        if (prescriptionStatusCounts[status] !== undefined) {
          prescriptionStatusCounts[status]++
        }
      })
    }

    console.log({
      'Master Data': {
        totalMedicines: Number(medsRes.count || 0),
        totalCategories: Number(catsRes.count || 0),
        totalUsers: Number(usersRes.count || 0),
        totalAdmins: Number(adminsRes.count || 0)
      },
      'Stock Management': {
        totalStock,
        medsAvailable: Number(availableRes.count || 0),
        medsLowStock: Number(lowRes.count || 0),
        medsOut: Number(outRes.count || 0)
      },
      'Orders': {
        totalRevenue,
        totalOrders: Number(totalOrdersRes.count || 0),
        orderStatusCounts
      },
      'Prescriptions': prescriptionStatusCounts
    })

    return res.json({
      // Master Data
      totalMedicines: Number(medsRes.count || 0),
      totalCategories: Number(catsRes.count || 0),
      totalUsers: Number(usersRes.count || 0),
      totalAdmins: Number(adminsRes.count || 0),

      // Stock Management
      totalStock,
      medsAvailable: Number(availableRes.count || 0),
      medsLowStock: Number(lowRes.count || 0),
      medsOut: Number(outRes.count || 0),

      // Ringkasan Penjualan (Sales Summary)
      totalRevenue,
      totalOrders: Number(totalOrdersRes.count || 0),
      
      // Status Pesanan (Order Status)
      orderStatusCounts,

      // Resep Dokter (Prescriptions)
      prescriptionStatusCounts
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { stats }
