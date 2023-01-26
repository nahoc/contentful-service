require('dotenv').config()

const app = require("express")();
const contentful = require('contentful-management');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp')
  },
})
const upload = multer({
  storage: storage
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

// upload image endpoint
app.post('/upload-image', upload.array('files'), async function (req, res, next) {
  const file = req.files[0]

  if (file) {
    const fileStream = fs.createReadStream(`/tmp/${file.filename}`)

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
      .then((asset) => asset.publish()).then((asset) => {
        // wipe file from uploads folder
        fs.unlink(file.path, (err) => {
          if (err) throw err;
        });

        res.status(200).send(asset)
      })
      .catch((err) => res.status(400).send(err));
  }

  res.end()
})

// delete project endpoint
app.delete('/delete-project/:id/:token', async function(req, res) {
  const idToDelete = req.params.id
  const signature = req.params.token

  if (!signature) {
    throw '';
  }

  await client
    .getSpace(CONTENTFUL_SPACE_ID)
    .then((space) => space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID))
    .then((environment) => environment.getEntry(idToDelete))
    .then(async (entry) => {
      if (signature !== entry.fields.signature?.['en-US']) {
        throw t('You are not authorized to delete this project');
      }

      return entry.unpublish();
    })
    .then((entry) => entry.archive()) // we archive, but say we delete in case they really want to revert
    .then(() => res.sendStatus(200))
    .catch((err) => res.status(400).send(err))

  res.end()
})

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server running on ${port}, http://localhost:${port}`);
});