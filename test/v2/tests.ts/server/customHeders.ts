import { Test } from '../Type';
import axios from 'axios';

export default (async (info, isValid) => {
    const server = info.init(1, {
        headers: {
            test: 'ok!!',
            test2: 'ok 2',
            'Test-Array': ['ok1', 'ok2'],
        },
    } as any);

    try {
        const response = await axios({
            url: `http://localhost:${info.port}/`,
            method: 'PROPFIND',
        });

        const headers = response.headers;
        const testHeader = headers['test'];
        const test2Header = headers['test2'];
        const testArrayHeader = headers['test-array'];

        const isValidHeaders =
            testHeader === 'ok!!' &&
            test2Header === 'ok 2' &&
            testArrayHeader === 'ok1, ok2';

        isValid(isValidHeaders, 'Headers from server options are not provided correctly');
    } catch (error) {
        isValid(false, `Error occurred: ${error.message}`);
    }
}) as Test;