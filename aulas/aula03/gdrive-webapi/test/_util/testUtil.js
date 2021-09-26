import { Readable, Transform, Writable } from 'stream'
import {jest} from '@jest/globals'
export default class TestUtil{
    static generateReadableStream(data){
        return new Readable({
            objectMode: true,
            read(){
                for(const item of data){
                    this.push(item)
                }
                this.push(null)
            }
        })
    }

    static generateWritableStream(onData){
        return new Writable({
            objectMode: true,
            write(chunck, enconding, cb){
                onData(chunck)

                cb(null, chunck)
            }
        })
    }

    static generateTransformStream(onData){
        //relativo
        // async function *(source){
        //     for await (const chunck of data){
        //         yield chunck
        //     }
        // }

        return new Transform({
            objectMode: true,
            transform(chunck, enconding, cb){
                onData(chunck)
                cb(null, chunck)
            }
        })
    }
    static getTimeFromDate(dateString){
        return new Date(dateString).getTime()
    }

    static mockDateNow(mockImplementationPeriods){
        const now = jest.spyOn(global.Date, global.Date.now.name)
        mockImplementationPeriods.forEach(time => {
            now.mockReturnValueOnce(time)
        })
    }
}