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

export interface BlogWithAuthor extends Blog {
  authorName: string;
  authorEmail?: string | null;
}

export const getAllBlogs = async (
  page: number,
  limit: number,
  search: string = '',
  sortBy: 'createdAt' | 'title' = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<{ blogs: BlogWithAuthor[]; total: number }> => {
  const skip = (page - 1) * limit;

  const allBlogs = await prisma.blogs.findMany({
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const filteredBlogs = allBlogs.filter((blog) =>
    blog.title?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedBlogs = filteredBlogs.slice(skip, skip + limit);

  return {
    blogs: paginatedBlogs.map((blog) => ({
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
      authorName: blog.user?.name ?? 'Không rõ',
    })),
    total: filteredBlogs.length,
  };
};


export const getBlogById = async (
  id: number
): Promise<(BlogWithAuthor & { authorEmail?: string | null }) | null> => {
  const blog = await prisma.blogs.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true, email: true },
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
    authorName: blog.user?.name ?? 'Không rõ',
    authorEmail: blog.user?.email ?? null,
  };
};

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
  authorName?: string;
  authorEmail?: string;
}) => {
  const createPayload: any = { ...data };

  delete createPayload.id;
  delete createPayload.authorName;
  delete createPayload.authorEmail;

  if (createPayload.userId) {
    createPayload.user = { connect: { id: createPayload.userId } };
    delete createPayload.userId;
  }

  return await prisma.blogs.create({ data: createPayload });
};

export const updateBlog = async (
  id: number,
  data: Partial<{
    id?: number;
    userId?: string | null;
    title?: string;
    summary?: string;
    content?: string;
    section1?: string;
    section2?: string;
    mainImage?: string;
    subImage?: string;
    image?: string;
    authorName?: string;
    authorEmail?: string;
  }>
) => {
  const updatePayload: any = { ...data };

  delete updatePayload.id;
  delete updatePayload.authorName;
  delete updatePayload.authorEmail;

  if (Object.prototype.hasOwnProperty.call(updatePayload, 'userId')) {
    const userIdValue = updatePayload.userId;
    delete updatePayload.userId;

    if (userIdValue === null) {
      updatePayload.user = { disconnect: true };
    } else if (userIdValue !== undefined && userIdValue !== '') {
      updatePayload.user = { connect: { id: userIdValue } };
    } else {
      updatePayload.user = { disconnect: true };
    }
  }

  return await prisma.blogs.update({
    where: { id },
    data: updatePayload,
  });
};

export const deleteBlog = async (id: number) => {
  return await prisma.blogs.delete({ where: { id } });
};
