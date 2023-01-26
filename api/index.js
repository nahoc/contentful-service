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
app.delete('/delete-project/:id/:token', async function (req, res) {
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

// update project endpoint
app.post('/update-project/:id/:token', async function (req, res) {
  const idToUpdate = req.params.id
  const signature = req.params.token
  const body = req.body

  if (!signature) {
    throw '';
  }

  await client
    .getSpace(CONTENTFUL_SPACE_ID)
    .then((space) => space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID))
    .then((environment) => environment.getEntry(idToUpdate))
    .then((entry) => {
      if (signature === entry.fields.signature?.['en-US'] && body.account === entry.fields.owner?.['en-US']) {
        entry.fields.color = {
          ['en-US']: body.data.color || entry.fields.color?.['en-US']
        };
        entry.fields.description = {
          ['en-US']: body.data.description || entry.fields.description?.['en-US']
        };
        entry.fields.descriptionLong = {
          ['en-US']: body.data.descriptionLong || entry.fields.descriptionLong?.['en-US']
        };
        entry.fields.discord = {
          ['en-US']: body.data.discord || entry.fields.discord?.['en-US']
        };
        entry.fields.docs = {
          ['en-US']: body.data.docs || entry.fields.docs?.['en-US']
        };
        entry.fields.github = {
          ['en-US']: body.data.github || entry.fields.github?.['en-US']
        };
        entry.fields.medium = {
          ['en-US']: body.data.medium || entry.fields.medium?.['en-US']
        };
        entry.fields.name = {
          ['en-US']: body.data.name || entry.fields.name?.['en-US']
        };
        entry.fields.priceTracker = {
          ['en-US']: body.data.priceTracker || entry.fields.priceTracker?.['en-US']
        };
        entry.fields.reddit = {
          ['en-US']: body.data.reddit || entry.fields.reddit?.['en-US']
        };
        entry.fields.telegram = {
          ['en-US']: body.data.telegram || entry.fields.telegram?.['en-US']
        };
        entry.fields.tokenContract = {
          ['en-US']: body.data.tokenContract || entry.fields.tokenContract?.['en-US']
        };
        entry.fields.twitter = {
          ['en-US']: body.data.twitter || entry.fields.twitter?.['en-US']
        };
        entry.fields.website = {
          ['en-US']: body.data.website || entry.fields.website?.['en-US']
        };
        entry.fields.youtube = {
          ['en-US']: body.data.youtube || entry.fields.youtube?.['en-US']
        };
        entry.fields.tags = {
          ['en-US']: body.data.tagsIds.map((tagId) => ({
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: tagId,
            },
          })) || entry.fields.tags?.['en-US'],
        };

        if (body.data.bannerAsset) {
          entry.fields.banner = {
            ['en-US']: {
              sys: {
                id: body.data.bannerAsset.sys.id,
                linkType: 'Asset',
                type: 'Link'
              }
            }
          };
        }

        if (body.data.avatarAsset) {
          entry.fields.logo = {
            ['en-US']: {
              sys: {
                id: body.data.avatarAsset.sys.id,
                linkType: 'Asset',
                type: 'Link'
              }
            }
          };
        }

        return entry.update();
      } else {
        throw t('You need to be the owner of the project to request changes');
      }
    })
    .then(() => res.sendStatus(200))
    .catch((err) => res.status(400).send(err))

  res.end()
})

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server running on ${port}, http://localhost:${port}`);
});