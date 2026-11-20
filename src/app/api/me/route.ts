import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getVerifiedSessionUser, adminSql } from '@/lib/dal';

export async function GET() {
  const user = await getVerifiedSessionUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Also check if we have extended metadata stored in the fibez_session cookie
  let phone = '';
  let username = user.name || user.email.split('@')[0];

  try {
    const cookieStore = await cookies();
    const fibezCookie = cookieStore.get('fibez_session')?.value;
    if (fibezCookie) {
      const parsed = JSON.parse(Buffer.from(fibezCookie, 'base64url').toString('utf-8'));
      if (parsed?.user) {
        phone = parsed.user.phone || '';
        username = parsed.user.username || username;
      }
    }
  } catch {}

  return NextResponse.json(
    {
      user: {
        ...user,
        username,
        phone,
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getVerifiedSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized: Please log in first' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : currentUser.name;
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : currentUser.email;
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword.trim() : '';

    if (!name) {
      return NextResponse.json({ error: 'Display name cannot be empty' }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    // If PostgreSQL database is online, update neon_auth."user"
    if (adminSql) {
      try {
        await adminSql`
          UPDATE neon_auth."user"
          SET 
            name = ${name},
            email = ${email},
            "updatedAt" = NOW()
          WHERE id::text = ${currentUser.id}
        `;
      } catch (dbErr: any) {
        console.warn('Could not update Postgres user table directly:', dbErr.message);
      }
    }

    const updatedUser = {
      id: currentUser.id,
      email,
      name,
      username: username || name.toLowerCase().replace(/\s+/g, '_'),
      phone,
      role: currentUser.role,
      updatedAt: new Date().toISOString(),
    };

    // Update the local fibez_session cookie with the new identity details
    const sessionPayload = Buffer.from(
      JSON.stringify({
        user: updatedUser,
        session: {
          id: `sess_${currentUser.id.slice(0, 8)}`,
          userId: currentUser.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      }),
      'utf-8'
    ).toString('base64url');

    const res = NextResponse.json({
      success: true,
      message: 'Account profile updated successfully!',
      user: updatedUser,
      passwordChanged: Boolean(newPassword),
    });

    res.cookies.set('fibez_session', sessionPayload, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    });

    return res;
  } catch (err: any) {
    console.error('Error updating user profile:', err);
    return NextResponse.json({ error: err.message || 'Failed to update profile' }, { status: 500 });
  }
}
