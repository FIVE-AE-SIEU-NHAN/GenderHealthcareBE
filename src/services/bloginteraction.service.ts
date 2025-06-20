import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getBlogDetail = async (id: number, userId?: string) => {
  if (userId) {
    await prisma.blogInteractions.create({
      data: {
        blogId: id,
        userId,
        type: "VIEW",
      },
    });
  }

  return prisma.blogs.findUnique({
    where: { id },
    include: {
      interactions: {
        where: { type: { in: ["LIKE", "COMMENT", "REPLY"] } },
        include: {
          user: true,
          replies: true,
        },
      },
    },
  });
};

// Like blog
export const likeBlog = async (blogId: number, userId: string) => {
  const existing = await prisma.blogInteractions.findFirst({
    where: { blogId, userId, type: "LIKE" },
  });

  if (existing) {
    await prisma.blogInteractions.delete({ where: { id: existing.id } });
    return { message: "Unliked" };
  }

  await prisma.blogInteractions.create({
    data: { blogId, userId, type: "LIKE" },
  });

  return { message: "Liked" };
};

// Bình luận blog
export const commentBlog = async (
  blogId: number,
  userId: string,
  content: string
) => {
  return prisma.blogInteractions.create({
    data: {
      blogId,
      userId,
      type: "COMMENT",
      content,
    },
  });
};

// Trả lời bình luận
export const replyComment = async (
  blogId: number,
  userId: string,
  content: string,
  parentId: number
) => {
  return prisma.blogInteractions.create({
    data: {
      blogId,
      userId,
      type: "REPLY",
      content,
      parentId,
    },
  });
};

// Lấy comment kèm reply
export const getComments = async (blogId: number) => {
  return prisma.blogInteractions.findMany({
    where: {
      blogId,
      type: "COMMENT",
    },
    include: {
      user: true,
      replies: {
        where: { type: "REPLY" },
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
};

// Lấy số lượt view và like
export const getBlogStats = async (blogId: number) => {
  const [views, likes] = await Promise.all([
    prisma.blogInteractions.count({
      where: { blogId, type: "VIEW" },
    }),
    prisma.blogInteractions.count({
      where: { blogId, type: "LIKE" },
    }),
  ]);

  return { views, likes };
};

export const getLikersForInteraction = async (interactionId: number): Promise<{ userId: string; userName: string; likedAt: Date }[]> => {
  try {
      const likes = await prisma.blogInteractions.findMany({
          where: {
              parentId: interactionId, // parentId của LIKE là ID của tương tác được thích
              type: 'LIKE',
          },
          include: {
              user: { // Bao gồm thông tin user để lấy tên
                  select: {
                      id: true,
                      name: true,
                  },
              },
          },
          orderBy: {
              createdAt: 'desc', // Sắp xếp theo thời gian like mới nhất
          },
      });

      // Chuyển đổi kết quả sang định dạng mong muốn cho frontend
      return likes
        .filter((like: typeof likes[number]) => like.userId !== null && like.createdAt !== null)
        .map((like: typeof likes[number]) => ({
          userId: like.userId as string,
          userName: like.user?.name || 'Anonymous', // Lấy tên người dùng
          likedAt: like.createdAt as Date,
        }));
  } catch (error) {
      console.error("Error fetching likers for interaction:", error);
      throw error;
  }
};