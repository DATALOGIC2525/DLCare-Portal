import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SERVICES = [
  { name: 'DLCare詳細',              url: 'https://www.datalogic.co.jp/user-support/dl-care-8つのサービス/#dlcare-1',   iconName: 'Info',         groupLabel: 'DLCare サポート',       sortOrder: 1 },
  { name: '最新アップデート',           url: 'https://www.datalogic.co.jp/user-support/dl-care-8つのサービス/#dlcare-2',   iconName: 'RefreshCw',    groupLabel: 'DLCare サポート',       sortOrder: 2 },
  { name: '専用フリーダイヤル',          url: 'https://www.datalogic.co.jp/user-support/dl-care-8つのサービス/#dlcare-3',   iconName: 'PhoneCall',    groupLabel: 'DLCare サポート',       sortOrder: 3 },
  { name: 'く～chat',                 url: 'https://kasanare.com/user/datalogic2',                                       iconName: 'MessageSquare', groupLabel: 'コミュニケーション',     sortOrder: 1 },
  { name: 'S/F com-pass 3DView',    url: 'https://www.datalogic.co.jp/user-support/dl-care-8つのサービス/#dlcare-5',   iconName: 'Box',          groupLabel: '設計ツール',            sortOrder: 1 },
  { name: 'オンラインセミナー',          url: 'https://dlcare.site.p.uliza.jp/',                                          iconName: 'MonitorPlay',  groupLabel: 'コミュニケーション',     sortOrder: 2 },
  { name: 'データロジックダイレクト',     url: 'https://store.datalogic.co.jp/sign_in',                                    iconName: 'ShoppingCart', groupLabel: '設計ツール',            sortOrder: 2 },
  { name: 'カスタム研修',               url: 'https://www.datalogic.co.jp/user-support/dl-care-8つのサービス/#dlcare-8',   iconName: 'GraduationCap', groupLabel: 'トレーニング・サポート', sortOrder: 2 },
  { name: 'スタートサポート',            url: 'https://www.datalogic.co.jp/user-support/dl-care-8つのサービス/#dlcare-9',   iconName: 'Rocket',       groupLabel: 'トレーニング・サポート', sortOrder: 1 },
  { name: 'ソフトウェアライセンス交換',   url: 'https://www.datalogic.co.jp/user-support/dl-care-8つのサービス/#dlcare-10',  iconName: 'Key',          groupLabel: 'ライセンス・その他',    sortOrder: 1 },
  { name: '入力代行',                  url: 'https://www.datalogic.co.jp/user-support/dl-care-8つのサービス/#dlcare-9-2', iconName: 'Keyboard',     groupLabel: 'ライセンス・その他',    sortOrder: 2 },
];


async function main() {
  // 既存のデータをクリア
  await prisma.userCredential.deleteMany();
  await prisma.service.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.preIssuedId.deleteMany();
  await prisma.tenant.deleteMany();

  // サービスの作成
  const createdServices = [];
  for (const s of SERVICES) {
    const service = await prisma.service.create({ data: s });
    createdServices.push(service);
  }

  // テナントの作成
  const tenant = await prisma.tenant.create({
    data: {
      name: '株式会社データロジック (システム管理)',
      userLimit: 100,
    },
  });

  // 事前発行IDの作成
  await prisma.preIssuedId.create({
    data: {
      tenantId: tenant.id,
      issuedId: 'ADMIN-0001',
      isUsed: true,
    },
  });

  // システム管理者の作成
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      role: 'SYSTEM_ADMIN',
      contactName: 'システム管理者',
      email: 'admin@example.com',
      preIssuedId: 'ADMIN-0001',
      passwordHash,
    },
  });

  // システム管理者に、対象のサービスのクレデンシャルを設定
  // 例として「く～chat」「データロジックダイレクト」「オンラインセミナー」に認証情報を追加
  for (const service of createdServices) {
    if (['く～chat', 'データロジックダイレクト', 'オンラインセミナー'].includes(service.name)) {
      await prisma.userCredential.create({
        data: {
          userId: adminUser.id,
          serviceId: service.id,
          loginId: `admin-${service.name}`,
          password: `pass-${service.name}`,
        }
      });
    }
  }

  console.log('Seed data created with 11 services (DL Care)!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
