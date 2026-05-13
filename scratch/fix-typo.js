const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.service.updateMany({
    where: { name: 'く～chat' },
    data: {
      description: 'REAL4の質問をAIによって回答するサービスです。'
    }
  });
  console.log('Typo fixed: service -> サービス');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
