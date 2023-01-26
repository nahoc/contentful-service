require('dotenv').config()

const app = require("express")();
const contentful = require('contentful-management');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer')
const upload = multer({
  dest: 'uploads/'
})

const CONTENTFUL_ENVIRONMENT_ID = 'master';
const CONTENTFUL_SPACE_ID = 'e2z03gbgxg1a';
const client = contentful.createClient({
  accessToken: process.env.VITE_CONTENTFUL_MANAGEMENT_TOKEN,
})

app.use(bodyParser.json());

app.use(cors({
  origin: '*',
  credentials: true
}));

app.get("/favicon.ico", (req, res) => {
  res.sendStatus(204);
});

app.post('/upload-image', upload.array('files'), async function (req, res, next) {
  const file = req.files[0]
  const fileStream = fs.createReadStream(`./uploads/${file.filename}`)

  await client
    .getSpace(CONTENTFUL_SPACE_ID)
    .then((space) => space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID))
    .then((environment) =>
      environment.createAssetFromFiles({
        fields: {
          title: {
            'en-US': file.originalname,
          },
          description: {
            'en-US': file.originalname,
          },
          file: {
            'en-US': {
              contentType: file.mimetype,
              fileName: file.originalname,
              file: fileStream,
            },
          },
        },
      }),
    )
    .then((asset) => asset.processForAllLocales())
    .then((asset) => asset.publish()).then(() => {
      // wipe file from uploads folder
      fs.unlink(file.path, (err) => {
        if (err) throw err;
      });

      res.status(200)
    })
    .catch((err) => {
      res.status(400).send(err)
    });

  res.end()
})

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server running on ${port}, http://localhost:${port}`);
});