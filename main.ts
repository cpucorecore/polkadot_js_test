import {ApiPromise, Keyring, WsProvider} from "@polkadot/api";


const WEB_SOCKET = 'ws://localhost:9944';

const cli = async () => {
    const provider = new WsProvider(WEB_SOCKET);
    const api = await ApiPromise.create({provider:provider});
    await api.isReady;
    console.log("connect to substrate success");
    return api;
};

const transfer = async (api: ApiPromise) => {
    const k = new Keyring({type:'sr25519'});
    const alice = k.addFromUri('//Alice');
    const bob = k.addFromUri('//Bob');
    await api.tx.balances.transfer(bob.address, 1000)
        .signAndSend(alice, res=> {
            console.log(`Tx status:, ${res.status}`)
        })
}

const subAliceBalance = async (api: ApiPromise) => {
    const k = new Keyring({type:'sr25519'});
    const alice = k.addFromUri('//Alice');

    await api.query.system.account(alice.address, (aliceAcc: { data: { free: any; }; }) => {
        console.log('alice new balance:', aliceAcc.data.free.toHuman())
    })
}

const subPoeEvent = async (api:ApiPromise) => {
    await api.query.system.events((events: any[]) => {
        events.forEach((record: any)=> {
            const { event, phase } = record;
            const types = event.typeDef;

            const eventName = `${event.section}:${
                event.method
            }:: (phase=${phase.toString()})`;

            if(eventName.includes('poeModule')) {
                console.log(eventName)
            }
        })
    })
}
const main = async () => {
    const api = await cli();

    await subAliceBalance(api);
    await subPoeEvent(api);

    await transfer(api)

    // await api.disconnect();
}

main().then(()=> {
    console.log("finish")
})