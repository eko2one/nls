import { Router } from 'express'
import {validateEvent, verifySignature, getEventHash, signEvent, relayInit} from 'nostr-tools'
import nostrConfig from '../configs/nostr.config'
import axios from 'axios'

const router = Router()

router.get('/', (req, res) => {
    return res.status(200).json({
      "message": "Hello World from nostr.ls API!"
    })
  })

router.post('/pre_pay_event', async (req, res) => {

    interface Payment {
        payment_hash: String,
        payment_request: String
    }

    let pre_event = req.body.event
    let payment : Payment
    if(pre_event === undefined ) {
        res.status(400).json({
            message: "Event required."
        })
    }

    let ok = validateEvent(pre_event)
    let veryOk = verifySignature(pre_event)

    if(!ok || !veryOk) {
        res.send(400).json({
            message: "Invalid event/signature"
        })
    }

    //  Create Payment
    try {
        var data = {
            "out":false,
            "amount": nostrConfig.lnbits.amount,
            "expiry": nostrConfig.lnbits.expiry,
            "memo":"nostr.ls",
            "unit":"sat",
        }

        var config = {
          method: 'post',
          url: nostrConfig.lnbits.host + '/api/v1/payments',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': nostrConfig.lnbits.key
          },
          data : JSON.stringify(data)
        }

        let response = await axios(config)
        payment = response.data

    } catch (error) {
        return res.status(500).json({
            error: error
        })
    }

    //  Prepare inv_event
    const invoice_data = {
        pre_event: pre_event.id,
        payment_hash: payment.payment_hash,
        paid: 0
    }

    //  Create inv_event
    let inv_event = {
        kind: 30000,    // Parameterized Replaceable Event
        tags:[
            ["p", pre_event.pubkey],
            ["d", "invoice"]
        ],
        created_at: Math.floor(Date.now() / 1000),
        content: JSON.stringify(invoice_data),
        pubkey: nostrConfig.pk,
        id: '',
        sig: ''
    }

    inv_event.id = getEventHash(inv_event)
    inv_event.sig = signEvent(inv_event, nostrConfig.sk)

    //  Publish inv_event to relay
    let inv_published = false
    let relay = relayInit(nostrConfig.relay)

    await relay.connect()

    relay.on('connect', () => {

        console.log(`connected to ${relay.url}`)
        //resolve(`connected to ${relay.url}`)
    })

    relay.on('error', () => {
        //console.log(`failed to connect to ${relay.url}`)
        //throw new Error(`failed to connect to ${relay.url}`)
        //reject(new Error(`failed to connect to ${relay.url}`))
        res.status(500).json({
            "message": "Could not connect to relay"
        })
    })

    let published = false

    async function publishRelay(relay: any) {
        return new Promise<void>( (resolve) => {

            let pub = relay.publish(inv_event)
            console.log('Attempting to publish event')

            pub.on('ok', () => {
                console.log(`${relay.url} has accepted our event`)
                relay.close()
                published = true
                resolve()
            })

            pub.on('failed', (reason: any) => {
                console.log(`failed to publish to ${relay.url}: ${reason}`)
                relay.close()
                throw new Error('error')

            })
        })
    }

    await publishRelay(relay)

    if(published) {
        return res.status(200).json({
            payment: payment.payment_hash

        })
    } else {
        return res.status(500).json({
            "message": "Invoice Event could not be published to relay."
        })
    }

})

router.get('/link/:shortid', (req,res) => {
    return res.status(200).json({
        "message": "Get link by short id: " + req.params.shortid
    })
})

router.post('/link',(req, res) => {

    let body = req.body

    let event = body.event
    let ok = validateEvent(event)
    let veryOk = verifySignature(event)

    if(ok && veryOk) {
        return res.status(200).json({
            "message": "Event is very ok"
        })
    }
})

export default router
