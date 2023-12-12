require('dotenv').config()
const express = require("express")
const contentful = require('contentful-management')
const slugify = require('slugify');
const cors = require('cors')
const fs = require('fs')
const bodyParser = require('body-parser')
const sharp = require('sharp')
const multer = require('multer')
const lodash = require('lodash')
const app = express()
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
const CHAIN_ASSETS_CONTENTFUL_SPACE_ID = 'gcj8jwzm6086';
const LAUNCHING_SOON_TAG_ID = '6aqUeTrvxRNKZsHKV2RHPs'
const client = contentful.createClient({
  accessToken: process.env.VITE_CONTENTFUL_MANAGEMENT_TOKEN,
})


app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(bodyParser.text());

// upload image endpoint
app.post('/upload-image', upload.array('files'), async function (req, res, next) {
  const file = req.files[0]
  const isBanner = req.body.isBanner === 'true'
  const isChainAssets = req.body.isChainAssets === 'true'

  if (file) {
    const fileStream = fs.createReadStream(`/tmp/${file.filename}`)

    const resizePipeline = sharp()
  .resize({
    width: isBanner ? 1920 : 256,
    height: isBanner ? 720 : 256,
    fit: 'inside', // Preserve aspect ratio, fit within specified dimensions
  })

  const resizedFileStream = await fileStream.pipe(resizePipeline)


    await client
      .getSpace(isChainAssets ? CHAIN_ASSETS_CONTENTFUL_SPACE_ID : CONTENTFUL_SPACE_ID)
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
                file: resizedFileStream,
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
app.delete('/delete-project/:id', async function (req, res) {
  const body = JSON.parse(req.body)
  const idToDelete = req.params.id
  const signature = body.signature

  if (!signature) {
    throw 'No signature';
  }

  await client
    .getSpace(CONTENTFUL_SPACE_ID)
    .then((space) => space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID))
    .then((environment) => environment.getEntry(idToDelete))
    .then((entry) => {
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
app.post('/update-project/:id', async function (req, res) {
  const body = JSON.parse(req.body)
  const idToUpdate = req.params.id
  const signature = body.signature

  if (!signature) {
    throw 'No signature';
  }

  await client
    .getSpace(CONTENTFUL_SPACE_ID)
    .then((space) => space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID))
    .then((environment) => environment.getEntry(idToUpdate))
    .then((entry) => {
      if (body.account === entry.fields.owner?.['en-US'] && (signature === entry.fields.signature?.['en-US'] || entry.fields.signature?.['en-US'] === 'todo')) {
        entry.fields.color = {
          ['en-US']: body.data.color || entry.fields.color?.['en-US']
        };
        entry.fields.signature = {
          ['en-US']: signature || entry.fields.signature?.['en-US']
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
        entry.fields.chainId = {
          ['en-US']: body.data.chainId || entry.fields.chainId?.['en-US']
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
        entry.fields.linkedIn = {
          ['en-US']: body.data.linkedIn || entry.fields.linkedIn?.['en-US']
        };
        entry.fields.explorer = {
          ['en-US']: body.data.explorer || entry.fields.explorer?.['en-US']
        };
        entry.fields.instagram = {
          ['en-US']: body.data.instagram || entry.fields.instagram?.['en-US']
        };
        entry.fields.facebook = {
          ['en-US']: body.data.facebook || entry.fields.facebook?.['en-US']
        };
        entry.fields.tags = {
          'en-US': lodash.uniqBy([...body.data.tagsIds.filter(o => o !== LAUNCHING_SOON_TAG_ID).map((tagId) => ({
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: tagId,
            },
          })), ...(body.data.status === 'development' ? [{
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: LAUNCHING_SOON_TAG_ID,
            }
          }] : [])], 'sys.id'),
        };

        if (body.bannerAsset) {
          entry.fields.banner = {
            ['en-US']: {
              sys: {
                id: body.bannerAsset.sys.id,
                linkType: 'Asset',
                type: 'Link'
              }
            }
          };
        }

        if (body.avatarAsset) {
          entry.fields.logo = {
            ['en-US']: {
              sys: {
                id: body.avatarAsset.sys.id,
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


// create project endpoint
app.post('/create-project', async function (req, res) {
  const body = JSON.parse(req.body)
  const signature = body.signature

  if (!signature || !body.account) {
    throw 'No signature';
  }

  await client
    .getSpace(CONTENTFUL_SPACE_ID)
    .then((space) => space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID))
    .then((environment) =>
      environment.createEntry('project', {
        fields: {
          slug: {
            'en-US': slugify(body.data.name, {
              lower: true,
            }),
          },
          owner: {
            'en-US': body.account
          }, // the 0x address that owns this project submission
          ...(signature && {
            signature: {
              'en-US': signature
            }
          }),
          ...(body.data.color && {
            color: {
              'en-US': body.data.color
            }
          }),
          ...(body.data.description && {
            description: {
              'en-US': body.data.description
            }
          }),
          ...(body.data.descriptionLong && {
            descriptionLong: {
              'en-US': body.data.descriptionLong
            }
          }),
          ...(body.data.discord && {
            discord: {
              'en-US': body.data.discord
            }
          }),
          ...(body.data.docs && {
            docs: {
              'en-US': body.data.docs
            }
          }),
          ...(body.data.github && {
            github: {
              'en-US': body.data.github
            }
          }),
          ...(body.data.medium && {
            medium: {
              'en-US': body.data.medium
            }
          }),
          ...(body.data.name && {
            name: {
              'en-US': body.data.name
            }
          }),
          ...(body.data.priceTracker && {
            priceTracker: {
              'en-US': body.data.priceTracker
            }
          }),
          ...(body.data.reddit && {
            reddit: {
              'en-US': body.data.reddit
            }
          }),
          ...(body.data.telegram && {
            telegram: {
              'en-US': body.data.telegram
            }
          }),
          ...(body.data.tokenContract && {
            tokenContract: {
              'en-US': body.data.tokenContract
            }
          }),
          ...(body.data.chainId && {
            chainId: {
              'en-US': body.data.chainId
            }
          }),
          ...(body.data.twitter && {
            twitter: {
              'en-US': body.data.twitter
            }
          }),
          ...(body.data.website && {
            website: {
              'en-US': body.data.website
            }
          }),
          ...(body.data.explorer && {
            explorer: {
              'en-US': body.data.explorer
            }
          }),
          ...(body.data.facebook && {
            facebook: {
              'en-US': body.data.facebook
            }
          }),
          ...(body.data.linkedIn && {
            linkedIn: {
              'en-US': body.data.linkedIn
            }
          }),
          ...(body.data.instagram && {
            instagram: {
              'en-US': body.data.instagram
            }
          }),
          ...(body.data.youtube && {
            youtube: {
              'en-US': body.data.youtube
            }
          }),
          ...(body.data.tagsIds && {
            tags: {
              'en-US': [...body.data.tagsIds.map((tagId) => ({
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: tagId,
                },
              })), ...(body.data.status === 'development' ? [{
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: LAUNCHING_SOON_TAG_ID,
                }
              }] : [])],
            },
          }),
          ...(body.bannerAsset &&
            body.bannerAsset.fields.file['en-US'] && {
              banner: {
                'en-US': {
                  sys: {
                    id: body.bannerAsset.sys.id,
                    linkType: 'Asset',
                    type: 'Link'
                  }
                },
              },
            }),
          ...(body.avatarAsset &&
            body.avatarAsset.fields.file['en-US'] && {
              logo: {
                'en-US': {
                  sys: {
                    id: body.avatarAsset.sys.id,
                    linkType: 'Asset',
                    type: 'Link'
                  }
                },
              },
            }),
        },
      }),
    )
    .then(() => res.sendStatus(200))
    .catch((err) => {
      console.error(err)
      return res.status(400).send(err)
    })

  res.end()
})


// create public explorer entry endpoint
app.post('/create-public-explorer', async function (req, res) {
  console.log('HERE111')
  console.log('req.body', req.body)
  const body = JSON.parse(req.body)
  console.log('body', req.body)
  const signature = body.signature

  if (!signature || !body.account) {
    throw 'No signature';
  }

  let networkTokenContentfulId = ''
  let subnetContentfulId = ''
  let ethereumVmContentfulId = ''

// creating eth vm
ethereumVmContentfulId = await client
  .getSpace(CHAIN_ASSETS_CONTENTFUL_SPACE_ID)
  .then((space) => space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID))
  .then((environment) => 
    environment.createEntry('ethereumVm', {
      fields: {
        evmChainId: {
          'en-US': body.evmChainId
        },
        rpcUrl: {
          'en-US': body.rpcUrl
        },
        multicall3Address: {
          'en-US': body.multicall3Address
        },
        wsUrl: {
          'en-US': body.wsUrl
        },
      }
    }))
    .then((contentfulResult) => {
      return contentfulResult.sys.id
    })
    .catch((err) => {
      console.error(err)
      return res.status(400).send(err)
    })

// creating subnet
subnetContentfulId = await client
  .getSpace(CHAIN_ASSETS_CONTENTFUL_SPACE_ID)
  .then((space) => space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID))
  .then((environment) => 
    environment.createEntry('subnet', {
      fields: {
        name: {
          'en-US': body.subnetName
        },
        subnetId: {
          'en-US': body.subnetId
        },
        platformChainId: {
          'en-US': body.platformChainId
        },
        vmId: {
          'en-US': body.vmId
        },
      }
    })
    .then((contentfulResult) => {
      return contentfulResult.sys.id
    })
    .catch((err) => {
      console.error(err)
      return res.status(400).send(err)
    }))

// creating network token
networkTokenContentfulId = await client
  .getSpace(CHAIN_ASSETS_CONTENTFUL_SPACE_ID)
  .then((space) => space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID))
  .then((environment) => 
    environment.createEntry('networkToken', {
      fields: {
        name: {
          'en-US': body.tokenName
        },
        symbol: {
          'en-US': body.symbol
        },
        decimals: {
          'en-US': 18
        },
        description: {
          'en-US': body.description
        },
        coingeckoCoinId: {
          'en-US': ''
        },
        ...(body.avatarAsset &&
          body.avatarAsset.fields.file['en-US'] && {
            logo: {
              'en-US': {
                sys: {
                  id: body.avatarAsset.sys.id,
                  linkType: 'Asset',
                  type: 'Link'
                }
              },
            },
          }),
      }
    })
    .then((contentfulResult) => {
      return contentfulResult.sys.id
    })
    .catch((err) => {
      console.error(err)
      return res.status(400).send(err)
    }))


// creating testnet chain
  await client
  .getSpace(CHAIN_ASSETS_CONTENTFUL_SPACE_ID)
  .then((space) => space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID))
  .then((environment) => 
    environment.createEntry('chain', {
      fields: {
        name: {
          'en-US': body.subnetName
        },
        shortName: {
          'en-US': body.subnetName
        },
        description: {
          'en-US': body.description
        },
        coreUriSlug: {
          'en-US': slugify(body.coreUriSlug.replaceAll("'", ""), {
            lower: true,
          }),
        },
        explorerUrl: {
          'en-US': `https://subnets-test.avax.network/${slugify(body.coreUriSlug.replaceAll("'", ""), {
            lower: true,
          })}`,
        },
        isTestnet: {
          'en-US': true
        },
        showInPublicCoreProperties: {
          'en-US': false,//TODO: change this whenever we're ready
        },
        primaryColor: {
          'en-US': body.primaryColor
        },
        officialSite: {
          'en-US': body.officialSite
        },
        networkToken: {
          ['en-US']: {
            sys: {
              id: networkTokenContentfulId, 
              linkType: 'Entry',
              type: 'Link'
            }
          }
        },
        vmInfo: {
          ['en-US']: {
            sys: {
              id: ethereumVmContentfulId, 
              linkType: 'Entry',
              type: 'Link'
            }
          }
        },
        subnetInfo: {
          ['en-US']: {
            sys: {
              id: subnetContentfulId, 
              linkType: 'Entry',
              type: 'Link'
            }
          }
        },
        ...(body.avatarAsset &&
          body.avatarAsset.fields.file['en-US'] && {
            logo: {
              'en-US': {
                sys: {
                  id: body.avatarAsset.sys.id,
                  linkType: 'Asset',
                  type: 'Link'
                }
              },
            },
          }),
      }
    })
    .then(() => res.sendStatus(200))
    .catch((err) => {
      console.error(err)
      return res.status(400).send(err)
    }))

  res.end()
})


// create news endpoint
app.post('/create-news', async function (req, res) {
  const body = JSON.parse(req.body)

  await client
    .getSpace(CONTENTFUL_SPACE_ID)
    .then((space) => space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID))
    .then((environment) =>
      environment.createEntry('news', {
        fields: {
          ...(body.data.url && {
            url: {
              'en-US': body.data.url
            }
          }),
          ...(body.data.headline && {
            headline: {
              'en-US': body.data.headline
            }
          }),
          ...(body.data.thumbnailUrl && {
            thumbnailUrl: {
              'en-US': body.data.thumbnailUrl
            }
          }),
          ...(body.data.headline && {
            headline: {
              'en-US': body.data.headline
            }
          }),
          ...(body.data.faviconUrl && {
            faviconUrl: {
              'en-US': body.data.faviconUrl
            }
          }),
          ...(body.data.providerName && {
            providerName: {
              'en-US': body.data.providerName
            }
          }),
        },
      }),
    )
    .then(() => res.sendStatus(200))
    .catch((err) => {
      console.error(err)
      return res.status(400).send(err)
    })

  res.end()
})

// create education article endpoint
app.post('/create-education-article', async function (req, res) {
  const body = JSON.parse(req.body)

  await client
    .getSpace(CONTENTFUL_SPACE_ID)
    .then((space) => space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID))
    .then((environment) =>
      environment.createEntry('educationArticle', {
        fields: {
          slug: {
            'en-US': slugify(body.data.headline, {
              lower: true,
            }),
          },
          ...(body.data.url && {
            url: {
              'en-US': body.data.url
            }
          }),
          ...(body.data.headline && {
            headline: {
              'en-US': body.data.headline
            }
          }),
          ...(body.data.thumbnailUrl && {
            thumbnailUrl: {
              'en-US': body.data.thumbnailUrl
            }
          }),
          ...(body.data.headline && {
            headline: {
              'en-US': body.data.headline
            }
          }),
          ...(body.data.faviconUrl && {
            faviconUrl: {
              'en-US': body.data.faviconUrl
            }
          }),
          ...(body.data.providerName && {
            providerName: {
              'en-US': body.data.providerName
            }
          }),
        },
      }),
    )
    .then(() => res.sendStatus(200))
    .catch((err) => {
      console.error(err)
      return res.status(400).send(err)
    })

  res.end()
})


app.get("/favicon.ico", (req, res) => {
  res.sendStatus(204);
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server running on ${port}, http://localhost:${port}`);
});