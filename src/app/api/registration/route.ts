import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { calculateMatchScore, MATCH_THRESHOLD, getEmailDomain } from '@/lib/tenant-matching';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      companyName, address, phoneNumber, 
      contactName, contactNameKana, email, password,
      ...serviceMetadata 
    } = body;

    // 必須チェック
    if (!companyName || !address || !phoneNumber || !contactName || !email || !password) {
      return new Response(JSON.stringify({ error: '必須項目が不足しています' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 全テナントを取得してスコアリング
    const allTenants = await prisma.tenant.findMany({
      include: { 
        users: { select: { email: true } },
        _count: { select: { users: true } } 
      }
    });

    let bestMatch = null;
    let highestScore = 0;

    for (const tenant of allTenants) {
      // 既存ユーザーのドメインを収集
      const tenantDomains = Array.from(new Set(
        tenant.users.map(u => getEmailDomain(u.email)).filter(Boolean)
      ));

      const score = calculateMatchScore(
        { name: companyName, address, phoneNumber, email },
        { 
          name: tenant.name, 
          address: tenant.address, 
          phoneNumber: tenant.phoneNumber,
          domains: tenantDomains
        }
      );

      if (score >= MATCH_THRESHOLD && score > highestScore) {
        highestScore = score;
        bestMatch = tenant;
      }
    }

    if (!bestMatch) {
      return new Response(JSON.stringify({ 
        error: '入力された情報に一致する会社が見つかりませんでした。入力内容をご確認いただくか、管理者へお問い合わせください。' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const tenant = bestMatch;
    if (tenant._count.users >= tenant.userLimit) {
      return new Response(JSON.stringify({ error: 'テナントのユーザー上限数を超過しているため登録できません' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'このメールアドレスは既に登録されています' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // トランザクションでユーザー作成
    const newUser = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        role: 'GENERAL_USER', // 新規登録者は一般ユーザーとして作成
        contactName,
        email,
        passwordHash,
        registrationMetadata: serviceMetadata,
        isActive: true,
      }
    });

    return new Response(JSON.stringify({ success: true, user: { id: newUser.id, email: newUser.email } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'サーバーエラーが発生しました' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
