
import { describe, expect, jest, test, beforeEach } from '@jest/globals'
import fs from 'fs'
import FileHelper from '../../src/fileHelper'
import UploadHandler from '../../src/uploadHandler'
import TestUtil from '../_util/testUtil'
import {resolve} from 'path'
import {pipeline} from 'stream/promises'
import { logger } from '../../src/logger'

describe('#UploadHandler test suite', ()=>{
    const ioObj = {
        to: (id) => ioObj,
        emit: (event, message)=> {}
    }

    beforeEach(()=>{
        jest.spyOn(logger, 'info').mockImplementation()
    })
    describe("#registerEvents", ()=>{
        test('should call onFile and onFinish functions on Busboy instance',()=>{
            const uploadHandler = new UploadHandler({
                io: ioObj,
                socketId: '01'
            })
            jest.spyOn(uploadHandler, uploadHandler.onFile.name).mockResolvedValue()
            const headers ={
                'content-type': 'multipart/form-data; boundary='
            }
            const onFinish = jest.fn()
            const busboyInstance = uploadHandler.registerEvents(headers, onFinish)
            busboyInstance.listeners('finish')[0].call()
            const fileStream = TestUtil.generateReadableStream(['chunck', 'of', 'data'])
            // readable.on('data', msg => console.log('msg', msg ))
            busboyInstance.emit('file', 'fieldName', fileStream, 'fileName.txt')

            expect(uploadHandler.onFile).toHaveBeenCalled()
            expect(onFinish).toHaveBeenCalled()
        })
    })

    describe('#onFile', ()=>{
        test('given a starem file it should save on disk', async ()=>{
            const chuncks = ['hey', 'dude']
            const downloadsFolder = './tmp'

            const handler = new UploadHandler({
                io: ioObj,
                socketId: '01',
                downloadsFolder
            })

            const onData = jest.fn()
            const onTransform = jest.fn()

            jest.spyOn(fs, fs.createWriteStream.name).mockImplementation(()=> TestUtil.generateWritableStream(onData))
            jest.spyOn(handler, handler.handleFileBytes.name).mockImplementation(()=> TestUtil.generateTransformStream(onTransform))

            const params = {
                fieldName: 'video',
                file: TestUtil.generateReadableStream(chuncks),
                fileName: 'mockFile.mov'
            }

            await handler.onFile(...Object.values(params))

            expect(onData.mock.calls.join()).toEqual(chuncks.join())
            expect(onTransform.mock.calls.join()).toEqual(chuncks.join())

            const expectedFileName = resolve(handler.downloadsFolder, params.fileName)

            expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFileName)
        })
    })

    describe('#handleFileBytes', ()=>{
        test('should call emit function ant it is a transform stream', async ()=>{
            jest.spyOn(ioObj, ioObj.to.name)
            jest.spyOn(ioObj, ioObj.emit.name)

            const handler = new UploadHandler({
                io: ioObj,
                socketId: '01'
            })

            jest.spyOn(handler, handler.canExecute.name).mockReturnValueOnce(true)
            const messages = ["hello"]
            const source = TestUtil.generateReadableStream(messages)
            const onWrite = jest.fn()
            const target = TestUtil.generateWritableStream(onWrite)
            
            await pipeline(
                source,
                handler.handleFileBytes('fileName.txt'),
                target
            )

            expect(ioObj.to).toHaveBeenCalledTimes(messages.length)
            expect(ioObj.emit).toHaveBeenCalledTimes(messages.length)
            
            // se o handleFileBytes for um transform stream, nosso pipeline
            // vai continuar o processo, passando os dados para frente
            // e chamar nossa funcção no traget a cada chunck

            expect(onWrite).toHaveBeenCalledTimes(messages.length)
            expect(onWrite.mock.calls.join()).toEqual(messages.join())
        })

        test('given message timerDelay as 2 secs it should wmit only on two message during 3 seconds period', async ()=>{
            jest.spyOn(ioObj, ioObj.emit.name)
            const messageTimeDelay = 2000

            const day = '2021-07-01 01:01'
            //Date.now do this.lastMessageSentem handleBytes
            const onFirtLastMessageSent = TestUtil.getTimeFromDate(`${day}:01`)
            // Hello chegou
            const onFirstCanExecute = TestUtil.getTimeFromDate(`${day}:03`)
            const onSecondUpdateLastMessageSent = onFirstCanExecute

            // segundo Hello está fora da janela de tempo
            const onSecondCanExecute = TestUtil.getTimeFromDate(`${day}:04`)

             // word
             const onThirdCanExecute = TestUtil.getTimeFromDate(`${day}:05`) 


            TestUtil.mockDateNow([
                onFirtLastMessageSent,
                onFirstCanExecute,
                onSecondUpdateLastMessageSent,
                onSecondCanExecute,
                onThirdCanExecute 
                 
            ])

            const messages = ['hello', ' hello', 'word']
            const fileName = 'fileName.avi'
            const expectedMessageSent = 2

            const source = TestUtil.generateReadableStream(messages)

            const handler = new UploadHandler({
                io: ioObj,
                socketId: '01',
                messageTimeDelay
            })

            await pipeline(
                source,
                handler.handleFileBytes(fileName)
            )


            expect(ioObj.emit).toHaveBeenCalledTimes(expectedMessageSent)

            const [firstCall, secondCall] =ioObj.emit.mock.calls
            expect(firstCall).toEqual([handler.ON_UPLOAD_EVENT, {processedAlready: 'hello'.length, fileName}])
            expect(secondCall).toEqual([handler.ON_UPLOAD_EVENT, {processedAlready: messages.join('').length, fileName}])

        })
    })

    describe("#canExcute", ()=>{
      


        test('should return true when is later than specifield delay', ()=> {
            const timerDelay = 1000
            const uploadHandler = new UploadHandler({
                io: {},
                socketId: '',
                messageTimeDelay: timerDelay
            })
            const tickNow = TestUtil.getTimeFromDate('2021-07-01 00:00:03')
            const tickThreeSecondsBefore = TestUtil.getTimeFromDate('2021-07-01 00:00:00')
            TestUtil.mockDateNow([tickNow])
            
            const lastExecution = tickThreeSecondsBefore
            const result = uploadHandler.canExecute(lastExecution)
            expect(result).toBeTruthy()
        })
        test('should return false when isnt later than specifield delay',()=>{
            const timerDelay = 3000
            const uploadHandler = new UploadHandler({
                io: {},
                socketId: '',
                messageTimeDelay: timerDelay
            })
            const now = TestUtil.getTimeFromDate('2021-07-01 00:00:02')
            const lastExecution = TestUtil.getTimeFromDate('2021-07-01 00:00:01')
            TestUtil.mockDateNow([now])
            
            const result = uploadHandler.canExecute(lastExecution)
            expect(result).toBeFalsy()
        })
    })
})