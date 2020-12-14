import React from 'react'
import styled from 'styled-components'
import { useStaticQuery, graphql } from 'gatsby'

import Header from '@/components/Header'

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  padding: 40px;

  color: var(--color);
  background-color: #222129;

  font-family: Fira Code,Monaco,Consolas,Ubuntu Mono,PingFang SC,Hiragino Sans GB,Microsoft YaHei,WenQuanYi Micro Hei,monospace,sans-serif;
`

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <StyledLayout>
      <Header siteTitle={data.site.siteMetadata.title} />
      <div>
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()} {data.site.siteMetadata.title}
        </footer>
      </div>
    </StyledLayout>
  )
}

export default Layout
