import { nexusPrismaPlugin } from 'nexus-prisma'
import { idArg, makeSchema, objectType, stringArg, subscriptionField, intArg } from 'nexus'
import { transformSchemaFederation } from 'graphql-transform-federation';
import Web3 from "web3";

if (process.env.NODE_ENV === 'development') {
    require('dotenv').config();
}

const ETH_RPC = process.env.INFURA_ROPSTEN_WSS
console.debug(ETH_RPC)
const web3 = new Web3(ETH_RPC);

const Operator = objectType({
    name: 'Operator',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const ContractDefinition = objectType({
    name: 'ContractDefinition',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const Contract = objectType({
    name: 'Contract',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const EventType = objectType({
    name: 'EventType',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const Event = objectType({
    name: 'Event',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const OracleAggregator = objectType({
    name: 'OracleAggregator',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const Query = objectType({
    name: 'Query',
    definition(t) {
        t.crud.operator();
        t.crud.operators();
        t.crud.contract();
        t.crud.contracts();
        t.crud.eventType();
        t.crud.eventTypes();
        t.crud.event();
        t.crud.events();
        t.crud.oracleAggregator();
        t.crud.oracleAggregators();
    },
})

const ContractSubscription = subscriptionField('ContractSubscription', {
    type: 'Event',
    args: {
        address: stringArg({ required: true }),
        name: stringArg({ required: true }),
        fromBlock: intArg({ default: 0 }),
        max: intArg({ default: 0 })
    },
    description: 'Subscribe to Contract Events.',
    subscribe: async (_, { address, name, fromBlock, max }, { pubsub, prisma }) => { //_, args, context

        console.debug(prisma)

        const contract = await prisma.contract.findOne({
            where: { address },
            include: {
                spec: true,
            }
        })
        const spec = contract.spec
        console.debug(contract)
        console.debug(spec)
        const abi = JSON.parse(spec.compilerOutput).abi
        const web3Contract = new web3.eth.Contract(abi, contract.address);

        let count = 0
        web3Contract.events[name]({ fromBlock }).on('data', (event: any) => {
            console.debug(event)
            if (!max || count++ < max) {
                const returnValues = JSON.stringify(event.returnValues)
                pubsub.publish("CONTRACT_EVENT", { ...event, returnValues });
            }
        })

        return pubsub.asyncIterator("CONTRACT_EVENT")
    },
    resolve: payload => payload
})

/*
const Mutation = objectType({
    name: 'Mutation',
    definition(t) {
        //console.debug(t.crud)
    },
})
*/

const schema = makeSchema({
    types: [
        Query,
        Operator,
        ContractDefinition,
        Contract,
        EventType,
        Event,
        OracleAggregator,
        ContractSubscription
    ],
    plugins: [nexusPrismaPlugin()],
    outputs: {
        schema: __dirname + '/../schema.graphql',
        typegen: __dirname + '/generated/nexus.ts',
    },
    typegenAutoConfig: {
        contextType: 'Context.Context',
        sources: [
            {
                source: '@prisma/client',//require.resolve('./generated/client'),
                alias: 'prisma',
            },
            {
                source: require.resolve('./context'),
                alias: 'Context',
            },
        ],
    },
})

const federatedSchema = transformSchemaFederation(schema, {
    Query: {
        extend: true,
    },
    Operator: {
        keyFields: ['id'],
        resolveReference(reference: any) {
            return null
        },
    },
})

export default federatedSchema;
