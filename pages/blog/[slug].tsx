import {getPostBySlug, getAllPosts} from '../../api'
import Header from '../../components/Header'
import Head from 'next/head'
import ReactMarkdown from 'react-markdown'
import {Light as SyntaxHighlighter} from 'react-syntax-highlighter'
// rainbow, obsidian, gml, ocean
const highlightStyle = require('react-syntax-highlighter/dist/cjs/styles/hljs/atelier-lakeside-light')
  .default

const CodeBlock = ({language, value}) => {
  return (
    <SyntaxHighlighter language={language} style={highlightStyle}>
      {value}
    </SyntaxHighlighter>
  )
}

const Post = ({data, content}) => {
  console.log(data)
  return (
    <div className="container">
      <Head>
        <title>{data.title}</title>
      </Head>
      <Header />
      <div className="Post">
        <div className="Post__title">{data.title}</div>
        <div className="Post__date">{data.date}</div>
        {/* <hr /> */}
        <ReactMarkdown
          source={content}
          renderers={{code: CodeBlock}}
          className="markdown"
        />
      </div>
    </div>
  )
}

export const getStaticProps = async (context) => {
  return {
    props: await getPostBySlug(context.params.slug),
  }
}

export const getStaticPaths = async () => {
  let paths = await getAllPosts()
  paths = paths.map((post) => ({
    params: {slug: post.slug},
  }))
  return {
    paths: paths,
    fallback: false,
  }
}

export default Post
