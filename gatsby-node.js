const fs = require("fs")
const path = require("path")

exports.onPostBuild = async ({ graphql }) => {
  await graphql(`
    {
      posts: allMarkdownRemark {
        edges {
          node {
            frontmatter {
              title
              date(formatString: "MM-DD-YYYY")
            }
            html
            fileAbsolutePath
          }
        }
      }
    }
  `).then(result => {
    const postsPath = "./public/posts"
    const posts = result.data.posts.edges.map(({ node }) => node)

    if (!fs.existsSync(postsPath)) fs.mkdirSync(postsPath)

    posts.map(post => {
      const slug = path.basename(
        post.fileAbsolutePath,
        path.extname(post.fileAbsolutePath)
      )

      const data = {
        ...post.frontmatter,
        slug: slug,
        body: post.html,
      }

      fs.writeFileSync(`${postsPath}/${slug}.json`, JSON.stringify(data))
    })
  })
}
