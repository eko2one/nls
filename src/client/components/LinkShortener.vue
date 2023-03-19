<template>
  <h1>short the web with nostr</h1>
  <form class="mt-5">
    <div class="mb-3">
        <div class="row g-2">
            <div class="col-12 col-md-10">
                <input v-model="link" class="form-control form-control-lg" type="text" placeholder="insert your link" aria-label="Insert your link">
            </div>
            <div class="col-12 col-md-2 d-grid">
                <button @click="start" type="button" class="btn btn-primary btn-lg">start</button>
            </div>
        </div>
    </div>
  </form>
</template>
<script lang="ts">
    import {
        validateEvent,
        verifySignature,
        signEvent,
        getEventHash,
        relayInit
    } from 'nostr-tools'
    export default {
        data() {
            return {
                link: 'https://bitcoin-basel.ch/'+Date.now(),   //  bind to input field
                relay_url: 'ws://127.0.0.1:8008/',  //  will be fetched from server
                //relay_url: 'wss://nos.lol',
                user: {
                    //  will be handleled over window.nostr
                    pk: '231bbbe32181feeea63147a2bf9f40f2820284b91070437548671e484428683a',
                    sk: '8a51dccd31538db6411c198cf387522524e4d58c10ea256f7ba3adfd1b1f98f7',
                },
                event: {}
            }
        },
        methods: {

            start(){
                this.processClientEvent()
            },

            async processClientEvent() {
                //  check if npub in localStorage
                //  check if user can sign (if is logged in)

                //  create client event (sign and verify included for now)
                this.createClientEvent()

                //  publish client event to relay
                await this.publishClientEvent(this.event)

                //
            },

            /**
             * processShorting()
             * 0. validate link input: not empty, is-url
             *
             * 1. process client event
             * 1.1 check if npub in localStorage / user logged in
             * 1.2 create nevent
             * 1.2 check if nsec in localStorage or trigger window.nostr
             * 1.3 sign nevent
             * 1.4 validate event and signature
             * 1.5 publish client_event to relay(s)
             * 1.6 send client_event to server
             *
             *
             * // 1.6 server-side 2.0
             * fetch client_event from relay(s) and validate
             * create invoice with lnbits api
             * add invoice data to table invoices (id, invoice, time, state, c_event_id, npub)
             * return invoice to client
             *
             * --- skip it for now ---
             * 2. Await payment
             * 2.1 Create QR Code from Invoice
             * 2.2 Send awaiting_payment request to server
             * 2.3 wait for SSE / or do this with websocket
             * --- continue with 3 ---
             *
             * 3. process server event
             * 3.1 check if invoice is paid websocket to lnbits
             * 3.1
             * 3.2 create, sign, validate nevent
             *
             * 3.3 publish nevent to relay(s)
             *
             *
             */

            createClientEvent() {

                console.log('Creating client event')
                let event = {
                    kind: 1,
                    created_at: Math.floor(Date.now() / 1000),
                    tags: [
                        //  add more tags to identify event later better
                        //  see nostr-ls-prototype notes
                    ],
                    content: this.link,
                    pubkey: this.user.pk,
                    id: '',
                    sig: ''
                }

                event.id = getEventHash(event)
                event.sig = signEvent(event, this.user.sk)

                let ok = validateEvent(event)
                console.log('Event valid? '+ok)

                let veryOk = verifySignature(event)
                console.log('Signature verified? '+veryOk)

                //  check if event & signature are valid
                if(!ok || !veryOk) {
                    throw new Error("Event is not ok.")
                }

                this.event = event

            },
            async publishClientEvent(event: any) {

                const relay = relayInit(this.relay_url)
                relay.on('connect', () => {
                    console.log(`connected to ${relay.url}`)
                })
                relay.on('error', () => {
                    console.log(`failed to connect to ${relay.url}`)
                })

                console.log('Trying to connect to relay')
                await relay.connect()

                let pub = relay.publish(event)
                console.log('Attempting to publish event')
                pub.on('ok', () => {
                    console.log(`${relay.url} has accepted our event`)
                    relay.close()
                    return true
                })

                pub.on('failed', (reason: any) => {
                    console.log(`failed to publish to ${relay.url}: ${reason}`)
                    relay.close()
                    return false
                })
            }
        }
    }
</script>
<style scoped>

</style>
