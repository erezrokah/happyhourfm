import axios from 'axios'
import path from 'path'
import { mkDir, mkFile } from './fs'
const fs = require('fs')
import { buildFeed, grabContents } from 'podcats'

/// config
const myURL = 'https://happyhour.fm'

const description =
  'a candid and open weekly discussion between Dennis and Erik over drinks'
const image = 'https://happyhour.fm/art.jpg' // TODO: itunes cover and opengraph image. you should customise this!
const ghURL = 'https://github.com/erikras/happyhourfm'
const rss = myURL + '/rss/index.xml'
const contentFolder = 'content'
const author = {
  name: 'Erik Rasmussen and Dennis Schrantz',
  email: 'happyhourdotfm@gmail.com',
  link: 'https://happyhour.fm',
}
const feedOptions = {
  // blog feed options
  title: 'Happy Hour with Dennis and Erik',
  description,
  link: myURL,
  id: myURL,
  copyright: 'Copyright – Erik Rasmussen and Dennis Schrantz',
  feedLinks: {
    atom: safeJoin(myURL, 'atom.xml'),
    json: safeJoin(myURL, 'feed.json'),
    rss: safeJoin(myURL, 'rss'),
  },
  author,
}
const iTunesChannelFields = {
  // itunes options
  summary: 'Happy Hour with Dennis and Erik',
  author: author.name,
  keywords: ['Comedy'],
  categories: [
    { cat: 'Comedy' },
    { cat: 'News & Politics' },
    { cat: 'Society & Culture', child: 'Philosophy' },
    { cat: 'Society & Culture', child: 'Places & Travel' },
    { cat: 'Sports & Recreation', child: 'TV & Film' },
  ],
  image,
  explicit: true,
  owner: author,
  type: 'episodic',
}

// preprocessing'
const filenames = fs.readdirSync(contentFolder).reverse() // reverse chron
const filepaths = filenames.map(file =>
  path.join(process.cwd(), contentFolder, file),
)
const contents = grabContents(filepaths, myURL)
const frontmatters = contents.map(c => c.frontmatter)
mkDir('/public/rss/')

// generate HTML
export default {
  plugins: [
    'react-static-plugin-styled-components',
    'react-static-plugin-typescript',
  ],
  entry: path.join(__dirname, 'src', 'index.tsx'),
  siteRoot: myURL,
  getSiteData: async () => {
    // generate RSS
    let feed = await buildFeed(
      contents,
      myURL,
      author,
      feedOptions,
      iTunesChannelFields,
    )
    mkFile('/public/rss/index.xml', feed.rss2())
    return {
      title: 'Happy Hour with Dennis and Erik',
      description,
      rss,
      frontmatters,
      ghURL,
      myURL,
      image,
      mostRecentEpisode: contents[0], // necessary evil to show on '/'
    }
  },
  getRoutes: async () => {
    return [
      {
        path: '/episode',
        getData: () => ({
          contents,
        }),
        children: contents.map(content => ({
          path: `/${content.frontmatter.slug}`,
          component: 'src/pages/episode',
          getData: () => ({
            content,
            myURL,
          }),
        })),
      },
    ]
  },
}

function safeJoin(a, b) {
  /** strip starting/leading slashes and only use our own */
  let a1 = a.slice(-1) === '/' ? a.slice(0, a.length - 1) : a
  let b1 = b.slice(0) === '/' ? b.slice(1) : b
  return `${a1}/${b1}`
}
