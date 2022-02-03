import express from 'express';
import images from './api/images';

const routes = express.Router();

routes.get('/', (req: express.Request, res: express.Response): void => {
    res.send(
        'Main api route.  Go to api/images for list of stored files' +
            ' and then api/images/filename for a specific file.  <br>To resize a file' +
            ' use query strings on the filename path.  <br>As an example visit' +
            ' api/images/image1.jpg?width=600&height=400.'
    );
});

routes.use('/images', images);

export default routes;
