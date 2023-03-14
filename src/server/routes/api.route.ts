import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
    return res.status(200).json({
      "message": "Hello World from nostr.ls API!"
    })
  })

router.get('/link/:short', (req,res) => {
    return res.status(200).json({
        "message": "Get link by short string"
    })
})

export default router
