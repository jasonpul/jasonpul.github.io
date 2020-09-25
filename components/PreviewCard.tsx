import {Fragment} from 'react'
import Link from 'next/link'

const previewCard = ({post}) => {
  return (
    <Link href={`/blog/${post.slug}`} as={`/blog/${post.slug}`}>
      <a>
        <div className="PreviewCard">
          <div className="PreviewCard__title">{post.title}</div>
          <div className="PreviewCard__description">{post.description}</div>
          <div className="PreviewCard__date">{post.date}</div>
        </div>
      </a>
    </Link>
  )
}

export default previewCard
