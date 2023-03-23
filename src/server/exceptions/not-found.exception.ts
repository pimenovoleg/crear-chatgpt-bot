import HttpException from './http.exception';

export default class NotFoundException extends HttpException {
    constructor() {
        super(404, 'Not found');
    }
}
