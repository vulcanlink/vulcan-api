import { ApolloServer } from 'apollo-server'
import schema from './schema'
import { createContext } from './context'

import Web3 from "web3";

if (process.env.NODE_ENV === 'development') {
    require('dotenv').config();
}

const MAINNET_RPC = process.env.INFURA_MAINNET_WSS as string
const ROPSTEN_RPC = process.env.INFURA_ROPSTEN_WSS as string

const web3Mainnet = new Web3(MAINNET_RPC);
const web3Ropsten = new Web3(ROPSTEN_RPC);

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function main() {
    new ApolloServer({
        schema,
        context: createContext,
        subscriptions: {
            onConnect: (connectionParams, webSocket, context) => {
                console.debug('CONNECT')
                console.debug(connectionParams)
            },
            onDisconnect: (webSocket, context) => {
                console.debug('DISCONNECT')
            },
        }
    }).listen(
        { port: 4002 },
        async () => {
            console.log(
                `🚀 Server ready at: http://localhost:4002`,
            )
            console.debug(MAINNET_RPC)
            console.debug(ROPSTEN_RPC)
        }
    )

    //Initialize existing web3 subscriptions
    const { prisma, pubsub } = createContext()
    const oracleAggregators = await prisma.oracleAggregator.findMany({
        include: {
            Contract: {
                include: {
                    ContractDefinition: true
                }
            },
        }
    })

    const eventName = "AnswerUpdated"
    await Promise.allSettled(oracleAggregators.map(async (item) => {
        const spec = item.Contract.ContractDefinition!;
        const abi = JSON.parse(spec.compilerOutput).abi;
        const address = item.Contract.address
        const networkId = item.Contract.networkId

        let web3Contract;
        if (networkId === '1') {
            web3Contract = new web3Mainnet.eth.Contract(abi, address);
        } else { //if (networkId === '3')
            web3Contract = new web3Ropsten.eth.Contract(abi, address);
        }

        //console.debug(address)

        //Past events

        /*
        const pastEvents = await web3Contract.getPastEvents(eventName, { fromBlock: 0, toBlock: 'latest' })
        pastEvents.forEach(async (event: any) => {
            console.debug(`Past: ${event.id}`)
            await sleep(5000)
            pubsub.publish("CONTRACT_EVENT", { ...event });
        })*/
        /*
        const pastEvents = await web3Contract.getPastEvents(eventName, { fromBlock: 0, toBlock: 'latest' })
        for (let i = 0; i < pastEvents.length; i++) {
            await sleep(5000)
            const event = pastEvents[i]
            console.debug(`Past: ${event.id}`)
            pubsub.publish("CONTRACT_EVENT", { ...event });
        }
        */

        //New events
        const emitter = web3Contract.events[eventName]({ fromBlock: 'latest' })
        return new Promise((resolve, reject) => {
            emitter.on('data', (event: any) => {
                console.debug(`New: ${event.id} ${event.address}`)
                pubsub.publish("CONTRACT_EVENT", { ...event });
            });
            emitter.on('end', resolve);
            emitter.on('error', reject);
        });
    }));

}

main()
