import { reportIgnoredError } from '../ignoreError';

describe('reportIgnoredError', () => {
    const originalDev = global.__DEV__;
    let warn;

    beforeEach(() => {
        warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warn.mockRestore();
        global.__DEV__ = originalDev;
    });

    it('prints the context and the error message in development', () => {
        global.__DEV__ = true;
        reportIgnoredError('useLoginViewModel.removeToken', new Error('storage unavailable'));
        expect(warn).toHaveBeenCalledWith('[ignored] useLoginViewModel.removeToken: storage unavailable');
    });

    it('accepts values that are not Error instances', () => {
        global.__DEV__ = true;
        reportIgnoredError('ctx', 'plain string');
        expect(warn).toHaveBeenCalledWith('[ignored] ctx: plain string');
    });

    it('prints nothing in release builds', () => {
        global.__DEV__ = false;
        reportIgnoredError('ctx', new Error('secret detail'));
        expect(warn).not.toHaveBeenCalled();
    });

    it('never throws, whatever it receives', () => {
        global.__DEV__ = true;
        expect(() => reportIgnoredError('ctx', undefined)).not.toThrow();
        expect(() => reportIgnoredError('ctx', null)).not.toThrow();
    });
});
