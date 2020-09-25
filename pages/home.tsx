import {NextPage, GetStaticProps} from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'
import PreviewCard from '../components/PreviewCard'
import {Post} from '../types'

// @ts-ignore
const Home: NextPage = ({posts}) => {
  return (
    <div className="container">
      <Head>
        <meta name="description" content="About me, my projects, and my blog" />
        <title>Jason P.</title>
      </Head>
      <Header />
      {posts && posts.map((post, i) => <PreviewCard post={post} key={i} />)}
    </div>
  )
}

export default Home
