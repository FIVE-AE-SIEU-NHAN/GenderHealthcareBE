export interface Blog {
  id?: number;
  userId: string;
  title: string;
  summary?: string;
  content: string;
  section1?: string;
  section2?: string;
  mainImage: string;
  subImage?: string;
  createdAt?: Date;
  authorName?: string;
}
