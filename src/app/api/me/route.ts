import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getVerifiedSessionUser, adminSql } from '@/lib/dal';

// Display-only profile extras (username / phone). NEVER used for authentication or roles.
const PROFILE_COOKIE = 'fibez_profile';

function readProfileExtras(raw: string | undefined): { username?: string; phone?: string } {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf-8'));
    return {
      username: typeof parsed?.username === 'string' ? parsed.username.slice(0, 60) : undefined,
      phone: typeof parsed?.phone === 'string' ? parsed.phone.slice(0, 40) : undefined,
    };
  } catch {
    return {};
  }
}

export async function GET() {
  const user = await getVerifiedSessionUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const cookieStore = await cookies();
  const extras = readProfileExtras(cookieStore.get(PROFILE_COOKIE)?.value);

  return NextResponse.json(
    {
      user: {
        ...user,
        username: extras.username || user.name || user.email.split('@')[0],
        phone: extras.phone || '',
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
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : currentUser.name;
    const username = typeof body.username === 'string' ? body.username.trim().slice(0, 60) : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 40) : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword.trim() : '';

    if (!name) {
      return NextResponse.json({ error: 'Display name cannot be empty' }, { status: 400 });
    }

    // Email is the key that links orders and vault items to an account, so it must never be
    // changed here without verification (it would let a user claim someone else's orders).
    const email = currentUser.email;

    if (adminSql) {
      try {
        await adminSql`
          UPDATE neon_auth."user"
          SET name = ${name}, "updatedAt" = NOW()
          WHERE id::text = ${currentUser.id}
        `;
      } catch (dbErr: any) {
        console.warn('Could not update Postgres user table directly:', dbErr.message);
      }
    }

    const finalUsername = username || name.toLowerCase().replace(/\s+/g, '_');

    const updatedUser = {
      id: currentUser.id,
      email,
      name,
      username: finalUsername,
      phone,
      role: currentUser.role,
      updatedAt: new Date().toISOString(),
    };

    const res = NextResponse.json({
      success: true,
      message: 'Account profile updated successfully!',
      user: updatedUser,
      passwordChanged: false,
      ...(newPassword
        ? { note: 'Use the "Forgot password" flow to change your password.' }
        : {}),
    });

    res.cookies.set(
      PROFILE_COOKIE,
      Buffer.from(JSON.stringify({ username: finalUsername, phone }), 'utf-8').toString('base64url'),
      {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      }
    );

    return res;
  } catch (err: any) {
    console.error('Error updating user profile:', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
