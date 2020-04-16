import { nexusPrismaPlugin } from 'nexus-prisma'
import { idArg, makeSchema, objectType, stringArg, subscriptionField, intArg } from 'nexus'

const bridgeTypes = objectType({
    name: 'bridge_types',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const externalInitiators = objectType({
    name: 'external_initiators',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const heads = objectType({
    name: 'heads',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const initiators = objectType({
    name: 'initiators',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const jobRuns = objectType({
    name: 'job_runs',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const jobSpecs = objectType({
    name: 'job_specs',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const runRequests = objectType({
    name: 'run_requests',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const runResults = objectType({
    name: 'run_results',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const serviceAgreements = objectType({
    name: 'service_agreements',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const taskRuns = objectType({
    name: 'task_runs',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const taskSpecs = objectType({
    name: 'task_specs',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const txAttempts = objectType({
    name: 'tx_attempts',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const txes = objectType({
    name: 'txes',
    definition(t) {
        Object.values(t.model).map((field: any) => { field() })
    }
})

const Query = objectType({
    name: 'Query',
    definition(t) {
        t.crud.bridgeTypes();
        t.crud.externalInitiators();
        t.crud.heads();
        t.crud.initiators();
        t.crud.jobRuns();
        t.crud.jobSpecs();
        t.crud.runRequests();
        t.crud.runResults();
        t.crud.serviceAgreements();
        t.crud.taskRuns();
        t.crud.taskSpecs();
        t.crud.txAttempts();
        t.crud.txes();
    },
})

/*
const Mutation = objectType({
    name: 'Mutation',
    definition(t) {
        //console.debug(t.crud)
    },
})
*/

export const schema = makeSchema({
    types: [
        Query,
        bridgeTypes,
        externalInitiators,
        heads,
        initiators,
        jobRuns,
        jobSpecs,
        runRequests,
        runResults,
        serviceAgreements,
        taskRuns,
        taskSpecs,
        txAttempts,
        txes],
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
