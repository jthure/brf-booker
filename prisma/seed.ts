import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Delete existing records
  await prisma.booking.deleteMany({})
  await prisma.user.deleteMany({})

  // Create sample users
  const users = [
    {
      name: 'Anna Andersson',
      email: 'anna.andersson@example.com',
      isAdmin: false,
    },
    {
      name: 'Erik Eriksson',
      email: 'erik.eriksson@example.com',
      isAdmin: false,
    },
    {
      name: 'Maria Nilsson',
      email: 'maria.nilsson@example.com',
      isAdmin: true,
    },
    {
      name: 'Johan Svensson',
      email: 'johan.svensson@example.com',
      isAdmin: false,
    },
  ]

  for (const user of users) {
    await prisma.user.create({
      data: user,
    })
  }

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
