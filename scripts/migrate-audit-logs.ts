/**
 * 監査ログのみ移行するスクリプト（migrate-data.ts の補完用）
 */
import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const SQLITE_PATH = path.join(process.cwd(), 'prisma', 'dev.db');
const sqlite = new Database(SQLITE_PATH, { readonly: true });
const prisma = new PrismaClient();

async function migrateAuditLogs() {
  const auditLogs = sqlite.prepare('SELECT * FROM AuditLog').all() as any[];
  console.log(`📋 監査ログ: ${auditLogs.length}件（バッチ処理中...）`);

  const BATCH_SIZE = 500;
  for (let i = 0; i < auditLogs.length; i += BATCH_SIZE) {
    const batch = auditLogs.slice(i, i + BATCH_SIZE);
    await prisma.auditLog.createMany({
      data: batch.map((l: any) => ({
        id: l.id,
        userId: l.userId ?? null,
        action: l.action,
        target: l.target ?? null,
        metadata: l.metadata ?? null,
        createdAt: new Date(l.createdAt),
      })),
      skipDuplicates: true,
    });
    console.log(`  → ${Math.min(i + BATCH_SIZE, auditLogs.length)}/${auditLogs.length} 件完了`);
  }

  console.log('\n✅ 監査ログの移行が完了しました！');
}

migrateAuditLogs()
  .catch((e) => {
    console.error('❌ エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    sqlite.close();
  });
