import nostrConfig from '../configs/nostr.config';
import { Router } from 'express'
import {
    relayInit,
    generatePrivateKey,
    getPublicKey
} from 'nostr-tools'

const router = Router()

router.get('/config', (req, res) => {

    return res.status(200).json({
        nostrConfig
    })
})

router.get('/keys', (req, res) => {

    let sk = generatePrivateKey() // `sk` is a hex string
    let pk = getPublicKey(sk) // `pk` is a hex string

    return res.status(200).json({
        "sk":sk,
        "pk":pk
    })
})

router.get('/events', async (req, res) => {

    const relay = relayInit(nostrConfig.relay)

    try {
        await relay.connect()
        console.log(`connected to ${relay.url}`)

        let events = await relay.list(
        [
          {
            kinds: [0, 1]
            }
        ])

        console.log('fetched events from relay')

        return res.status(200).json(events)

      } catch (error) {
        console.log(`failed to connect to ${relay.url}`)
        console.log(error)
        return res.json(relay)  // needs better error reporting
      }

})

export default router
