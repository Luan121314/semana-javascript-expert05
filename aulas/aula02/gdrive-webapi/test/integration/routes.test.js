
import { beforeAll, beforeEach, describe, jest, test, afterAll, expect } from '@jest/globals'
import FormData from 'form-data'
import fs from 'fs'
import { tmpdir } from 'os'
import { join, resolve } from 'path'
import { logger } from '../../src/logger'
import Routes from '../../src/routes'
import TestUtil from '../_util/testUtil'
describe('#Routes Integration Test', ()=>{

    let defaultDownloadFolder = ''
    beforeAll(async ()=>{
        defaultDownloadFolder = await fs.promises.mkdtemp(join(tmpdir(), 'downloads-'))
    })

    afterAll(async ()=>{
        await fs.promises.rm(defaultDownloadFolder, {recursive: true})
    })

    beforeEach(()=>{
        jest.spyOn(logger, 'info').mockImplementation()
    })
    describe('#getFileStatus', ()=> {
        const ioObj = {
            to: (id) => ioObj,
            emit: (event, message)=> {}
        }
       
    
     
        test('should upload file to the folder', async()=>{
            const fileName = 'avatar.jpeg'
            const fileStream = fs.createReadStream(resolve('test', 'integration','mocks', fileName ))
            const response = TestUtil.generateWritableStream(()=> {})

            const form = new FormData()
            form.append('photo', fileStream)


            const defaultParams = {
                request: Object.assign(form, {
                    headers:form.getHeaders(),
                    method: 'POST',
                    url: '?socketId=10'
                }),
                response: Object.assign(response, {
                    setHeader: jest.fn(),
                    writeHead: jest.fn(),
                    end: jest.fn()
                }),
                values: ()=> Object.values(defaultParams)
            }

            const routes = new Routes(defaultDownloadFolder)
            routes.setSocketInstance(ioObj)
            const dirBeforeRun = await fs.promises.readdir(defaultDownloadFolder)
            expect(dirBeforeRun).toEqual([])

            await routes.handler(...defaultParams.values()) 

            const dirAfterRun = await fs.promises.readdir(defaultDownloadFolder)
            expect(dirAfterRun).toEqual([fileName ])

            expect(defaultParams.response.writeHead).toHaveBeenCalledWith(200)
            
            const expectedResult = JSON.stringify({result: 'Files uploaded with sucess'})
            expect(defaultParams.response.end).toHaveBeenCalledWith(expectedResult)



        })
    })
})