"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
describe('QueueSphere Server API Suite', () => {
    it('GET /api/v1/health - should return 200 OK and health payload', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.message).toContain('QueueSphere API Service is healthy');
    });
    it('POST /api/v1/auth/login - should validate missing fields', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/auth/login').send({});
        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
        expect(res.body.message).toContain('email and password');
    });
    it('POST /api/v1/tokens/kiosk - should validate missing branchId', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/tokens/kiosk').send({
            priority: 'NORMAL',
        });
        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
    });
    it('POST /api/v1/tokens/call-next - should require authentication', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/tokens/call-next').send({});
        expect(res.status).toBe(401);
        expect(res.body.status).toBe('error');
        expect(res.body.message).toContain('Authentication required');
    });
});
