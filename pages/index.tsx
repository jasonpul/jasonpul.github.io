import {NextPage, GetStaticProps} from 'next'
import {getAllPosts} from '../api'
import {Post} from '../types'

import Home from './home'

// @ts-ignore
const Site: NextPage = ({posts}) => {
  return (
    <div>
      {/*
 // @ts-ignore*/}
      <Home posts={posts} />
    </div>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const posts = await getAllPosts()
  return {
    props: {
      posts: posts,
    },
  }
}

export default Site
