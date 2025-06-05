import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Blog {
  id: number;
  userId: string | null;
  title: string | null;
  summary: string | null;
  content: string | null;
  section1: string | null;
  section2: string | null;
  mainImage: string | null;
  subImage: string | null;
  image: string | null;
  createdAt: Date | null;
}

// Định nghĩa kiểu trả về có authorName đã tỉa sẵn
export interface BlogWithAuthor extends Blog {
  authorName: string;
}

// Lấy tất cả blog, trả về BlogWithAuthor
export const getAllBlogs = async (): Promise<BlogWithAuthor[]> => {
  const blogs = await prisma.blogs.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      Users: {
        select: { name: true },
      },
    },
  });
  return blogs.map((blog: Blog & { Users?: { name: string | null } | null }) => ({
    id: blog.id,
    userId: blog.userId,
    title: blog.title,
    summary: blog.summary,
    content: blog.content,
    section1: blog.section1,
    section2: blog.section2,
    mainImage: blog.mainImage,
    subImage: blog.subImage,
    image: blog.image,
    createdAt: blog.createdAt,
    authorName: blog.Users?.name ?? "Không rõ",
  }));
};

// Lấy blog theo id, trả về BlogWithAuthor hoặc null
export const getBlogById = async (id: number): Promise<(BlogWithAuthor & { authorEmail?: string | null }) | null> => {
  const blog = await prisma.blogs.findUnique({
    where: { id },
    include: {
      Users: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!blog) return null;

  return {
    id: blog.id,
    userId: blog.userId,
    title: blog.title,
    summary: blog.summary,
    content: blog.content,
    section1: blog.section1,
    section2: blog.section2,
    mainImage: blog.mainImage,
    subImage: blog.subImage,
    image: blog.image,
    createdAt: blog.createdAt,
    authorName: blog.Users?.name ?? "Không rõ",
    authorEmail: blog.Users?.email ?? null,
  };
};

// Các hàm create, update, delete giữ nguyên

export const createBlog = async (data: {
  userId?: string;
  title?: string;
  summary?: string;
  content?: string;
  section1?: string;
  section2?: string;
  mainImage?: string;
  subImage?: string;
  image?: string;
}) => {
  return await prisma.blogs.create({ data });
};

export const updateBlog = async (
  id: number,
  data: Partial<{
    userId?: string;
    title?: string;
    summary?: string;
    content?: string;
    section1?: string;
    section2?: string;
    mainImage?: string;
    subImage?: string;
    image?: string;
  }>
) => {
  return await prisma.blogs.update({
    where: { id },
    data,
  });
};

export const deleteBlog = async (id: number) => {
  return await prisma.blogs.delete({
    where: { id },
  });
};
