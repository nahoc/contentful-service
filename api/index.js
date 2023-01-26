
require('dotenv').config()
const app = require("express")();
const contentful = require('contentful-management');
const cors = require('cors');

const CONTENTFUL_ENVIRONMENT_ID = 'master';
const CONTENTFUL_SPACE_ID = 'e2z03gbgxg1a';
const client = contentful.createClient({
  accessToken: process.env.VITE_CONTENTFUL_MANAGEMENT_TOKEN,
})

app.use(cors({
  origin: '*'
}));

app.get("/favicon.ico", (req, res) => {
  res.sendStatus(204);
});

app.post("/upload-image", async (req, res) => {
  const files = req.params.files
  const name = req.params.name

 await contentfulClient
    .getSpace(CONTENTFUL_SPACE_ID)
    .then((space) => space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID))
    .then((environment) =>
      environment.createAssetFromFiles({
        fields: {
          title: {
            'en-US': files[0].name,
          },
          description: {
            'en-US': name,
          },
          file: {
            'en-US': {
              contentType: files[0].type,
              fileName: files[0].name,
              file: files[0],
            },
          },
        },
      }),
    )
    .then((asset) => asset.processForAllLocales())
    .then((asset) => asset.publish()).then(() => {
      res.status(200)

    })
    .catch((err) => {
      res.status(400).send(err)
    });
    
    res.end()
}); 
 

app.get("/create", (req, res) => {
  console.log(req.params)
  //console.log(client)
  client.getSpace(CONTENTFUL_SPACE_ID)
  .then((space) => space.getEnvironments())
  .then((response) => {
    console.log(response.items)
  })
  .catch(console.error)
  /*const { variant = DEFAULT_VARIANT, size = DEFAULT_SIZE } = req.params;
  const explicitName = req.query.name || req.params.name;
  const name = explicitName || Math.random().toString();
  const colors = normalizeColors(req.query.colors || DEFAULT_COLORS);
  const square = req.query.hasOwnProperty("square");

  if (!VALID_VARIANTS.has(variant)) {
    return res.status(400).send("Invalid variant");
  }

  res.setHeader("Content-Type", "image/svg+xml");

  if (explicitName) {
    res.setHeader("Cache-Control", "max-age=0, s-maxage=2592000");
  } else {
    res.setHeader("Cache-control", "max-age=0, s-maxage=1");
  }

  const svg = renderToString(
    React.createElement(
      Avatar,
      {
        size,
        name,
        variant,
        colors,
        square,
      },
      null
    )
  );

  res.end(svg);*/
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on ${port}, http://localhost:${port}`);
});
