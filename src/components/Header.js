import { Link } from 'gatsby'
import styled from 'styled-components'

import React from 'react'


const InnerHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

const LogoContainer = styled.div`
  display: flex;
  flex: 1;

  &:after {
    background: repeating-linear-gradient(90deg,#ffa86a,#ffa86a 2px,transparent 0,transparent 10px);
    background: repeating-linear-gradient(90deg,var(--accent),var(--accent) 2px,transparent 0,transparent 10px);
    content: "";
    display: block;
    right: 10px;
    width: 100%;
  }
`
const LogoText = styled.div`
  align-items: center;
  background: #ffa86a;
  background: var(--accent);
  color: #000;
  display: flex;
  padding: 5px 10px;
  text-decoration: none;
`

const LogoLink = styled(Link)`
  flex: 0 0 auto;
  max-width: 100%;
  text-decoration: none;
`

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`

const StyledMenu = styled.div`
`

const MenuTrigger = styled.div`
`

const Header = ({ siteTitle }) => (
  <StyledHeader>
    <InnerHeader>
      <LogoContainer>
        <LogoLink to="/">
          <LogoText>{siteTitle}</LogoText>
        </LogoLink>
      </LogoContainer>

      <MenuTrigger>
      </MenuTrigger>
    </InnerHeader>

    <StyledMenu></StyledMenu>
  </StyledHeader>
)

export default Header
