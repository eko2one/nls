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
        <div v-if="paymentRequired" class="row g-2 mt-5">
            <div class="col-12 col-md-6 mb-3">
                <qrcode-vue style="width:100%;" :size="350" :value="payment" render-as="svg" level="L" />
            </div>
            <div class="col-12 col-md-6 mb-3">
                <div class="card">
                    <div class="card-header"><small class="text-secondary">Payment required</small></div>
                    <div class="card-body">
                        Foo bar
                    </div>
                </div>
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
    import QrcodeVue from 'qrcode.vue'

    export default {
        components: {
            QrcodeVue,
        },
        data() {
            return {
                link: 'https://bitcoin-basel.ch/'+Date.now(),   //  bind to input field
                relay_url: 'ws://127.0.0.1:8008/',  //  will be fetched from server
                //relay_url: 'wss://nos.lol',
                user: {
                    //  will be handleled over window.nostr (https://github.com/nostr-protocol/nips/blob/master/07.md)
                    //  or localStorage
                    pk: '231bbbe32181feeea63147a2bf9f40f2820284b91070437548671e484428683a',
                    sk: '8a51dccd31538db6411c198cf387522524e4d58c10ea256f7ba3adfd1b1f98f7',
                },
                relay: {},
                event_1: {},
                paymentRequired: false,
                payment: '',
                event_2: {}
            }
        },
        methods: {

            async start(){

                try {
                    this.createEvent_1()

                    this.relay = relayInit(this.relay_url)

                    await this.connectRelay(this.relay)
                    await this.publishEvent(this.relay, this.event_1)

                    await this.sendEventToServer()
                    console.log('did wait?')

                } catch (error) {
                    console.log('something went wrong')
                    console.log(error)
                }


            },

            createEvent_1(){

                let event = {
                    kind: 1000, // regular event
                    tags:[],
                    created_at: Math.floor(Date.now() / 1000),
                    content: this.link,
                    pubkey: this.user.pk,
                    id: '',
                    sig: ''
                }

                event.id = getEventHash(event)
                event.sig = signEvent(event, this.user.sk)

                let ok = validateEvent(event)
                let veryOk = verifySignature(event)

                if(!ok || !veryOk) {
                    throw new Error("Event is not ok.")
                }

                this.event_1 = event
                console.log('Created Event 1')

            },
            async connectRelay(relay: any) {

                await relay.connect()

                relay.on('connect', () => {

                    console.log(`connected to ${relay.url}`)
                    //resolve(`connected to ${relay.url}`)
                })
                relay.on('error', () => {
                    //console.log(`failed to connect to ${relay.url}`)
                    throw new Error(`failed to connect to ${relay.url}`)
                    //reject(new Error(`failed to connect to ${relay.url}`))
                })

            },

            publishEvent(relay: any, event: any) {
                return new Promise<void>( (resolve) => {

                    let pub = relay.publish(event)
                    console.log('Attempting to publish event')

                    pub.on('ok', () => {
                        console.log(`${relay.url} has accepted our event`)
                        relay.close()
                        console.log('Relay closed.')
                        resolve()
                    })

                    pub.on('failed', (reason: any) => {
                        console.log(`failed to publish to ${relay.url}: ${reason}`)
                        relay.close()
                        console.log('Relay closed.')
                        throw new Error('Failed to publish to relay')
                    })

                })
            },

            async sendEventToServer() {
                console.log('sending to server')
                const url = "/api/pre_pay_event";   //  Event_1
                const options = {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    body: JSON.stringify({
                        event: this.event_1
                    }),
                };

                fetch(url, options)
                .then((response) => response.json())
                .then((data) => {
                    this.payment = data.payment
                    this.paymentRequired = true
                    console.log(data);
                });
            },
        }
    }
</script>
<style scoped>

</style>
