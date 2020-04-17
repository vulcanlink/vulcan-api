import { ApolloServer } from 'apollo-server'
import schema from './schema'
import { createContext } from './context'

import Web3 from "web3";

if (process.env.NODE_ENV === 'development') {
    require('dotenv').config();
}

const ETH_RPC = process.env.INFURA_ROPSTEN_WSS
const web3 = new Web3(ETH_RPC);

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function main() {
    new ApolloServer({ schema, context: createContext }).listen(
        { port: 4002 },
        async () => {
            console.log(
                `🚀 Server ready at: http://localhost:4002`,
            )
            console.debug(ETH_RPC)
        }
    )

    //Initialize existing web3 subscriptions
    const { prisma, pubsub } = createContext()
    const oracleAggregators = await prisma.oracleAggregator.findMany({
        include: {
            contract: {
                include: {
                    spec: true
                }
            },
        }
    })

    const eventName = "AnswerUpdated"
    await Promise.allSettled(oracleAggregators.map(async (item) => {
        const spec = item.contract.spec;
        const abi = JSON.parse(spec.compilerOutput).abi;
        const web3Contract = new web3.eth.Contract(abi, item.contract.address);
        console.debug(item.contract.address)

        //Past events


        const pastEvents = await web3Contract.getPastEvents(eventName, { fromBlock: 0, toBlock: 'latest' })
        /*
        pastEvents.forEach(async (event: any) => {
            console.debug(`Past: ${event.id}`)
            await sleep(5000)
            pubsub.publish("CONTRACT_EVENT", { ...event });
        })*/

        for (let i = 0; i < pastEvents.length; i++) {
            //await sleep(5000)
            const event = pastEvents[i]
            console.debug(`Past: ${event.id}`)
            pubsub.publish("CONTRACT_EVENT", { ...event });
        }

        //New events
        const emitter = web3Contract.events[eventName]({ fromBlock: 'latest' })
        return new Promise((resolve, reject) => {
            emitter.on('data', (event: any) => {
                console.debug(`New: ${event.id}`)
                pubsub.publish("CONTRACT_EVENT", { ...event });
            });
            emitter.on('end', resolve);
            emitter.on('error', reject);
        });
    }));

    console.debug('DONE')

}

main()
