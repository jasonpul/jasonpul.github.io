import matter from 'gray-matter'

const compareDates = (a, b) => {
  if (a.date < b.date) {
    return -1
  }
  if (a.date > b.date) {
    return 1
  }
  return 0
}

const formatDate = (date) => {
  let month = (date.getMonth() + 1).toString()
  let day = date.getDate().toString()
  const year = date.getFullYear().toString()

  if (month.length < 2) {
    month = '0' + month
  }
  if (day.length < 2) {
    day = '0' + day
  }
  return `${year}-${month}-${day}`
}

export const getAllPosts = async () => {
  // @ts-ignore
  const context = require.context('./_posts', false, /\.md$/)
  const posts = []
  for (const path of context.keys()) {
    const fileName = path.slice(2)
    const post = await import(`./_posts/${fileName}`)
    const content = matter(post.default)
    formatDate(new Date(content.data.date))
    posts.push({
      slug: fileName.replace('.md', ''),
      title: content.data.title,
      description: content.data.description,
      date: formatDate(new Date(content.data.date)),
    })
  }
  posts.sort(compareDates)
  return posts
}

export const getPostBySlug = async (slug) => {
  const post = await import(`./_posts/${slug}.md`)
  const content = matter(post.default)
  // console.log(content.data.date)
  content.data.date = formatDate(new Date(content.data.date))
  // console.log(typeof content.data.date)
  return {
    data: content.data,
    content: content.content,
  }
}
