const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}

const returnFirstTruthy = (arr, cb) => {
  if(!arr) return null;
  for(const item of arr) {
    const result = cb(item)
    if (result) return result
  }
}

exports.createSchemaCustomization = ({
  actions: {createTypes},
  schema
}) => {
  createTypes(
    schema.buildObjectType({
      name: "MarkdownRemarkFrontmatter",
      fields: {
        images: {
          type: `[ImageSharp]`,
          resolve: async (source, args, context, info) => {
            // Get the original contents of the frontmatter filename array
            const originalArray = context.defaultFieldResolver(source,args,context,info)
            // If there's no original contents, bail out early
            if(!originalArray) return null;
            if(originalArray.length === 0) return [];

            // Try running the query for files matching the provided names
            const query = await context.nodeModel.runQuery({
              query: {
                filter: {
                  sourceInstanceName: {eq: "assets"},
                  relativePath: {in: originalArray}
                }
              },
              type: "File"
            })

            if(query){
              // Map resolved nodes to their filenames so we can return them in original order
              const filenameSharpMap = {}

              for(const fileNode of query) {
                const imageSharpNode = returnFirstTruthy(
                  fileNode.children,
                  (id) => (context.nodeModel.getNodeById({
                    id,
                    type: "ImageSharp"
                  }))
                )
                if(imageSharpNode) {
                  filenameSharpMap[fileNode.relativePath] = imageSharpNode
                }
              }

              return originalArray.map((filename)=>filenameSharpMap[filename])
            } else {
              return null
            }
          }
        }
      }
    })
  )
}
