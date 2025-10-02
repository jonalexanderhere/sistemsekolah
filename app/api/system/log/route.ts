import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const {
      action,
      description,
      entity_type,
      entity_id,
      old_values,
      new_values,
      ip_address,
      user_agent,
      user_id
    } = await request.json();

    // Get real IP address from headers
    const realIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   ip_address || 
                   'unknown';

    // Insert system log
    const { data, error } = await supabaseAdmin
      .from('system_logs')
      .insert({
        user_id: user_id || null,
        action,
        entity_type: entity_type || 'system',
        entity_id: entity_id || null,
        description,
        old_values: old_values || null,
        new_values: new_values || null,
        ip_address: realIP,
        user_agent: user_agent || request.headers.get('user-agent'),
        request_id: crypto.randomUUID(),
        session_id: request.headers.get('x-session-id') || null,
        status: 'success'
      })
      .select('id');

    if (error) {
      console.error('System log error:', error);
      return NextResponse.json(
        { error: 'Failed to log system activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      log_id: data && data.length > 0 ? (data[0] as any).id : null 
    });

  } catch (error) {
    console.error('System log API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action');
    const user_id = searchParams.get('user_id');
    const entity_type = searchParams.get('entity_type');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    let query = supabaseAdmin
      .from('system_logs')
      .select(`
        *,
        users:user_id (
          nama,
          role,
          nisn
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (action) {
      query = query.eq('action', action);
    }
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    if (entity_type) {
      query = query.eq('entity_type', entity_type);
    }
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: logs, error } = await query;

    if (error) {
      console.error('System logs fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch system logs' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('system_logs')
      .select('*', { count: 'exact', head: true });

    // Apply same filters for count
    if (action) countQuery = countQuery.eq('action', action);
    if (user_id) countQuery = countQuery.eq('user_id', user_id);
    if (entity_type) countQuery = countQuery.eq('entity_type', entity_type);
    if (start_date) countQuery = countQuery.gte('created_at', start_date);
    if (end_date) countQuery = countQuery.lte('created_at', end_date);

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('System logs count error:', countError);
    }

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('System logs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
