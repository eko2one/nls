import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

const nostr = {
    relay: 'ws://127.0.0.1:8008',
    //relay: 'ws://nostream.localtest.me',
    //  use these for testing only - TBD: retrieve from .env
    pk: '67484120952ffaf5d1896c4f9e58ef38c91f4116bab89b9d87e1b91ba0add229',
    sk: '0be2b5f17cf71afc253a88a6a96c9d7a4edd0e2bde67385f452b735c9cb49279',
    lnbits: {
        host: 'https://lnbits.nostr.ls',
        amount: 1,
        expiry: 1000,
        key: process.env.LNBITS_API_KEY //  get from .env
    }
};

export default nostr
