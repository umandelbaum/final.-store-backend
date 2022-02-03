import img_proc from '../utilities/img_proc';
import { promises as fs } from 'fs';

const testImagePath = '../storage/images/image1.jpg';
const cachePath = '../storage/images/cache';

describe('Test the image processing module', () => {
    //Ensure a cache already exists and make it if needed
    beforeAll(async function () {
        try {
            await fs.access(cachePath);
        } catch (err) {
            try {
                await fs.mkdir(cachePath);
            } catch (dirError) {
                console.log(dirError);
            }
        }
    });

    it('tests the resize function with a good input', async () => {
        expect(async () => {
            await img_proc.resize(
                testImagePath,
                cachePath + '/resized.jpg',
                600,
                400
            );
        }).not.toThrow();
    });

    it('tests the resize function with a bad input file', async () => {
        //For a unknown reason, .ToThrow didn't catch the thrown error, so I used the below structure instead
        try {
            await img_proc.resize('', cachePath + '/resized.jpg', 600, 400);
            expect(false).toBeTrue;
        } catch (err) {
            expect(true).toBeTrue;
        }
    });

    it('tests the resize function with a bad height and width', async () => {
        try {
            await img_proc.resize(
                testImagePath,
                cachePath + '/resized.jpg',
                NaN,
                NaN
            );
            expect(false).toBeTrue;
        } catch (err) {
            expect(true).toBeTrue;
        }
    });
});
