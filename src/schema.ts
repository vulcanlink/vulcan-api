import { withFilter } from 'apollo-server'

import { nexusPrismaPlugin } from 'nexus-prisma'
import { idArg, makeSchema, objectType, stringArg, subscriptionField, intArg } from 'nexus'
import { transformSchemaFederation } from 'graphql-transform-federation';

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

const DiscordChannel = objectType({
    name: 'DiscordChannel',
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
        t.crud.event();
        t.crud.events();
        t.crud.oracleAggregator();
        t.crud.oracleAggregators();
        t.crud.discordChannel();
        t.crud.discordChannels();
    },
})

const ContractSubscription = subscriptionField('ContractSubscription', {
    type: 'Event',
    args: {
        address: stringArg(),
        event: stringArg(),
    },
    description: 'Subscribe to Contract Events.',
    subscribe: withFilter(
        (_, args, { pubsub, prisma }) => pubsub.asyncIterator("CONTRACT_EVENT"),
        async (payload, { address, event }, { pubsub, prisma }) => { //_, args, context
            return (!address || payload.address === address) &&
                (!event || payload.event === event);
        }),
    resolve: async (payload, args, { pubsub, prisma }) => {
        /**
         * const address = payload.address
        const contract = await prisma.contract.findOne({
            where: { address }
        })
        const oracleAggregator = await prisma.oracleAggregator.findOne({
            where: { contractAddress: address }
        })
        console.debug(contract)
        console.debug(oracleAggregator)
         */

        const returnValues = JSON.stringify(payload.returnValues)
        return { ...payload, returnValues }
    }
})


const Mutation = objectType({
    name: 'Mutation',
    definition(t) {
        t.crud.createOneDiscordChannel();
        t.crud.updateOneDiscordChannel();
        t.crud.updateManyDiscordChannel();
        t.crud.deleteOneDiscordChannel();
        t.crud.deleteManyDiscordChannel();
        t.crud.upsertOneDiscordChannel();
    },
})

let types;
if (process.env.USE_SUBSCRIPTIONS) {
    types = [
        Query,
        Mutation,
        Operator,
        ContractDefinition,
        Contract,
        Event,
        OracleAggregator,
        DiscordChannel,
        ContractSubscription
    ]
} else {
    types = [
        Query,
        Mutation,
        Operator,
        ContractDefinition,
        Contract,
        Event,
        OracleAggregator,
        DiscordChannel
    ]
}


const schema = makeSchema({
    types,
    plugins: [nexusPrismaPlugin({
        outputs: {
            typegen: __dirname + '/generated/nexus-prisma.ts',
        }
    })],
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
            }
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
