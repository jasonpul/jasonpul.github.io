import Header from '../components/Header'
import Head from 'next/head'

const about = () => {
  return (
    <div className="container">
      <Head>
        <title>About Jason P.</title>
      </Head>
      <Header />
      <div className="About">
        <img className="About__profile" src="/profile.png" alt="" />
        <p>
          Hello, my name is Jason Pul and welcome to my blog. I'm an Air Force
          veteran that obtained a B.S. and M.S. in Mechanical Engineering after
          leaving the service. Following college, I worked in the Aerospace
          sector for many years. While working as an engineer, I really enjoyed
          creating software tools to increase productivity and efficiency. In
          fact I enjoyed it so much that I decided to pivot my career and attend
          a coding boot-camp to become a full-stack software engineer. I have a
          passion for building things, both physically and through software. I'm
          profficient in the Django-PostgreSQL-React stack and am constantly
          learning new things to expand my capabilities. You can find me on
          <a href="https://www.linkedin.com/in/jason-pul/"> LinkedIn</a> if
          you're interested in connecting.
        </p>
      </div>
    </div>
  )
}

export default about
