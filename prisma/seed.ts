import { PrismaClient, Visibility } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      password: hashedPassword,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@example.com',
      password: hashedPassword,
    },
  });

  const post1 = await prisma.post.create({
    data: {
      userId: alice.id,
      content: 'Hello world! This is my first post on this platform.',
      visibility: Visibility.PUBLIC,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      userId: bob.id,
      content: 'Just had a great cup of coffee this morning.',
      visibility: Visibility.PUBLIC,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      userId: alice.id,
      content: 'This is a private post only I can see.',
      visibility: Visibility.PRIVATE,
    },
  });

  const comment1 = await prisma.comment.create({
    data: {
      postId: post1.id,
      userId: bob.id,
      content: 'Welcome to the platform! Great first post.',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post2.id,
      userId: alice.id,
      content: 'Coffee is always a good idea!',
    },
  });

  await prisma.reply.create({
    data: {
      commentId: comment1.id,
      userId: alice.id,
      content: 'Thank you, Bob! Happy to be here.',
    },
  });

  await prisma.like.create({
    data: {
      userId: bob.id,
      targetType: 'POST',
      targetId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: alice.id,
      targetType: 'POST',
      targetId: post2.id,
    },
  });

  console.log('Seed data created successfully');
  console.log(`Users: alice@example.com / bob@example.com (password: password123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
