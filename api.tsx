import matter from 'gray-matter'

export const getAllPosts = async () => {
  // @ts-ignore
  const context = require.context('./_posts', false, /\.md$/)
  const posts = []
  for (const path of context.keys()) {
    const fileName = path.slice(2)
    const post = await import(`./_posts/${fileName}`)
    const content = matter(post.default)
    posts.push({
      slug: fileName.replace('.md', ''),
      title: content.data.title,
      description: content.data.description,
    })
  }
  return posts
}

export const getPostBySlug = async (slug) => {
  const post = await import(`./_posts/${slug}.md`)
  const content = matter(post.default)
  content.data.date = content.data.date.toString()
  return {
    data: content.data,
    content: content.content,
  }
}
