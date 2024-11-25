

export const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).json({ errorMessage: 'Internal Server Error' });
}