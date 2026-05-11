const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { email: true, tenantId: true, role: true } });
  console.log('=== Users ===');
  users.forEach(u => console.log(u.email, u.role, u.tenantId));

  const variants = await prisma.serviceVariant.findMany({ include: { service: { select: { name: true } } } });
  console.log('\n=== ServiceVariants ===');
  variants.forEach(v => console.log(v.id, v.label, v.service.name));

  const accesses = await prisma.tenantVariantAccess.findMany();
  console.log('\n=== TenantVariantAccess ===');
  accesses.forEach(a => console.log('tenant:', a.tenantId, 'variant:', a.variantId));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
