import {getPostBySlug, getAllPosts} from '../../api'
import Header from '../../components/Header'
import ReactMarkdown from 'react-markdown'
import {Light as SyntaxHighlighter} from 'react-syntax-highlighter'
import {github} from 'react-syntax-highlighter/dist/cjs/styles/hljs'

const CodeBlock = ({language, value}) => {
  return (
    <SyntaxHighlighter language={language} style={github}>
      {value}
    </SyntaxHighlighter>
  )
}

const Post = ({data, content}) => {
  return (
    <div className="container">
      <Header />
      <div className="Post">
        <ReactMarkdown source={content} renderers={{code: CodeBlock}} />
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
