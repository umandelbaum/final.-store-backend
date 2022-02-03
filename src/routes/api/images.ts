import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import img_proc from '../../utilities/img_proc';

const images = express.Router();
const imagesPath = '../storage/images';
const cachePath = '../storage/images/cache';

//Returns a list of the images in storage
images.get(
    '/',
    async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            const filelist = await fs.readdir(imagesPath);
            let responseBody = 'Files in storage:<br>';
            filelist.forEach(
                (filename: string) => (responseBody += filename + '<br>')
            );
            responseBody +=
                '<br>To view a file, access api/images/filename. Include the file extension.<br>';
            responseBody +=
                'To resize a file, access api/images/filename?height=newheight&width=newwidth. Again, include the file extension.<br>';
            responseBody += 'Make sure height and width are integers.';
            res.status(200).send(responseBody);
        } catch (err) {
            console.log(err);
            res.status(500).send("Files couldn't be read");
        }
    }
);

//Returns the filename.
//If width and height are supplied parameters then returns a resized file
//If only one of width or height are supplied, ignores the other
images.get(
    '/:id',
    async (req: express.Request, res: express.Response): Promise<void> => {
        //Get width and height parameters, if they exist
        let width = 0;
        let height = 0;
        const resize_flag = req.query.width && req.query.height;

        //Perfrom error checking on width/height
        if (resize_flag) {
            width = Number(req.query.width);
            height = Number(req.query.height);
            if (isNaN(width) || isNaN(height)) {
                res.status(422).send(
                    'Height and width parameters must be integers'
                );
                return;
            }
        }

        //Next determine if the requested file exists
        try {
            const filelist = await fs.readdir(imagesPath);
            if (!filelist.includes(req.params.id)) {
                res.status(404).send('Requested file not found in storage');
            }
            //Next, do the easy thing of sending the original file if that is what is requested
            else if (!resize_flag) {
                res.status(200).sendFile(req.params.id, { root: imagesPath });
            }
            //Finally, do the hard part of sending a resized file if that is what is requested
            else {
                //First check if the cache already exists and make it if needed
                try {
                    await fs.access(cachePath);
                } catch (err) {
                    try {
                        await fs.mkdir(cachePath);
                    } catch (dirError) {
                        res.status(500).send('Error creating cache directory');
                        console.log(dirError);
                        return;
                    }
                }

                //Next check the cache to see if the requested file already exists
                //Finally, send the file if it exists in cache or make it and then send it
                const cachelist = await fs.readdir(cachePath);
                const resizedFileName =
                    req.params.id.slice(0, -4) +
                    'size' +
                    width +
                    'x' +
                    height +
                    req.params.id.slice(-4);
                if (cachelist.includes(resizedFileName)) {
                    res.status(200).sendFile(resizedFileName, {
                        root: cachePath,
                    });
                } else {
                    try {
                        await img_proc.resize(
                            path.join(imagesPath, req.params.id),
                            path.join(cachePath, resizedFileName),
                            width,
                            height
                        );
                        res.status(200).sendFile(resizedFileName, {
                            root: cachePath,
                        });
                    } catch (err) {
                        console.log(err);
                        res.status(500).send(
                            'File resizing encountered an error.'
                        );
                        return;
                    }
                }
            }
        } catch (err) {
            console.log(err);
            res.status(500).send("Files couldn't be read");
        }
    }
);

export default images;
