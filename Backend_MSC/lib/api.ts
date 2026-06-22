import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create Supabase service client for admin operations
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'admin' } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password và tên là bắt buộc' },
        { status: 400 }
      )
    }

    console.log('Creating admin user:', { email, name, role })

    // Tạo user trong auth.users với service role theo đúng hướng dẫn
    const { data: authUser, error: authError } = await supabaseServiceRole.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Tự động confirm email
      app_metadata: { role: role }, // 👈 gán role ở app_metadata như hướng dẫn
      user_metadata: { full_name: name }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: `Lỗi tạo tài khoản: ${authError.message}` },
        { status: 400 }
      )
    }

    console.log('Auth user created:', authUser.user.id)

    // Tạo profile trong profiles table (chỉ sử dụng cột tối thiểu)
    const { data: profile, error: profileError } = await supabaseServiceRole
      .from('profiles')
      .insert({
        id: authUser.user.id,
        full_name: name,
        role: role
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating profile:', profileError)
      
      // Nếu tạo profile thất bại, xóa auth user
      await supabaseServiceRole.auth.admin.deleteUser(authUser.user.id)
      
      return NextResponse.json(
        { error: `Lỗi tạo profile: ${profileError.message}` },
        { status: 400 }
      )
    }

    console.log('Profile created:', profile)

    return NextResponse.json({
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        name: name,
        role: role,
        created_at: authUser.user.created_at
      }
    })

  } catch (error) {
    console.error('Error in create-user API:', error)
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    )
  }
}