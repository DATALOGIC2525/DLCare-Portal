/**
 * seed-demo-tenants.ts
 * 開発・デモ用：20件のサンプルテナントとユーザーを登録するスクリプト
 * 実行: npx tsx prisma/seed-demo-tenants.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TENANT_DATA = [
  { name: '医療法人社団 さくら会',       maintenanceId: 'RDD-1001', startYear: '2023', startMonth: '4月',  paymentMethod: '年払い',    userLimit: 15, payBiz: '医療・クリニック' },
  { name: '株式会社アドバンスケア',       maintenanceId: 'RDD-1002', startYear: '2022', startMonth: '7月',  paymentMethod: '月払い',    userLimit: 20, payBiz: '介護サービス' },
  { name: '社会福祉法人 あおぞら福祉会',  maintenanceId: 'RDD-1003', startYear: '2024', startMonth: '1月',  paymentMethod: '年払い',    userLimit: 8,  payBiz: '福祉・介護' },
  { name: '株式会社ライフサポート',       maintenanceId: 'RDD-1004', startYear: '2023', startMonth: '10月', paymentMethod: '年払い',    userLimit: 12, payBiz: '在宅介護' },
  { name: '医療法人 みなと医院',          maintenanceId: 'RDD-1005', startYear: '2022', startMonth: '4月',  paymentMethod: '月払い',    userLimit: 5,  payBiz: '医療・クリニック' },
  { name: '株式会社ヘルスケアジャパン',   maintenanceId: 'RDD-1006', startYear: '2023', startMonth: '6月',  paymentMethod: '年払い',    userLimit: 30, payBiz: '医療系IT' },
  { name: '社会福祉法人 やすらぎ会',      maintenanceId: 'RDD-1007', startYear: '2024', startMonth: '4月',  paymentMethod: '年払い',    userLimit: 10, payBiz: '特別養護老人ホーム' },
  { name: '医療法人社団 緑の丘クリニック',maintenanceId: 'RDD-1008', startYear: '2022', startMonth: '9月',  paymentMethod: '月払い',    userLimit: 6,  payBiz: '医療・クリニック' },
  { name: '株式会社ケアネットワーク',     maintenanceId: 'RDD-1009', startYear: '2023', startMonth: '3月',  paymentMethod: '年払い',    userLimit: 25, payBiz: '居宅介護' },
  { name: '有限会社やまびこ薬局',         maintenanceId: 'RDD-1010', startYear: '2021', startMonth: '11月', paymentMethod: '月払い',    userLimit: 4,  payBiz: '調剤薬局' },
  { name: '株式会社アクティブシニア',     maintenanceId: 'RDD-1011', startYear: '2024', startMonth: '2月',  paymentMethod: '年払い',    userLimit: 18, payBiz: '高齢者施設' },
  { name: '医療法人 東洋内科クリニック',  maintenanceId: 'RDD-1012', startYear: '2023', startMonth: '5月',  paymentMethod: '月払い',    userLimit: 7,  payBiz: '医療・クリニック' },
  { name: '社会福祉法人 未来福祉会',      maintenanceId: 'RDD-1013', startYear: '2022', startMonth: '8月',  paymentMethod: '年払い',    userLimit: 20, payBiz: '福祉・介護' },
  { name: '株式会社メディカルサポート',   maintenanceId: 'RDD-1014', startYear: '2024', startMonth: '7月',  paymentMethod: '月払い',    userLimit: 10, payBiz: '医療事務代行' },
  { name: '医療法人財団 太陽会',          maintenanceId: 'RDD-1015', startYear: '2023', startMonth: '1月',  paymentMethod: '年払い',    userLimit: 15, payBiz: '病院・クリニック' },
  { name: '株式会社ケアリンク東北',       maintenanceId: 'RDD-1016', startYear: '2022', startMonth: '4月',  paymentMethod: '月払い',    userLimit: 22, payBiz: '訪問看護' },
  { name: '社会福祉法人 こころの里',      maintenanceId: 'RDD-1017', startYear: '2024', startMonth: '10月', paymentMethod: '年払い',    userLimit: 8,  payBiz: '障害者支援' },
  { name: '有限会社なごみ訪問介護',       maintenanceId: 'RDD-1018', startYear: '2021', startMonth: '6月',  paymentMethod: '月払い',    userLimit: 5,  payBiz: '訪問介護' },
  { name: '株式会社プロケアジャパン',     maintenanceId: 'RDD-1019', startYear: '2023', startMonth: '9月',  paymentMethod: '年払い',    userLimit: 35, payBiz: 'ケアマネ事業所' },
  { name: '医療法人社団 白鳥会',          maintenanceId: 'RDD-1020', startYear: '2024', startMonth: '3月',  paymentMethod: '年払い',    userLimit: 12, payBiz: '医療・クリニック' },
];

const DEPARTMENTS = ['営業部', '総務部', '管理部', '経営企画室', '医療情報部', 'ケア事業部', '在宅支援部'];
const LAST_NAMES  = ['田中', '鈴木', '佐藤', '山田', '中村', '小林', '加藤', '吉田', '山口', '松本'];
const FIRST_NAMES = ['太郎', '花子', '次郎', '三郎', '恵子', '博', '裕子', '健一', '美香', '雄二'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeIssuedId(idx: number): string {
  return `DLC-${String(idx + 1).padStart(4, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

async function main() {
  console.log('🌱 デモ用テナント20件のシードを開始します...\n');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  for (let i = 0; i < TENANT_DATA.length; i++) {
    const t = TENANT_DATA[i];

    // テナント作成
    const tenant = await prisma.tenant.create({
      data: {
        name:           t.name,
        userLimit:      t.userLimit,
        maintenanceId:  t.maintenanceId,
        startYear:      t.startYear,
        startMonth:     t.startMonth,
        paymentMethod:  t.paymentMethod,
        remarks:        t.payBiz,
        isActive:       true,
      },
    });

    // 事前発行ID（管理者用）を1件作成
    const issuedId = makeIssuedId(i);
    await prisma.preIssuedId.create({
      data: {
        tenantId: tenant.id,
        issuedId,
        isUsed: false,
      },
    });

    // テナント管理者ユーザー（1名）
    const adminLastName  = randomItem(LAST_NAMES);
    const adminFirstName = randomItem(FIRST_NAMES);
    const adminName      = `${adminLastName} ${adminFirstName}`;

    await prisma.user.create({
      data: {
        tenantId:    tenant.id,
        role:        'TENANT_ADMIN',
        contactName: adminName,
        email:       `admin-${i + 1}@${t.maintenanceId!.toLowerCase().replace('-', '')}.dlcare-demo.jp`,
        passwordHash,
        department:  '管理部',
        preIssuedId: issuedId,
        isActive:    true,
      },
    });

    // 一般ユーザー（1〜3名）
    const userCount = 1 + (i % 3); // 1, 2, または 3名
    for (let u = 0; u < userCount; u++) {
      const lastName  = randomItem(LAST_NAMES);
      const firstName = randomItem(FIRST_NAMES);
      await prisma.user.create({
        data: {
          tenantId:    tenant.id,
          role:        'GENERAL_USER',
          contactName: `${lastName} ${firstName}`,
          email:       `user-${i + 1}-${u + 1}@${t.maintenanceId!.toLowerCase().replace('-', '')}.dlcare-demo.jp`,
          passwordHash,
          department:  randomItem(DEPARTMENTS),
          isActive:    true,
        },
      });
    }

    console.log(`  ✅ [${i + 1}/20] ${t.name} (管理者1名 + 一般${userCount}名)`);
  }

  console.log('\n🎉 シード完了！20件のテナントを登録しました。');
}

main()
  .catch((e) => {
    console.error('❌ シードに失敗しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
