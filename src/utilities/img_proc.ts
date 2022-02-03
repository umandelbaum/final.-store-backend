import sharp from 'sharp';

const resize = (
    inputPath: string,
    outputPath: string,
    width: number,
    height: number
): Promise<sharp.OutputInfo> => {
    return sharp(inputPath).resize(width, height).toFile(outputPath);
};

export = { resize };
