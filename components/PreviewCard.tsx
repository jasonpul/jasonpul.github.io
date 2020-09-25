import {Fragment} from 'react'
import Link from 'next/link'

const previewCard = ({post}) => {
  return (
    <div className="PreviewCard">
      <div className="PreviewCard__title">{post.title}</div>
      <div className="PreviewCard__description">{post.description}</div>
      <Link href={`/blog/${post.slug}`} as={`/blog/${post.slug}`}>
        <a className="PreviewCard__link">read</a>
      </Link>
    </div>
  )
}

export default previewCard
