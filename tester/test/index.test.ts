import { APP_NAME as exact } from '@utils';
import { APP_NAME as folder } from '@utils/constants';

describe('My first test', () => {
    it('Hello', () => {
        expect(exact).toBe(folder);
    });
});