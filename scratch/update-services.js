const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. 全サービスをリセット
  await prisma.service.updateMany({
    data: { isActive: false, sortOrder: 999 }
  });

  // 2. 名称を画像に完全一致させる
  await prisma.service.updateMany({
    where: { name: '最新アップデート' },
    data: { name: '最新版アップデート' }
  });
  await prisma.service.updateMany({
    where: { name: 'S/F com-pass 3DView' },
    data: { name: 'com-pass 3DView' }
  });
  await prisma.service.updateMany({
    where: { name: 'データロジックダイレクト' },
    data: { name: 'DATALOGICDIRECT' }
  });

  // 3. 各サービスの内容を更新
  const services = [
    { name: '最新版アップデート', desc: '最新版を無償でダウンロードできます。', icon: 'RefreshCw', order: 1 },
    { name: '専用フリーダイヤル', desc: '操作方法やトラブルなどお困りごとについて電話やメールで対応します。', icon: 'PhoneCall', order: 2 },
    { name: 'く～chat', desc: 'REAL4の質問をAIによって回答する serviceです。', icon: 'MessageSquare', order: 3 },
    { name: 'com-pass 3DView', desc: 'プロジェクトメンバー内での共有が行えます。', icon: 'Navigation', order: 4 },
    { name: 'DATALOGICDIRECT', desc: 'ソフトウェアをECサイトから購入可能です。', icon: 'ShoppingCart', order: 5 },
    { name: 'スタートサポート', desc: 'Coming soon\n初期導入をリモートでサポートします\nサポートの受け付けはこちらから', icon: 'Activity', order: 6 },
    { name: 'ソフトウェアライセンス交換', desc: 'ライセンスキーに有償で交換することができます。申し込みはこちらから', icon: 'Usb', order: 7 },
    { name: 'オンラインセミナー', desc: 'レベル別の講習を定期的に行います。\nアーカイブ視聴はこちらから', icon: 'MonitorPlay', order: 8 },
    { name: 'カスタム研修', desc: 'カスタムメイドで依頼するオリジナル\n実践研修申し込みはこちらから', icon: 'GraduationCap', order: 9 },
    { name: '入力代行', desc: '部分入力、特殊部品入力、モデルチェックなど必要な箇所の入力の支援の申し込みはこちらから', icon: 'Keyboard', order: 10 },
  ];

  for (const s of services) {
    await prisma.service.updateMany({
      where: { name: s.name },
      data: {
        description: s.desc,
        iconName: s.icon,
        sortOrder: s.order,
        isActive: true
      }
    });
  }

  console.log('Final synchronization complete: 10 services updated.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
