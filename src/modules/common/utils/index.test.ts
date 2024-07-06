import { success } from ".";

describe("Custom reusable fn", () => {
    test("Success response fn returns valid responses", () => {
        const data = {
            man: 'max'
        }
        const response = success('Test provided', data);
        expect(response).toHaveProperty(['message']);
        expect(response).toStrictEqual({data: data, message: 'Test provided', status: true });
    })
});
