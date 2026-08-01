import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const STUDENT_EMAIL = process.env.SEED_STUDENT_EMAIL;
const STUDENT_PASSWORD = process.env.SEED_STUDENT_PASSWORD;

async function main() {
  // Admin user (only if SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are set)
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {},
      create: {
        email: ADMIN_EMAIL,
        name: "Admin",
        passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
        role: "ADMIN",
      },
    });
  }

  // Sample customer (only if SEED_STUDENT_EMAIL and SEED_STUDENT_PASSWORD are set)
  if (STUDENT_EMAIL && STUDENT_PASSWORD) {
    await prisma.user.upsert({
      where: { email: STUDENT_EMAIL },
      update: {},
      create: {
        email: STUDENT_EMAIL,
        name: "Demo Student",
        passwordHash: await bcrypt.hash(STUDENT_PASSWORD, 10),
        role: "CUSTOMER",
      },
    });
  }

  // Categories
  const categories = [
    { name: "RRB", slug: "rrb" },
    { name: "SSC", slug: "ssc" },
    { name: "Banking", slug: "banking" },
    { name: "UPSC", slug: "upsc" },
    { name: "State PSC", slug: "state-psc" },
    { name: "Defence", slug: "defence" },
  ];

  const categoryMap: Record<string, string> = {};
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categoryMap[c.slug] = cat.id;
  }

  // Products
  const products = [
    {
      title: "RRB NTPC Complete Notes",
      slug: "rrb-ntpc-complete-notes",
      description: "Complete handwritten notes for RRB NTPC exam preparation. Covers General Awareness, Mathematics, Reasoning, and General Intelligence. Includes previous year questions and detailed solutions.",
      categorySlug: "rrb",
      price: 49900,
      discountPct: 40,
      thumbnailUrl: "https://placehold.co/400x560",
      previewImages: ["https://placehold.co/400x560"],
      pdfKey: "products/rrb-ntpc-complete-notes.pdf",
      pages: 120,
      fileSizeMb: 8.5,
      featured: true,
      bestSeller: true,
    },
    {
      title: "SSC CGL Tier-1 Complete Study Material",
      slug: "ssc-cgl-tier-1-complete-study-material",
      description: "Comprehensive study material for SSC CGL Tier-1 exam. Covers Quantitative Aptitude, English Language, General Intelligence & Reasoning, and General Awareness.",
      categorySlug: "ssc",
      price: 39900,
      discountPct: 25,
      thumbnailUrl: "https://placehold.co/400x560",
      previewImages: ["https://placehold.co/400x560"],
      pdfKey: "products/ssc-cgl-tier-1.pdf",
      pages: 200,
      fileSizeMb: 12.5,
      featured: true,
      bestSeller: true,
    },
    {
      title: "IBPS PO Complete Guide",
      slug: "ibps-po-complete-guide",
      description: "Complete guide for IBPS PO exam preparation. Includes Reasoning, English Language, Quantitative Aptitude, and Banking Awareness with practice sets.",
      categorySlug: "banking",
      price: 34900,
      discountPct: 30,
      thumbnailUrl: "https://placehold.co/400x560",
      previewImages: ["https://placehold.co/400x560"],
      pdfKey: "products/ibps-po-complete-guide.pdf",
      pages: 180,
      fileSizeMb: 10.2,
      featured: true,
      bestSeller: false,
    },
    {
      title: "UPSC GS Foundation Notes",
      slug: "upsc-gs-foundation-notes",
      description: "Foundation notes for UPSC Civil Services General Studies. Covers Indian Polity, History, Geography, Economy, and Current Affairs in a structured format.",
      categorySlug: "upsc",
      price: 69900,
      discountPct: 15,
      thumbnailUrl: "https://placehold.co/400x560",
      previewImages: ["https://placehold.co/400x560"],
      pdfKey: "products/upsc-gs-foundation-notes.pdf",
      pages: 350,
      fileSizeMb: 22.0,
      featured: true,
      bestSeller: true,
    },
    {
      title: "SSC CHSL Quantitative Aptitude",
      slug: "ssc-chsl-quantitative-aptitude",
      description: "Focused quantitative aptitude notes for SSC CHSL exam. Includes shortcuts, formulas, and 500+ practice questions with detailed solutions.",
      categorySlug: "ssc",
      price: 19900,
      discountPct: 0,
      thumbnailUrl: "https://placehold.co/400x560",
      previewImages: ["https://placehold.co/400x560"],
      pdfKey: "products/ssc-chsl-quant.pdf",
      pages: 90,
      fileSizeMb: 5.5,
      featured: false,
      bestSeller: false,
    },
    {
      title: "RRB Group-D General Science",
      slug: "rrb-group-d-general-science",
      description: "General Science notes for RRB Group-D exam. Covers Physics, Chemistry, and Biology with exam-oriented content and diagrams.",
      categorySlug: "rrb",
      price: 14900,
      discountPct: 20,
      thumbnailUrl: "https://placehold.co/400x560",
      previewImages: ["https://placehold.co/400x560"],
      pdfKey: "products/rrb-group-d-science.pdf",
      pages: 75,
      fileSizeMb: 4.8,
      featured: false,
      bestSeller: true,
    },
    {
      title: "SBI Clerk Reasoning Ability",
      slug: "sbi-clerk-reasoning-ability",
      description: "Master Reasoning Ability for SBI Clerk exam. Includes all topics with solved examples and practice sets.",
      categorySlug: "banking",
      price: 17900,
      discountPct: 10,
      thumbnailUrl: "https://placehold.co/400x560",
      previewImages: ["https://placehold.co/400x560"],
      pdfKey: "products/sbi-clerk-reasoning.pdf",
      pages: 85,
      fileSizeMb: 5.0,
      featured: false,
      bestSeller: false,
    },
    {
      title: "UPSC CSAT Comprehension Guide",
      slug: "upsc-csat-comprehension-guide",
      description: "Comprehensive guide for UPSC CSAT Paper-2. Focuses on comprehension, logical reasoning, and data interpretation with practice exercises.",
      categorySlug: "upsc",
      price: 24900,
      discountPct: 35,
      thumbnailUrl: "https://placehold.co/400x560",
      previewImages: ["https://placehold.co/400x560"],
      pdfKey: "products/upsc-csat-guide.pdf",
      pages: 140,
      fileSizeMb: 7.8,
      featured: true,
      bestSeller: false,
    },
    {
      title: "NDA Mathematics Complete Notes",
      slug: "nda-mathematics-complete-notes",
      description: "Complete mathematics notes for NDA exam. Covers Algebra, Calculus, Trigonometry, and Statistics with solved examples.",
      categorySlug: "defence",
      price: 29900,
      discountPct: 20,
      thumbnailUrl: "https://placehold.co/400x560",
      previewImages: ["https://placehold.co/400x560"],
      pdfKey: "products/nda-math-notes.pdf",
      pages: 160,
      fileSizeMb: 9.2,
      featured: false,
      bestSeller: true,
    },
    {
      title: "State PSC General Studies",
      slug: "state-psc-general-studies",
      description: "General Studies notes for State PSC exams. Covers state-specific history, geography, polity, and current affairs.",
      categorySlug: "state-psc",
      price: 39900,
      discountPct: 25,
      thumbnailUrl: "https://placehold.co/400x560",
      previewImages: ["https://placehold.co/400x560"],
      pdfKey: "products/state-psc-gs.pdf",
      pages: 220,
      fileSizeMb: 14.0,
      featured: false,
      bestSeller: false,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        description: p.description,
        categoryId: categoryMap[p.categorySlug],
        price: p.price,
        discountPct: p.discountPct,
        thumbnailUrl: p.thumbnailUrl,
        previewImages: p.previewImages,
        pdfKey: p.pdfKey,
        pages: p.pages,
        fileSizeMb: p.fileSizeMb,
        featured: p.featured,
        bestSeller: p.bestSeller,
        published: true,
      },
    });
  }

  // Sample coupon
  await prisma.coupon.upsert({
    where: { code: "SAVE10" },
    update: {},
    create: {
      code: "SAVE10",
      type: "PERCENT",
      value: 10,
      minOrderVal: 10000,
      usageLimit: 100,
    },
  });

  // Sample approved review
  const rrbProduct = await prisma.product.findUnique({ where: { slug: "rrb-ntpc-complete-notes" } });
  const student = STUDENT_EMAIL ? await prisma.user.findUnique({ where: { email: STUDENT_EMAIL } }) : null;
  if (rrbProduct && student) {
    await prisma.review.upsert({
      where: { productId_userId: { productId: rrbProduct.id, userId: student.id } },
      update: {},
      create: {
        productId: rrbProduct.id,
        userId: student.id,
        rating: 5,
        comment: "Excellent notes! Very well organized and easy to understand. Helped me crack the exam.",
        approved: true,
      },
    });
  }

  console.log("Seeded successfully!");
  console.log(`  ${products.length} products across ${categories.length} categories`);
  console.log("  Admin & student accounts created (email/password from SEED_* env vars)");
}

main().finally(() => prisma.$disconnect());