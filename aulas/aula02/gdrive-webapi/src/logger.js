import pino from 'pino'

const logger = pino({
    prettyPrint: {
        ignore: 'pid,hosname'
    }
})

export {
    logger
}