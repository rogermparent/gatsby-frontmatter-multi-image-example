# Gatsby Multi-Image Frontmatter Field example

This is a quick edit of the offical Gatsby blog starter, turning the field named "images" into a special one that takes an array of filenames and returns their respective ImageSharp nodes.

It's a little slapdash, but it serves its function as a proof-of-concept.

Implementing this into your own site may take some alteration- check out the `createSchemaCustomization` method of `gatsby-node` to see how I implemented it here.

I added some example images to the "Hello World" post. Fire up the development server and check it out to see it in action!
