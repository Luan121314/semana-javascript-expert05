
import { describe, expect, jest, test } from '@jest/globals'
import fs from 'fs'
import FileHelper from '../../src/fileHelper'

describe('#FileHelper test suite', ()=>{
    describe('#getFileStatus', ()=>{
        test('it should return files sttauses in correct format', async ()=>{
            
            const statMock = {
                dev: 66306,
                mode: 33204,
                nlink: 1,
                uid: 1000,
                gid: 1000,
                rdev: 0,
                blksize: 4096,
                ino: 2115110,
                size: 162656,
                blocks: 320,
                atimeMs: 1631055689824.5933,
                mtimeMs: 1631055689692.5928,
                ctimeMs: 1631055689692.5928,
                birthtimeMs: 1631055689688.5925,
                atime: '2021-09-07T23:01:29.825Z',
                mtime: '2021-09-07T23:01:29.693Z',
                ctime: '2021-09-07T23:01:29.693Z',
                birthtime: '2021-09-07T23:01:29.689Z'
            }
            
            const mockUser = 'luan.correia'
            process.env.USER = mockUser
            const fileName = 'file.png'
            
            jest.spyOn(fs.promises,fs.promises.stat.name).mockResolvedValue(statMock)
            jest.spyOn(fs.promises,fs.promises.readdir.name).mockResolvedValue([fileName])
            
            const result = await FileHelper.getFileStatus('/tmp')
            
            const expectedResults = [
                {
                    size: '163 kB',
                    lastModified: statMock.birthtime,
                    owner: mockUser,
                    file:fileName
                }
            ]
            
            expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${fileName}`)
            expect(result).toMatchObject(expectedResults)
            
        })
    })
})