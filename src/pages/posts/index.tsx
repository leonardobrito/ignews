import { GetStaticProps } from 'next'
import { getPrismicClient } from '../../services/prismic'
import { RichText } from 'prismic-dom'
import Head from 'next/head'
import Link from 'next/link'
import Prismic from '@prismicio/client'
import styles from './styles.module.scss'

interface Post {
  excerpt: string;
  id: string;
  slug: string;
  title: string;
  updatedAt: string;
}

interface PostsProps {
  posts: Post[]
}

export default function Posts( { posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | ig.news</title>
        <meta property="og:title" content="Posts | ig.news" key="title" />
        <meta name="description" content="News list about React World."/>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          { posts.map(post => (
            <Link href={`/posts/${post.slug}`} key={post.id}>
              <a>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
              </Link>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()

  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'publication')
  ], {
    fetch: ['publication.title', 'publication.content'],
    pageSize: 10,
  })

  const posts = response.results.map(post => {
    return {
      excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      id: post.id,
      slug: post.uid,
      title: RichText.asText(post.data.title),
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    }
  })

  return {
    props: {
      posts,
    }
  }
}
