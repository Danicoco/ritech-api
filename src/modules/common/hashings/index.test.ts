import { createHash215 } from "./index"

describe('Other hashings', () => {
    test('SHA512 Validated', () => {
        const hash = createHash215('password');
        expect(hash).toStrictEqual('b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86');
    })
})
