/**
 * SQLite → PostgreSQL データ移行スクリプト
 *
 * 使い方:
 *   1. .env の DATABASE_URL を Neon の PostgreSQL URL に変更
 *   2. npx prisma db push   (スキーマをNeonに適用)
 *   3. npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/migrate-data.ts
 */

import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';
import path from 'path';

// SQLiteファイルのパス（ローカルのdev.db）
const SQLITE_PATH = path.join(process.cwd(), 'prisma', 'dev.db');

const sqlite = new Database(SQLITE_PATH, { readonly: true });
const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 データ移行を開始します...\n');

  // ============================================================
  // 1. Tenant
  // ============================================================
  const tenants = sqlite.prepare('SELECT * FROM Tenant').all() as any[];
  console.log(`📦 テナント: ${tenants.length}件`);
  for (const t of tenants) {
    await prisma.tenant.upsert({
      where: { id: t.id },
      create: {
        id: t.id,
        name: t.name,
        userLimit: t.userLimit,
        maintenanceId: t.maintenanceId ?? null,
        startMonth: t.startMonth ?? null,
        startYear: t.startYear ?? null,
        paymentMethod: t.paymentMethod ?? null,
        remarks: t.remarks ?? null,
        isActive: t.isActive === 1 || t.isActive === true,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      },
      update: {},
    });
  }

  // ============================================================
  // 2. PreIssuedId
  // ============================================================
  const preIssuedIds = sqlite.prepare('SELECT * FROM PreIssuedId').all() as any[];
  console.log(`🔑 事前発行ID: ${preIssuedIds.length}件`);
  for (const p of preIssuedIds) {
    await prisma.preIssuedId.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        tenantId: p.tenantId,
        issuedId: p.issuedId,
        isUsed: p.isUsed === 1 || p.isUsed === true,
        createdAt: new Date(p.createdAt),
      },
      update: {},
    });
  }

  // ============================================================
  // 3. User
  // ============================================================
  const users = sqlite.prepare('SELECT * FROM User').all() as any[];
  console.log(`👤 ユーザー: ${users.length}件`);
  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      create: {
        id: u.id,
        tenantId: u.tenantId,
        role: u.role,
        address: u.address ?? null,
        companyName: u.companyName ?? null,
        contactName: u.contactName,
        phoneNumber: u.phoneNumber ?? null,
        email: u.email,
        avatarUrl: u.avatarUrl ?? null,
        preIssuedId: u.preIssuedId ?? null,
        passwordHash: u.passwordHash,
        isActive: u.isActive === 1 || u.isActive === true,
        department: u.department ?? null,
        postcode: u.postcode ?? null,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
      },
      update: {},
    });
  }

  // ============================================================
  // 4. Service
  // ============================================================
  const services = sqlite.prepare('SELECT * FROM Service').all() as any[];
  console.log(`🔗 サービス: ${services.length}件`);
  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        name: s.name,
        url: s.url ?? null,
        iconName: s.iconName ?? null,
        groupLabel: s.groupLabel ?? null,
        sortOrder: s.sortOrder ?? 0,
        description: s.description ?? null,
        isActive: s.isActive === 1 || s.isActive === true,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      },
      update: {},
    });
  }

  // ============================================================
  // 5. ServiceVariant
  // ============================================================
  const variants = sqlite.prepare('SELECT * FROM ServiceVariant').all() as any[];
  console.log(`🔀 サービスバリアント: ${variants.length}件`);
  for (const v of variants) {
    await prisma.serviceVariant.upsert({
      where: { id: v.id },
      create: {
        id: v.id,
        serviceId: v.serviceId,
        label: v.label,
        url: v.url,
        sortOrder: v.sortOrder ?? 0,
        createdAt: new Date(v.createdAt),
        updatedAt: new Date(v.updatedAt),
      },
      update: {},
    });
  }

  // ============================================================
  // 6. TenantCredential
  // ============================================================
  const tenantCreds = sqlite.prepare('SELECT * FROM TenantCredential').all() as any[];
  console.log(`🔐 テナント認証情報: ${tenantCreds.length}件`);
  for (const c of tenantCreds) {
    await prisma.tenantCredential.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        tenantId: c.tenantId,
        serviceId: c.serviceId,
        loginId: c.loginId,
        password: c.password ?? null,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      },
      update: {},
    });
  }

  // ============================================================
  // 7. UserCredential
  // ============================================================
  const userCreds = sqlite.prepare('SELECT * FROM UserCredential').all() as any[];
  console.log(`🔒 ユーザー認証情報: ${userCreds.length}件`);
  for (const c of userCreds) {
    await prisma.userCredential.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        userId: c.userId,
        serviceId: c.serviceId,
        loginId: c.loginId,
        password: c.password ?? null,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      },
      update: {},
    });
  }

  // ============================================================
  // 8. TenantVariantAccess
  // ============================================================
  const variantAccesses = sqlite.prepare('SELECT * FROM TenantVariantAccess').all() as any[];
  console.log(`🎫 バリアントアクセス権: ${variantAccesses.length}件`);
  for (const a of variantAccesses) {
    await prisma.tenantVariantAccess.upsert({
      where: { id: a.id },
      create: {
        id: a.id,
        tenantId: a.tenantId,
        variantId: a.variantId,
        createdAt: new Date(a.createdAt),
      },
      update: {},
    });
  }

  // ============================================================
  // 9. TenantServiceAccess
  // ============================================================
  const serviceAccesses = sqlite.prepare('SELECT * FROM TenantServiceAccess').all() as any[];
  console.log(`🎫 サービスアクセス権: ${serviceAccesses.length}件`);
  for (const a of serviceAccesses) {
    await prisma.tenantServiceAccess.upsert({
      where: { id: a.id },
      create: {
        id: a.id,
        tenantId: a.tenantId,
        serviceId: a.serviceId,
        createdAt: new Date(a.createdAt),
      },
      update: {},
    });
  }

  // ============================================================
  // 10. TenantSoftware
  // ============================================================
  const softwares = sqlite.prepare('SELECT * FROM TenantSoftware').all() as any[];
  console.log(`💾 ソフトウェア情報: ${softwares.length}件`);
  for (const s of softwares) {
    await prisma.tenantSoftware.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        tenantId: s.tenantId,
        category: s.category ?? null,
        name: s.name,
        count: s.count ?? null,
        ecCount: s.ecCount ?? null,
        purchaseDate: s.purchaseDate ?? null,
        lastUpdateDate: s.lastUpdateDate ?? null,
        version: s.version ?? null,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      },
      update: {},
    });
  }

  // ============================================================
  // 11. Announcement
  // ============================================================
  const announcements = sqlite.prepare('SELECT * FROM Announcement').all() as any[];
  console.log(`📢 お知らせ: ${announcements.length}件`);
  for (const a of announcements) {
    await prisma.announcement.upsert({
      where: { id: a.id },
      create: {
        id: a.id,
        title: a.title,
        content: a.content,
        type: a.type ?? 'INFO',
        targetRole: a.targetRole ?? null,
        targetTenantId: a.targetTenantId ?? null,
        isActive: a.isActive === 1 || a.isActive === true,
        publishedAt: new Date(a.publishedAt),
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt),
      },
      update: {},
    });
  }

  // ============================================================
  // 12. UserAnnouncementRead
  // ============================================================
  const reads = sqlite.prepare('SELECT * FROM UserAnnouncementRead').all() as any[];
  console.log(`👁 既読情報: ${reads.length}件`);
  for (const r of reads) {
    await prisma.userAnnouncementRead.upsert({
      where: { id: r.id },
      create: {
        id: r.id,
        userId: r.userId,
        announcementId: r.announcementId,
        readAt: new Date(r.readAt),
      },
      update: {},
    });
  }

  // ============================================================
  // 13. AuditLog
  // ============================================================
  const auditLogs = sqlite.prepare('SELECT * FROM AuditLog').all() as any[];
  console.log(`📋 監査ログ: ${auditLogs.length}件`);
  for (const l of auditLogs) {
    await prisma.auditLog.upsert({
      where: { id: l.id },
      create: {
        id: l.id,
        userId: l.userId ?? null,
        action: l.action,
        target: l.target ?? null,
        metadata: l.metadata ?? null,
        createdAt: new Date(l.createdAt),
      },
      update: {},
    });
  }

  console.log('\n✅ データ移行が完了しました！');
}

migrate()
  .catch((e) => {
    console.error('❌ エラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    sqlite.close();
  });
