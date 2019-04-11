import React from 'react'
import { Grommet } from 'grommet'
import { createGlobalStyle } from 'styled-components'
import { withSiteData, withRouteData } from 'react-static'
import { Episode } from '../types'
import { theme } from '@src/Page'
import Header from '@src/components/Header'
import Player from '@src/components/Player'

const GlobalStyle = createGlobalStyle`
  body {
    padding: 0;
    margin: 0;
  }
`

type Props = {
  content: Episode
  title: string
  description: string
  myURL: string
  image: string
}
export default withSiteData(
  withRouteData(
    ({ content: episode, title, description, myURL, image }: Props) => {
      const img = episode.frontmatter.art
        ? `${myURL}/${episode.frontmatter.art}`
        : image
      return episode ? (
        <Grommet theme={theme}>
          <GlobalStyle />
          <Header
            noContent
            content={episode}
            siteData={{
              title,
              description,
              myURL: `${myURL}/${episode.frontmatter.slug}`,
              image: img,
            }}
          />
          <Player episode={episode} image={img} />
        </Grommet>
      ) : null
    },
  ),
)
