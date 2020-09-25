import Link from 'next/link'

const links = [
  {link: '/', label: 'Home'},
  {link: '/projects', label: 'Projects'},
  {link: '/about', label: 'About'},
]
const header = () => {
  return (
    <div className="Header">
      <div className="Header__linkContainer">
        {links.map((link, i) => {
          return (
            <Link href={link.link} key={i}>
              <a className="Header__link">{link.label}</a>
            </Link>
          )
        })}
      </div>
      <div className="Header__logo">Jason P.</div>
      <hr />
    </div>
  )
}

export default header
